import React from 'react';
import {
  ShoppingBag,
  Coffee,
  Milk,
  Sparkles,
  Heart,
  Cookie,
  BookOpen,
  Tag,
  Package,
  Layers,
  Utensils,
  Smartphone,
  Shirt,
  Scissors,
  Wrench,
  Laptop,
  Zap,
  Headphones,
  HardDrive,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', ...props }) => {
  const iconMap: Record<string, React.ElementType> = {
    ShoppingBag,
    Coffee,
    Milk,
    Sparkles,
    Heart,
    Cookie,
    BookOpen,
    Tag,
    Package,
    Layers,
    Utensils,
    Smartphone,
    Shirt,
    Scissors,
    Wrench,
    Laptop,
    Zap,
    Headphones,
    HardDrive,
  };

  const IconComponent = iconMap[name] || Tag;

  return <IconComponent className={className} {...props} />;
};

export const AVAILABLE_CATEGORY_ICONS = [
  { id: 'ShoppingBag', name: 'Bolsa de Compras', icon: ShoppingBag },
  { id: 'Coffee', name: 'Bebidas & Café', icon: Coffee },
  { id: 'Milk', name: 'Lácteos', icon: Milk },
  { id: 'Sparkles', name: 'Limpieza / Limpio', icon: Sparkles },
  { id: 'Heart', name: 'Salud & Cuidado', icon: Heart },
  { id: 'Cookie', name: 'Snacks & Golosinas', icon: Cookie },
  { id: 'BookOpen', name: 'Librería & Hojas', icon: BookOpen },
  { id: 'Tag', name: 'Etiqueta / General', icon: Tag },
  { id: 'Package', name: 'Empaque / Caja', icon: Package },
  { id: 'Utensils', name: 'Alimentos / Cocina', icon: Utensils },
  { id: 'Smartphone', name: 'Celulares / Móvil', icon: Smartphone },
  { id: 'Laptop', name: 'Cómputo & Laptops', icon: Laptop },
  { id: 'Zap', name: 'Cargadores & Energía', icon: Zap },
  { id: 'Headphones', name: 'Audio & Audífonos', icon: Headphones },
  { id: 'HardDrive', name: 'Memorias & Discos', icon: HardDrive },
  { id: 'Shirt', name: 'Textil / Ropa', icon: Shirt },
  { id: 'Scissors', name: 'Ferretería / Corte', icon: Scissors },
  { id: 'Wrench', name: 'Herramientas', icon: Wrench },
];
