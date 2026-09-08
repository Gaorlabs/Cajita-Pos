import { LucideIcon } from 'lucide-react';

export type BusinessSectorId =
  | 'bodega'      // Bodega, Minimarket, Abarrotes
  | 'farmacia'    // Farmacia, Botica
  | 'cafeteria'   // Cafetería, Panadería, Pastelería
  | 'ropa'        // Ropa, Calzado, Boutique
  | 'perfumeria'  // Perfumería, Cosméticos, Belleza
  | 'tecnologia'  // Tecnología, Cómputo, Accesorios, Celulares
  | 'general';    // Retail General

export interface BusinessSectorConfig {
  id: BusinessSectorId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string; // Lucide icon identifier
  color: string; // Accent color class
  badgeColor: string;
  bgLight: string;
  borderActive: string;
  
  // Feature flags to simplify and declutter UI
  features: {
    enableBulkSales: boolean;         // Balanza, Granel, Venta x Soles/Kg
    enableBulkSackPurchases: boolean; // Compras por Saco / Fardo
    enableCombos: boolean;            // Packs / Combos Odoo 19
    enablePharmaExpiry: boolean;      // Vencimientos y Lotes para boticas
    enableApparelVariants: boolean;   // Tallas y Colores
    enableVolumePacks: boolean;       // Presentaciones / Volúmenes (ml / oz)
    enableBarcodeQuickScanner: boolean; // Escáner de código de barras
    enableDailyShiftSummary: boolean; // Arqueo de caja rápido
    quickSalePresets: number[];       // Botones de monto rápido (ej. S/ 1, 2, 5)
    defaultUnit: string;              // Unidad por defecto
    suggestedUnits: string[];         // Unidades sugeridas
  };

  // Demo store information
  storeInfo: {
    storeName: string;
    ruc: string;
    address: string;
    phone: string;
  };
}

export const BUSINESS_SECTORS: Record<BusinessSectorId, BusinessSectorConfig> = {
  bodega: {
    id: 'bodega',
    name: 'Bodega & Minimarket (Abarrotes)',
    shortName: 'Bodega / Minimarket',
    tagline: 'Venta rápida por código de barras, balanza y venta por Soles',
    description: 'Optimizado para abarrotes, bebidas, venta a granel (arroz, azúcar por Soles/Kg) y compra por sacos.',
    icon: 'Store',
    color: 'emerald',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    bgLight: 'bg-emerald-50/40',
    borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20',
    features: {
      enableBulkSales: true,
      enableBulkSackPurchases: true,
      enableCombos: true,
      enablePharmaExpiry: false,
      enableApparelVariants: false,
      enableVolumePacks: false,
      enableBarcodeQuickScanner: true,
      enableDailyShiftSummary: true,
      quickSalePresets: [1, 2, 3, 5, 10],
      defaultUnit: 'unidad',
      suggestedUnits: ['unidad', 'kg', 'g', 'lata', 'botella', 'paquete', 'saco', 'jaba'],
    },
    storeInfo: {
      storeName: 'Minimarket & Bodega Don Pepe',
      ruc: '20601234567',
      address: 'Av. Los Próceres 450, San Juan de Lurigancho, Lima',
      phone: '(01) 456-7890',
    },
  },

  cafeteria: {
    id: 'cafeteria',
    name: 'Cafetería, Panadería & Pastelería',
    shortName: 'Cafetería / Panadería',
    tagline: 'Teclado táctil rápido, combos de desayuno y venta de pan/tortas',
    description: 'Menú visual táctil de cafés, postres, desayunos combinados y venta rápida de panes por peso o unidad.',
    icon: 'Coffee',
    color: 'amber',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    bgLight: 'bg-amber-50/40',
    borderActive: 'border-amber-500 ring-2 ring-amber-500/20',
    features: {
      enableBulkSales: true, // Panes y masas por peso
      enableBulkSackPurchases: true, // Harina por saco
      enableCombos: true, // Combos café + sandwich
      enablePharmaExpiry: false,
      enableApparelVariants: false,
      enableVolumePacks: false,
      enableBarcodeQuickScanner: false,
      enableDailyShiftSummary: true,
      quickSalePresets: [2, 5, 10, 15, 20],
      defaultUnit: 'unidad',
      suggestedUnits: ['unidad', 'porcion', 'taza', 'kg', 'vaso', 'rebanada', 'docena'],
    },
    storeInfo: {
      storeName: 'Café & Panadería La Esquina',
      ruc: '20608765432',
      address: 'Jr. de la Unión 380, Centro Histórico, Lima',
      phone: '(01) 427-1122',
    },
  },

  ropa: {
    id: 'ropa',
    name: 'Boutique, Ropa & Calzado',
    shortName: 'Ropa / Boutique / Calzado',
    tagline: 'Catálogo de prendas, tallas, colores y gestión de cambios',
    description: 'Sin balanzas ni sacos. Enfoque en código de etiqueta, tallas (S, M, L, XL), colores y liquidaciones de temporada.',
    icon: 'Shirt',
    color: 'indigo',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    bgLight: 'bg-indigo-50/40',
    borderActive: 'border-indigo-500 ring-2 ring-indigo-500/20',
    features: {
      enableBulkSales: false,
      enableBulkSackPurchases: false,
      enableCombos: true, // Outfits / 2x1
      enablePharmaExpiry: false,
      enableApparelVariants: true,
      enableVolumePacks: false,
      enableBarcodeQuickScanner: true,
      enableDailyShiftSummary: true,
      quickSalePresets: [20, 50, 100, 150],
      defaultUnit: 'prenda',
      suggestedUnits: ['prenda', 'unidad', 'par', 'docena', 'set', 'pack'],
    },
    storeInfo: {
      storeName: 'Boutique D’Moda Perú',
      ruc: '20559874123',
      address: 'Calle Cantuarias 160, Miraflores, Lima',
      phone: '(01) 241-8899',
    },
  },

  perfumeria: {
    id: 'perfumeria',
    name: 'Perfumería, Cosméticos & Belleza',
    shortName: 'Perfumería / Belleza',
    tagline: 'Presentaciones por volumen (30ml, 50ml, 100ml) y sets de regalo',
    description: 'Catálogo de fragancias, maquillaje, tratamientos y estuches de regalo con promociones y testers.',
    icon: 'Sparkles',
    color: 'rose',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    bgLight: 'bg-rose-50/40',
    borderActive: 'border-rose-500 ring-2 ring-rose-500/20',
    features: {
      enableBulkSales: false,
      enableBulkSackPurchases: false,
      enableCombos: true, // Sets de regalo (Perfume + Loción)
      enablePharmaExpiry: false,
      enableApparelVariants: false,
      enableVolumePacks: true,
      enableBarcodeQuickScanner: true,
      enableDailyShiftSummary: true,
      quickSalePresets: [25, 50, 100, 200],
      defaultUnit: 'frasco',
      suggestedUnits: ['frasco', 'unidad', 'set', 'tubo', 'caja', 'estuche'],
    },
    storeInfo: {
      storeName: 'Essence & Parfum Perú',
      ruc: '20491827364',
      address: 'Av. Larco 812, Miraflores, Lima',
      phone: '(01) 445-3344',
    },
  },

  farmacia: {
    id: 'farmacia',
    name: 'Farmacia & Botica',
    shortName: 'Farmacia / Botica',
    tagline: 'Venta por caja o blíster/tableta, principios activos y control de stock',
    description: 'Especializado en medicamentos de marca y genéricos, control de dosis por unidad/blíster y consulta rápida.',
    icon: 'Pill',
    color: 'teal',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    bgLight: 'bg-teal-50/40',
    borderActive: 'border-teal-500 ring-2 ring-teal-500/20',
    features: {
      enableBulkSales: false,
      enableBulkSackPurchases: false,
      enableCombos: true, // Packs de tratamiento
      enablePharmaExpiry: true,
      enableApparelVariants: false,
      enableVolumePacks: false,
      enableBarcodeQuickScanner: true,
      enableDailyShiftSummary: true,
      quickSalePresets: [5, 10, 20, 50],
      defaultUnit: 'caja',
      suggestedUnits: ['caja', 'blister', 'tableta', 'frasco', 'ampolla', 'tubo', 'sachet'],
    },
    storeInfo: {
      storeName: 'Botica & Salud San Martín',
      ruc: '20603456789',
      address: 'Av. Arequipa 2450, Lince, Lima',
      phone: '(01) 471-5566',
    },
  },

  tecnologia: {
    id: 'tecnologia',
    name: 'Tecnología, Cómputo & Accesorios',
    shortName: 'Tecnología / Cómputo',
    tagline: 'Venta por código/serie, accesorios, periféricos y garantías',
    description: 'Catálogo de smartphones, periféricos gamer, cables, memorias y cargadores con control de garantía y stock.',
    icon: 'Laptop',
    color: 'sky',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    bgLight: 'bg-sky-50/40',
    borderActive: 'border-sky-500 ring-2 ring-sky-500/20',
    features: {
      enableBulkSales: false,
      enableBulkSackPurchases: false,
      enableCombos: true, // Combos Gamer (Teclado + Mouse + Pad)
      enablePharmaExpiry: false,
      enableApparelVariants: true, // Variantes de capacidad (64GB/128GB/256GB) o color
      enableVolumePacks: false,
      enableBarcodeQuickScanner: true,
      enableDailyShiftSummary: true,
      quickSalePresets: [15, 25, 50, 100, 200],
      defaultUnit: 'unidad',
      suggestedUnits: ['unidad', 'set', 'pack', 'pieza', 'caja'],
    },
    storeInfo: {
      storeName: 'CyberTech & Cómputo Perú',
      ruc: '20609871234',
      address: 'Av. Wilson 1250 Int. 204, Cercado de Lima',
      phone: '(01) 433-2121',
    },
  },

  general: {
    id: 'general',
    name: 'Comercio General & Bazar',
    shortName: 'Comercio General',
    tagline: 'Modo completo con todas las herramientas disponibles',
    description: 'Ideal para bazares, ferreterías, librerías o tiendas multiservicio con todas las funciones activadas.',
    icon: 'LayoutGrid',
    color: 'neutral',
    badgeColor: 'bg-neutral-100 text-neutral-900 border-neutral-300',
    bgLight: 'bg-neutral-50',
    borderActive: 'border-neutral-900 ring-2 ring-neutral-900/20',
    features: {
      enableBulkSales: true,
      enableBulkSackPurchases: true,
      enableCombos: true,
      enablePharmaExpiry: true,
      enableApparelVariants: true,
      enableVolumePacks: true,
      enableBarcodeQuickScanner: true,
      enableDailyShiftSummary: true,
      quickSalePresets: [5, 10, 20, 50, 100],
      defaultUnit: 'unidad',
      suggestedUnits: ['unidad', 'paquete', 'caja', 'kg', 'par', 'docena', 'set'],
    },
    storeInfo: {
      storeName: 'Comercial & Bazar Central',
      ruc: '20109988776',
      address: 'Av. Abancay 740, Lima Centro, Lima',
      phone: '(01) 428-9900',
    },
  },
};
