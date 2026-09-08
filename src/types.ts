export type UserRole = 'super_root' | 'admin' | 'cajero';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  pin?: string;
  phone?: string;
  avatar?: string;
  status?: 'active' | 'inactive';
}

export interface TenantLicense {
  planName: string; // e.g. "Plan Emprendedor S/ 30"
  priceMonthly: number; // 30
  maxUsers: number; // 2 (1 Admin + 1 Vendedor)
  status: 'active' | 'trial' | 'suspended';
  renewsAt?: string;
  billingWhatsApp?: string;
}

export interface RegisteredTenant {
  id: string;
  storeName: string;
  sectorId: string;
  ownerName: string;
  phone: string;
  maxUsers: number;
  status: 'active' | 'trial' | 'suspended';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name, e.g. "ShoppingBag", "Coffee", etc.
  description?: string;
}

export interface ComboComponent {
  productId: string;
  quantity: number;
}

export interface ProductVariant {
  id: string; // e.g. "var-1"
  name: string; // e.g. "Talla S", "Talla M", "38", "39", "Rojo - M"
  sku?: string;
  stock: number;
  salePrice?: number; // Optional custom price for variant
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit?: string;
  isBulk?: boolean; // Producto a granel / peso / balanza / fraccionable por dinero (Soles)
  packageKg?: number; // Factor de empaque / saco (ej. Saco de 50kg)
  type?: 'standard' | 'combo';
  comboItems?: ComboComponent[];
  hasVariants?: boolean;
  variants?: ProductVariant[];
}

export interface CartItem {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  discount: number; // Amount or percentage discount applied to item
}

export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'mixed';

export interface PaymentDetail {
  method: 'cash' | 'card' | 'wallet';
  amount: number;
  reference?: string;
}

export interface SaleItemComboComponent {
  productId: string;
  productName: string;
  quantity: number;
  sku?: string;
}

export interface SaleItem {
  productId: string;
  variantId?: string;
  variantName?: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number; // Saved at sale time for accurate profit calculation
  discount: number;
  subtotal: number;
  isCombo?: boolean;
  comboComponents?: SaleItemComboComponent[];
}

export interface Sale {
  id: string;
  ticketNumber: string;
  shiftId?: string; // Associated cash register shift session
  date: string; // ISO String
  cashierId: string;
  cashierName: string;
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  payments: PaymentDetail[];
  amountPaid: number;
  changeAmount: number;
  customerName?: string;
}

export interface CashShift {
  id: string;
  shiftNumber: string; // e.g. "TUR-001"
  cashierId: string;
  cashierName: string;
  openedAt: string; // ISO String
  closedAt?: string | null; // ISO String or null if open
  initialCash: number; // Fondo inicial de apertura en caja
  status: 'open' | 'closed';
  notes?: string;
  finalCashCounted?: number; // Efectivo real contado al cierre
  finalCashExpected?: number; // Fondo inicial + ventas en efectivo
  difference?: number; // counted - expected
}

export interface Supplier {
  id: string;
  name: string;
  ruc: string;
  phone: string;
  email?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  previousCost?: number;
  newSalePrice?: number;
  previousSalePrice?: number;
  subtotal: number;
}

export type PurchaseDocType = 'factura' | 'boleta' | 'recibo' | 'guia';
export type PurchasePaymentStatus = 'pagado' | 'credito' | 'parcial';

export interface PurchasePaymentRecord {
  id: string;
  date: string; // ISO String
  amount: number;
  method: 'cash' | 'card' | 'wallet' | 'transfer';
  reference?: string;
  notes?: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string; // Internal code e.g. COM-00085
  date: string; // ISO String of registration

  // Supplier document details
  documentType: PurchaseDocType; // 'factura' | 'boleta' | 'recibo' | 'guia'
  documentNumber: string; // e.g. "F001-0004523", "B001-001290", "REC-9981"
  documentDate: string; // Date of supplier document (YYYY-MM-DD or ISO)

  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  total: number;

  // Payment condition & status
  paymentStatus: PurchasePaymentStatus; // 'pagado' | 'credito' | 'parcial'
  paymentMethod?: 'cash' | 'card' | 'wallet' | 'transfer' | 'credit';
  amountPaid: number; // Total amount paid so far
  pendingAmount: number; // Remaining debt: total - amountPaid
  dueDate?: string; // Optional due date for credit purchases
  paymentHistory?: PurchasePaymentRecord[];

  notes?: string;
}

export type NavigationModule = 'ventas' | 'inventario' | 'compras' | 'reportes' | 'mis_ventas' | 'configuracion' | 'super_root';
