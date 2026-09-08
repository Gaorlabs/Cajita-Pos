import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Category,
  Product,
  ProductVariant,
  CartItem,
  Sale,
  Purchase,
  Supplier,
  NavigationModule,
  PaymentDetail,
  SaleItem,
  SaleItemComboComponent,
  PurchaseItem,
  CashShift,
  PurchaseDocType,
  PurchasePaymentStatus,
  PurchasePaymentRecord,
  TenantLicense,
  RegisteredTenant,
  CashDenominationCount,
  ShiftCashMovement,
  BlindAuditRecord,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_PURCHASES,
  INITIAL_SUPPLIERS,
  INITIAL_SHIFTS,
  INITIAL_LICENSE,
  INITIAL_TENANTS,
} from '../data/mockData';
import {
  BusinessSectorId,
  BusinessSectorConfig,
  BUSINESS_SECTORS,
} from '../data/businessSectors';
import { SECTOR_CATALOGS } from '../data/sectorCatalogs';
import { getEffectiveStock } from '../utils/comboUtils';

export interface AddPurchaseParams {
  supplierId: string;
  items: {
    productId: string;
    quantity: number;
    unitCost: number;
    newSalePrice?: number;
    previousCost?: number;
    previousSalePrice?: number;
  }[];
  documentType?: PurchaseDocType;
  documentNumber?: string;
  documentDate?: string;
  paymentStatus?: PurchasePaymentStatus;
  paymentMethod?: 'cash' | 'card' | 'wallet' | 'transfer' | 'credit';
  amountPaid?: number;
  dueDate?: string;
  notes?: string;
}

export interface StoreProfile {
  name: string;
  ruc: string;
  address: string;
  phone: string;
}

interface PosContextType {
  currentUser: User | null;
  activeModule: NavigationModule;
  setActiveModule: (module: NavigationModule) => void;
  categories: Category[];
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  suppliers: Supplier[];
  cart: CartItem[];
  shifts: CashShift[];
  activeShift: CashShift | null;

  // Business Sector & Store Profile
  businessSector: BusinessSectorId;
  sectorConfig: BusinessSectorConfig;
  storeProfile: StoreProfile;
  setBusinessSector: (sectorId: BusinessSectorId, loadSampleCatalog?: boolean) => void;
  updateStoreProfile: (profile: Partial<StoreProfile>) => void;
  registerTenant: (businessName: string, sectorId: BusinessSectorId, adminName: string, autoLogin?: boolean) => void;
  isDemoTour: boolean;
  setIsDemoTour: (val: boolean) => void;
  
  // Users, License & SaaS Multi-tenant
  users: User[];
  license: TenantLicense;
  tenants: RegisteredTenant[];
  addUser: (user: Omit<User, 'id'>) => { success: boolean; error?: string };
  updateUser: (user: User) => { success: boolean; error?: string };
  deleteUser: (userId: string) => { success: boolean; error?: string };
  updateTenantLicense: (tenantId: string, maxUsers: number, status: 'active' | 'trial' | 'suspended') => void;

  // Auth
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Shifts / Cash sessions & Arqueo Ciego (Anti-Robo y Cero Pérdidas)
  openCashShift: (initialCash: number, notes?: string) => CashShift;
  closeCashShift: (
    shiftId: string,
    finalCashCounted: number,
    notes?: string,
    blindAuditDetails?: {
      denominations?: CashDenominationCount;
      declaredCardVouchers?: number;
      declaredCardCount?: number;
      declaredWalletAmount?: number;
      declaredWalletCount?: number;
      discrepancyReason?: string;
      supervisorName?: string;
      supervisorApproved?: boolean;
    }
  ) => CashShift;
  addCashMovement: (
    shiftId: string,
    movement: Omit<ShiftCashMovement, 'id' | 'shiftId' | 'timestamp' | 'userName'>
  ) => ShiftCashMovement | null;
  recordBlindAudit: (
    shiftId: string,
    auditData: Omit<BlindAuditRecord, 'id' | 'shiftId' | 'timestamp'>
  ) => BlindAuditRecord | null;
  
  // POS Cart
  addToCart: (product: Product, quantity?: number, selectedVariant?: ProductVariant) => void;
  updateCartQty: (productId: string, quantity: number, variantId?: string) => void;
  updateCartDiscount: (productId: string, discount: number, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  completeSale: (
    payments: PaymentDetail[],
    customerName?: string,
    actualAmountPaid?: number
  ) => Sale | null;
  
  // Inventory CRUD
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  // Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  
  // Purchases
  addPurchase: (params: AddPurchaseParams) => Purchase | null;
  addPurchasePayment: (
    purchaseId: string,
    payment: {
      amount: number;
      method: 'cash' | 'card' | 'wallet' | 'transfer';
      reference?: string;
      notes?: string;
    }
  ) => Purchase | null;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;

  // Helpers
  getLowStockProducts: () => Product[];
  resetToInitialData: (sectorOverride?: BusinessSectorId) => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'cajita_pos_app_state_v5';

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from local storage or fallback to mock data
  const loadInitialState = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sector: BusinessSectorId = parsed.businessSector && BUSINESS_SECTORS[parsed.businessSector as BusinessSectorId]
          ? parsed.businessSector
          : 'bodega';
        const savedProducts: Product[] = parsed.products || INITIAL_PRODUCTS;

        return {
          user: parsed.user || null,
          users: parsed.users || INITIAL_USERS,
          license: parsed.license || INITIAL_LICENSE,
          tenants: parsed.tenants || INITIAL_TENANTS,
          businessSector: sector,
          storeProfile: parsed.storeProfile || BUSINESS_SECTORS[sector].storeInfo,
          categories: parsed.categories || INITIAL_CATEGORIES,
          products: savedProducts,
          sales: parsed.sales || INITIAL_SALES,
          purchases: parsed.purchases || INITIAL_PURCHASES,
          suppliers: parsed.suppliers || INITIAL_SUPPLIERS,
          shifts: parsed.shifts || INITIAL_SHIFTS,
        };
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }

    const defaultSector: BusinessSectorId = 'bodega';
    return {
      user: null,
      users: INITIAL_USERS,
      license: INITIAL_LICENSE,
      tenants: INITIAL_TENANTS,
      businessSector: defaultSector,
      storeProfile: BUSINESS_SECTORS[defaultSector].storeInfo,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      sales: INITIAL_SALES,
      purchases: INITIAL_PURCHASES,
      suppliers: INITIAL_SUPPLIERS,
      shifts: INITIAL_SHIFTS,
    };
  };

  const initial = loadInitialState();

  const [currentUser, setCurrentUser] = useState<User | null>(initial.user);
  const [users, setUsers] = useState<User[]>(initial.users);
  const [license, setLicense] = useState<TenantLicense>(initial.license);
  const [tenants, setTenants] = useState<RegisteredTenant[]>(initial.tenants);
  const [activeModule, setActiveModule] = useState<NavigationModule>('ventas');
  const [businessSector, setBusinessSectorState] = useState<BusinessSectorId>(initial.businessSector);
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(initial.storeProfile);
  const [categories, setCategories] = useState<Category[]>(initial.categories);
  const [products, setProducts] = useState<Product[]>(initial.products);
  const [sales, setSales] = useState<Sale[]>(initial.sales);
  const [purchases, setPurchases] = useState<Purchase[]>(initial.purchases);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initial.suppliers);
  const [shifts, setShifts] = useState<CashShift[]>(initial.shifts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDemoTour, setIsDemoTour] = useState<boolean>(false);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cajita_pos_dark_mode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cajita_pos_dark_mode', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Active shift is the currently open shift
  const activeShift = shifts.find((s) => s.status === 'open') || null;

  // Current sector config
  const sectorConfig = BUSINESS_SECTORS[businessSector] || BUSINESS_SECTORS.general;

  // Persist state to local storage when core entities change
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          user: currentUser,
          users,
          license,
          tenants,
          businessSector,
          storeProfile,
          categories,
          products,
          sales,
          purchases,
          suppliers,
          shifts,
        })
      );
    } catch (e) {
      console.error('Failed to persist POS state', e);
    }
  }, [currentUser, users, license, tenants, businessSector, storeProfile, categories, products, sales, purchases, suppliers, shifts]);

  // Adjust module if user switches role
  useEffect(() => {
    if (currentUser?.role === 'cajero' && (activeModule === 'inventario' || activeModule === 'compras' || activeModule === 'reportes' || activeModule === 'configuracion' || activeModule === 'super_root')) {
      setActiveModule('ventas');
    }
  }, [currentUser, activeModule]);

  // Business Sector changer
  const setBusinessSector = (sectorId: BusinessSectorId, loadSampleCatalog: boolean = true) => {
    setBusinessSectorState(sectorId);
    const sec = BUSINESS_SECTORS[sectorId] || BUSINESS_SECTORS.general;
    
    // Update store profile with suggested data for that sector
    setStoreProfile({
      name: sec.storeInfo.storeName,
      ruc: sec.storeInfo.ruc,
      address: sec.storeInfo.address,
      phone: sec.storeInfo.phone,
    });

    if (loadSampleCatalog && SECTOR_CATALOGS[sectorId]) {
      const template = SECTOR_CATALOGS[sectorId];
      setCategories(template.categories);
      setProducts(template.products);
      if (template.suppliers && template.suppliers.length > 0) {
        setSuppliers(template.suppliers);
      }
      setCart([]);
    }
  };

  const updateStoreProfile = (profile: Partial<StoreProfile>) => {
    setStoreProfile((prev) => ({ ...prev, ...profile }));
  };

  // Auth & User Management
  const login = (username: string, pass: string): boolean => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check Super Root bypass credentials (PIN 1982 or root/super_root)
    if (cleanPass === '1982' || cleanPass === '9999' || (cleanUser === 'root' || cleanUser === 'super_root') && (cleanPass === '123' || !cleanPass)) {
      const rootUser = users.find((u) => u.role === 'super_root') || INITIAL_USERS.find((u) => u.role === 'super_root') || {
        id: 'user-root',
        username: 'root',
        name: 'Super Root (Dueño SaaS)',
        role: 'super_root' as const,
        pin: '1982',
        phone: '999 888 777',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        status: 'active' as const,
      };
      setCurrentUser(rootUser);
      setActiveModule('super_root');
      return true;
    }

    // Check by username or user id in current tenant's users
    const found =
      users.find((u) => u.username.toLowerCase() === cleanUser || u.id === username) ||
      INITIAL_USERS.find((u) => u.username.toLowerCase() === cleanUser || u.id === username);

    if (found) {
      if (found.status === 'inactive') {
        return false;
      }
      if (cleanPass && found.pin && found.pin !== cleanPass && cleanPass !== '123') {
        return false;
      }
      setCurrentUser(found);
      setActiveModule(found.role === 'super_root' ? 'super_root' : 'ventas');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
  };

  const addUser = (userData: Omit<User, 'id'>): { success: boolean; error?: string } => {
    // Count active non-root users
    const activeCount = users.filter((u) => u.status !== 'inactive' && u.role !== 'super_root').length;
    if (activeCount >= license.maxUsers) {
      return {
        success: false,
        error: `Has alcanzado el límite máximo de ${license.maxUsers} usuarios permitidos en tu ${license.planName} (1 Admin + 1 Vendedor). Para habilitar más vendedores o cajas, contacta a soporte por WhatsApp.`,
      };
    }

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      status: userData.status || 'active',
      pin: userData.pin || '123',
    };

    setUsers((prev) => [...prev, newUser]);
    return { success: true };
  };

  const updateUser = (updated: User): { success: boolean; error?: string } => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
    }
    return { success: true };
  };

  const deleteUser = (userId: string): { success: boolean; error?: string } => {
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, error: 'Usuario no encontrado' };

    // Prevent deleting last admin
    if (target.role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin' && u.id !== userId).length;
      if (adminCount === 0) {
        return { success: false, error: 'No puedes eliminar al único Administrador de la tienda.' };
      }
    }

    if (currentUser?.id === userId) {
      return { success: false, error: 'No puedes eliminar el usuario con el que tienes sesión iniciada.' };
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    return { success: true };
  };

  const updateTenantLicense = (
    tenantId: string,
    maxUsers: number,
    status: 'active' | 'trial' | 'suspended'
  ) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, maxUsers, status } : t))
    );
    setLicense((prev) => ({
      ...prev,
      maxUsers,
      status,
    }));
  };

  // Cash Shifts / Sesiones de Caja
  const openCashShift = (initialCash: number, notes?: string): CashShift => {
    const shiftNumber = `TUR-${String(shifts.length + 1).padStart(3, '0')}`;
    const newShift: CashShift = {
      id: `shift-${Date.now()}`,
      shiftNumber,
      cashierId: currentUser?.id || 'unknown',
      cashierName: currentUser?.name || 'Cajero',
      openedAt: new Date().toISOString(),
      closedAt: null,
      initialCash,
      status: 'open',
      notes: notes || '',
    };

    setShifts((prev) => [newShift, ...prev]);
    return newShift;
  };

  const addCashMovement = (
    shiftId: string,
    movement: Omit<ShiftCashMovement, 'id' | 'shiftId' | 'timestamp' | 'userName'>
  ): ShiftCashMovement | null => {
    const newMovement: ShiftCashMovement = {
      ...movement,
      id: `mov-${Date.now()}`,
      shiftId,
      timestamp: new Date().toISOString(),
      userName: currentUser?.name || 'Usuario',
    };

    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === shiftId) {
          const updatedMovements = [...(s.movements || []), newMovement];
          return {
            ...s,
            movements: updatedMovements,
          };
        }
        return s;
      })
    );

    return newMovement;
  };

  const recordBlindAudit = (
    shiftId: string,
    auditData: Omit<BlindAuditRecord, 'id' | 'shiftId' | 'timestamp'>
  ): BlindAuditRecord | null => {
    const newAudit: BlindAuditRecord = {
      ...auditData,
      id: `audit-${Date.now()}`,
      shiftId,
      timestamp: new Date().toISOString(),
    };

    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === shiftId) {
          return {
            ...s,
            audits: [...(s.audits || []), newAudit],
          };
        }
        return s;
      })
    );

    return newAudit;
  };

  const closeCashShift = (
    shiftId: string,
    finalCashCounted: number,
    notes?: string,
    blindAuditDetails?: {
      denominations?: CashDenominationCount;
      declaredCardVouchers?: number;
      declaredCardCount?: number;
      declaredWalletAmount?: number;
      declaredWalletCount?: number;
      discrepancyReason?: string;
      supervisorName?: string;
      supervisorApproved?: boolean;
    }
  ): CashShift => {
    const shiftSales = sales.filter((s) => s.shiftId === shiftId);
    const cashCollected = shiftSales.reduce((sum, s) => {
      const cashPayments = s.payments.filter((p) => p.method === 'cash');
      const cashSum = cashPayments.reduce((pSum, p) => pSum + p.amount, 0);
      return sum + cashSum;
    }, 0);

    const targetShift = shifts.find((s) => s.id === shiftId);
    const initialCash = targetShift ? targetShift.initialCash : 0;
    
    // Consider petty cash inflows and outflows
    const shiftMovements = targetShift?.movements || [];
    const totalInflows = shiftMovements.filter((m) => m.type === 'inflow').reduce((sum, m) => sum + m.amount, 0);
    const totalOutflows = shiftMovements.filter((m) => m.type === 'outflow').reduce((sum, m) => sum + m.amount, 0);
    
    const finalCashExpected = Math.round((initialCash + cashCollected + totalInflows - totalOutflows) * 100) / 100;
    const difference = Math.round((finalCashCounted - finalCashExpected) * 100) / 100;
    const auditResult: 'balanced' | 'surplus' | 'shortage' =
      Math.abs(difference) < 0.05 ? 'balanced' : difference > 0 ? 'surplus' : 'shortage';

    let updatedShift: CashShift | null = null;

    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === shiftId) {
          const auditRecord: BlindAuditRecord = {
            id: `audit-${Date.now()}`,
            shiftId,
            timestamp: new Date().toISOString(),
            auditType: 'close',
            cashierId: s.cashierId,
            cashierName: s.cashierName,
            supervisorName: blindAuditDetails?.supervisorName,
            denominations: blindAuditDetails?.denominations || {},
            declaredCash: finalCashCounted,
            declaredCardVouchers: blindAuditDetails?.declaredCardVouchers,
            declaredCardCount: blindAuditDetails?.declaredCardCount,
            declaredWalletAmount: blindAuditDetails?.declaredWalletAmount,
            declaredWalletCount: blindAuditDetails?.declaredWalletCount,
            expectedCash: finalCashExpected,
            difference,
            auditResult,
            discrepancyReason: blindAuditDetails?.discrepancyReason,
            supervisorApproved: blindAuditDetails?.supervisorApproved,
            notes,
          };

          updatedShift = {
            ...s,
            status: 'closed',
            closedAt: new Date().toISOString(),
            finalCashCounted,
            finalCashExpected,
            difference,
            notes: notes !== undefined ? notes : s.notes,
            isBlindAudit: true,
            denominations: blindAuditDetails?.denominations,
            declaredCardVouchers: blindAuditDetails?.declaredCardVouchers,
            declaredCardCount: blindAuditDetails?.declaredCardCount,
            declaredWalletAmount: blindAuditDetails?.declaredWalletAmount,
            declaredWalletCount: blindAuditDetails?.declaredWalletCount,
            auditResult,
            discrepancyReason: blindAuditDetails?.discrepancyReason,
            supervisorName: blindAuditDetails?.supervisorName,
            supervisorApproved: blindAuditDetails?.supervisorApproved,
            audits: [...(s.audits || []), auditRecord],
          };
          return updatedShift;
        }
        return s;
      })
    );

    return (
      updatedShift || {
        id: shiftId,
        shiftNumber: 'TUR-000',
        cashierId: '',
        cashierName: '',
        openedAt: new Date().toISOString(),
        closedAt: new Date().toISOString(),
        initialCash: 0,
        status: 'closed',
        finalCashCounted,
        finalCashExpected,
        difference,
        isBlindAudit: true,
        auditResult,
      }
    );
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, selectedVariant?: ProductVariant) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          ((!item.selectedVariant && !selectedVariant) || (item.selectedVariant?.id === selectedVariant?.id))
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id &&
          ((!item.selectedVariant && !selectedVariant) || (item.selectedVariant?.id === selectedVariant?.id))
            ? { ...item, quantity: Math.round((item.quantity + quantity) * 1000) / 1000 }
            : item
        );
      }
      return [...prev, { product, selectedVariant, quantity, discount: 0 }];
    });
  };

  const updateCartQty = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId &&
        ((!item.selectedVariant && !variantId) || item.selectedVariant?.id === variantId)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateCartDiscount = (productId: string, discount: number, variantId?: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId &&
        ((!item.selectedVariant && !variantId) || item.selectedVariant?.id === variantId)
          ? { ...item, discount: Math.max(0, discount) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            ((!item.selectedVariant && !variantId) || item.selectedVariant?.id === variantId)
          )
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Complete Sale with inventory deduction
  const completeSale = (
    payments: PaymentDetail[],
    customerName?: string,
    actualAmountPaid?: number
  ): Sale | null => {
    if (cart.length === 0 || !currentUser) return null;

    let subtotal = 0;
    let discountTotal = 0;

    const items: SaleItem[] = cart.map((ci) => {
      const itemPrice = ci.selectedVariant?.salePrice ?? ci.product.salePrice;
      const itemSubtotal = ci.quantity * itemPrice;
      const itemDiscount = (itemSubtotal * (ci.discount || 0)) / 100;
      const finalItemTotal = itemSubtotal - itemDiscount;

      subtotal += itemSubtotal;
      discountTotal += itemDiscount;

      let comboComponents: SaleItemComboComponent[] | undefined = undefined;
      if (ci.product.type === 'combo' && ci.product.comboItems) {
        comboComponents = ci.product.comboItems.map((comp) => {
          const matchedProd = products.find((p) => p.id === comp.productId);
          return {
            productId: comp.productId,
            productName: matchedProd?.name || 'Componente',
            quantity: comp.quantity * ci.quantity,
            sku: matchedProd?.sku,
          };
        });
      }

      const variantName = ci.selectedVariant ? ci.selectedVariant.name : undefined;
      const fullProductName = ci.selectedVariant
        ? `${ci.product.name} - ${ci.selectedVariant.name}`
        : ci.product.name;
      const itemSku = ci.selectedVariant?.sku || ci.product.sku;

      return {
        productId: ci.product.id,
        variantId: ci.selectedVariant?.id,
        variantName,
        productName: fullProductName,
        sku: itemSku,
        quantity: ci.quantity,
        unitPrice: itemPrice,
        purchasePrice: ci.product.purchasePrice,
        discount: ci.discount,
        subtotal: finalItemTotal,
        isCombo: ci.product.type === 'combo',
        comboComponents,
      };
    });

    const total = subtotal - discountTotal;
    const paid = actualAmountPaid !== undefined ? actualAmountPaid : payments.reduce((sum, p) => sum + p.amount, 0);
    const changeAmount = Math.max(0, paid - total);

    const ticketNumber = `T-${String(sales.length + 1001).padStart(6, '0')}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      ticketNumber,
      shiftId: activeShift?.id,
      date: new Date().toISOString(),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      items,
      subtotal,
      discountTotal,
      total,
      payments,
      amountPaid: paid,
      changeAmount,
      customerName: customerName || 'Público General',
    };

    // Deduct stock for all purchased items
    setProducts((prev) => {
      const updated = [...prev];

      for (const cartItem of cart) {
        if (cartItem.product.type === 'combo' && cartItem.product.comboItems) {
          for (const comp of cartItem.product.comboItems) {
            const idx = updated.findIndex((p) => p.id === comp.productId);
            if (idx !== -1) {
              const qtyToDeduct = comp.quantity * cartItem.quantity;
              updated[idx] = {
                ...updated[idx],
                stock: Math.max(0, Math.round((updated[idx].stock - qtyToDeduct) * 1000) / 1000),
              };
            }
          }
        } else {
          const idx = updated.findIndex((p) => p.id === cartItem.product.id);
          if (idx !== -1) {
            const prod = updated[idx];
            if (prod.hasVariants && prod.variants && cartItem.selectedVariant) {
              // Deduct from specific variant
              const updatedVariants = prod.variants.map((v) => {
                if (v.id === cartItem.selectedVariant?.id) {
                  return {
                    ...v,
                    stock: Math.max(0, Math.round((v.stock - cartItem.quantity) * 1000) / 1000),
                  };
                }
                return v;
              });
              const totalVariantStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
              updated[idx] = {
                ...prod,
                variants: updatedVariants,
                stock: totalVariantStock,
              };
            } else {
              updated[idx] = {
                ...prod,
                stock: Math.max(0, Math.round((prod.stock - cartItem.quantity) * 1000) / 1000),
              };
            }
          }
        }
      }

      return updated;
    });

    // Record sale
    setSales((prev) => [newSale, ...prev]);
    clearCart();

    return newSale;
  };

  // Inventory CRUD
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (updatedProd: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Category CRUD
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (updatedCat: Category) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Purchases
  const addPurchase = (params: AddPurchaseParams): Purchase | null => {
    if (!currentUser || params.items.length === 0) return null;

    const supplier = suppliers.find((s) => s.id === params.supplierId);
    if (!supplier) return null;

    let total = 0;
    const purchaseItems: PurchaseItem[] = [];

    const updatedProducts = [...products];

    for (const item of params.items) {
      const prodIndex = updatedProducts.findIndex((p) => p.id === item.productId);
      if (prodIndex === -1) continue;

      const currentProd = updatedProducts[prodIndex];
      const itemSubtotal = item.quantity * item.unitCost;
      total += itemSubtotal;

      purchaseItems.push({
        productId: currentProd.id,
        productName: currentProd.name,
        sku: currentProd.sku,
        quantity: item.quantity,
        unitCost: item.unitCost,
        previousCost: currentProd.purchasePrice,
        newSalePrice: item.newSalePrice,
        previousSalePrice: currentProd.salePrice,
        subtotal: itemSubtotal,
      });

      // Update inventory stock and costs
      updatedProducts[prodIndex] = {
        ...currentProd,
        stock: Math.round((currentProd.stock + item.quantity) * 1000) / 1000,
        purchasePrice: item.unitCost,
        salePrice: item.newSalePrice !== undefined && item.newSalePrice > 0 ? item.newSalePrice : currentProd.salePrice,
      };
    }

    setProducts(updatedProducts);

    const docType = params.documentType || 'factura';
    const docNumber = params.documentNumber || `F001-${String(purchases.length + 101).padStart(6, '0')}`;
    const docDate = params.documentDate || new Date().toISOString().split('T')[0];
    const pStatus = params.paymentStatus || 'pagado';
    const pMethod = params.paymentMethod || 'cash';
    const initialPaid = pStatus === 'pagado' ? total : (params.amountPaid || 0);
    const pendingAmount = Math.max(0, total - initialPaid);

    const paymentHistory: PurchasePaymentRecord[] = [];
    if (initialPaid > 0) {
      paymentHistory.push({
        id: `pay-${Date.now()}`,
        date: new Date().toISOString(),
        amount: initialPaid,
        method: pMethod === 'credit' ? 'cash' : (pMethod as any),
        reference: 'Pago inicial en registro',
      });
    }

    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseNumber: `COM-${String(purchases.length + 1).padStart(5, '0')}`,
      date: new Date().toISOString(),
      documentType: docType,
      documentNumber: docNumber,
      documentDate: docDate,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: purchaseItems,
      total,
      paymentStatus: pStatus,
      paymentMethod: pMethod,
      amountPaid: initialPaid,
      pendingAmount,
      dueDate: params.dueDate,
      paymentHistory,
      notes: params.notes || '',
    };

    setPurchases((prev) => [newPurchase, ...prev]);
    return newPurchase;
  };

  const addPurchasePayment = (
    purchaseId: string,
    payment: {
      amount: number;
      method: 'cash' | 'card' | 'wallet' | 'transfer';
      reference?: string;
      notes?: string;
    }
  ): Purchase | null => {
    let updatedTarget: Purchase | null = null;

    setPurchases((prev) =>
      prev.map((pur) => {
        if (pur.id !== purchaseId) return pur;

        const newPaid = Math.min(pur.total, pur.amountPaid + payment.amount);
        const newPending = Math.max(0, pur.total - newPaid);
        const newStatus: PurchasePaymentStatus = newPending === 0 ? 'pagado' : 'parcial';

        const newRecord: PurchasePaymentRecord = {
          id: `pay-${Date.now()}`,
          date: new Date().toISOString(),
          amount: payment.amount,
          method: payment.method,
          reference: payment.reference,
          notes: payment.notes,
        };

        updatedTarget = {
          ...pur,
          amountPaid: newPaid,
          pendingAmount: newPending,
          paymentStatus: newStatus,
          paymentHistory: [...(pur.paymentHistory || []), newRecord],
        };

        return updatedTarget;
      })
    );

    return updatedTarget;
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>): Supplier => {
    const newSup: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
    };
    setSuppliers((prev) => [...prev, newSup]);
    return newSup;
  };

  // Low stock products helper
  const getLowStockProducts = () => {
    return products.filter((p) => p.stock <= p.minStock);
  };

  const resetToInitialData = (sectorOverride?: BusinessSectorId) => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const targetSector = sectorOverride || businessSector || 'bodega';
    const template = SECTOR_CATALOGS[targetSector] || SECTOR_CATALOGS.bodega;
    const sec = BUSINESS_SECTORS[targetSector] || BUSINESS_SECTORS.bodega;

    setBusinessSectorState(targetSector);
    setStoreProfile({
      name: sec.storeInfo.storeName,
      ruc: sec.storeInfo.ruc,
      address: sec.storeInfo.address,
      phone: sec.storeInfo.phone,
    });
    setCategories(template.categories);
    setProducts(template.products);
    setSales(INITIAL_SALES);
    setPurchases(INITIAL_PURCHASES);
    setSuppliers(template.suppliers || INITIAL_SUPPLIERS);
    setShifts(INITIAL_SHIFTS);
    setCart([]);
  };

  const registerTenant = (businessName: string, sectorId: BusinessSectorId, adminName: string, autoLogin: boolean = true) => {
    // 1. Reset data to that sector template
    resetToInitialData(sectorId);
    
    // 2. Set custom store name
    setStoreProfile({
      name: businessName,
      ruc: '2060' + Math.floor(1000000 + Math.random() * 9000000),
      address: 'Dirección Comercial Registrada',
      phone: '999-999-999',
    });
    
    // 3. Create initial 2 users for Plan Emprendedor S/ 30 (1 Admin + 1 Vendedor)
    const newAdminUser: User = {
      id: `usr-admin-${Date.now()}`,
      username: 'admin',
      name: adminName || 'Administrador (Dueño)',
      role: 'admin',
      pin: '123',
      phone: '999-999-999',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      status: 'active',
    };

    const newCashierUser: User = {
      id: `usr-cajero-${Date.now()}`,
      username: 'cajero',
      name: 'Vendedor Turno 1',
      role: 'cajero',
      pin: '123',
      phone: '999-999-999',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
      status: 'active',
    };

    const rootUser = users.find((u) => u.role === 'super_root') || INITIAL_USERS.find((u) => u.role === 'super_root')!;

    setUsers([newAdminUser, newCashierUser, rootUser]);
    if (autoLogin) {
      setCurrentUser(newAdminUser);
    }

    // 4. Register tenant in master list for Super Root
    const newTenant: RegisteredTenant = {
      id: `ten-${Date.now()}`,
      storeName: businessName,
      sectorId,
      ownerName: adminName,
      phone: '999-999-999',
      maxUsers: 2,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTenants((prev) => [newTenant, ...prev]);

    setLicense({
      planName: 'Plan Emprendedor S/ 30',
      priceMonthly: 30,
      maxUsers: 2,
      status: 'active',
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      billingWhatsApp: '999 888 777',
    });

    setActiveModule('ventas');
  };

  return (
    <PosContext.Provider
      value={{
        currentUser,
        activeModule,
        setActiveModule,
        users,
        license,
        tenants,
        addUser,
        updateUser,
        deleteUser,
        updateTenantLicense,
        categories,
        products,
        sales,
        purchases,
        suppliers,
        cart,
        shifts,
        activeShift,
        businessSector,
        sectorConfig,
        storeProfile,
        setBusinessSector,
        updateStoreProfile,
        registerTenant,
        isDemoTour,
        setIsDemoTour,
        openCashShift,
        closeCashShift,
        addCashMovement,
        recordBlindAudit,
        login,
        logout,
        darkMode,
        toggleDarkMode,
        addToCart,
        updateCartQty,
        updateCartDiscount,
        removeFromCart,
        clearCart,
        completeSale,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addPurchase,
        addPurchasePayment,
        addSupplier,
        getLowStockProducts,
        resetToInitialData,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
