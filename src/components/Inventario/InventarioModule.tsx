import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { Product, Category } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import { ProductModal } from './ProductModal';
import { CategoryModal } from './CategoryModal';
import { getEffectiveStock } from '../../utils/comboUtils';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit2,
  Trash2,
  Tag,
  FolderPlus,
  ArrowUpDown,
  CheckCircle2,
  Gift,
  Sparkles,
} from 'lucide-react';

export const InventarioModule: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    getLowStockProducts,
  } = usePos();

  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  // Product Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'standard' | 'combo'>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const lowStockCount = getLowStockProducts().length;
  const comboCount = products.filter((p) => p.type === 'combo').length;

  // Filtered product list
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
    const matchesCategory = selectedCatFilter === 'all' || p.categoryId === selectedCatFilter;
    const matchesType =
      productTypeFilter === 'all'
        ? true
        : productTypeFilter === 'combo'
        ? p.type === 'combo'
        : p.type !== 'combo';
    const effectiveStock = getEffectiveStock(p, products);
    const matchesLowStock = !onlyLowStock || effectiveStock <= p.minStock;
    return matchesSearch && matchesCategory && matchesType && matchesLowStock;
  });

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${name}" del inventario?`)) {
      deleteProduct(id);
    }
  };

  const handleSaveCategory = (catData: any) => {
    if (editingCategory) {
      updateCategory(catData);
    } else {
      addCategory(catData);
    }
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const hasProducts = products.some((p) => p.categoryId === id);
    if (hasProducts) {
      alert(`No se puede eliminar la categoría "${name}" porque contiene productos asignados.`);
      return;
    }
    if (confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight uppercase">
            Inventario & Almacén
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gestión completa de catálogo de productos, existencias y categorías
          </p>
        </div>

        {/* Tab Buttons & Add Action */}
        <div className="flex items-center gap-3">
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 border border-neutral-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Productos ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Categorías ({categories.length})
            </button>
          </div>

          {activeTab === 'products' ? (
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-neutral-950 rounded-xl font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingCategory(null);
                setIsCategoryModalOpen(true);
              }}
              className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-neutral-950 rounded-xl font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Nueva Categoría</span>
            </button>
          )}
        </div>
      </div>

      {/* PRODUCTS TAB CONTENT */}
      {activeTab === 'products' && (
        <>
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por Nombre o SKU..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Category Filter & Low stock */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedCatFilter}
                  onChange={(e) => setSelectedCatFilter(e.target.value)}
                  className="py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:border-black"
                >
                  <option value="all">Todas las Categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Low Stock Toggle Button */}
                <button
                  onClick={() => setOnlyLowStock(!onlyLowStock)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    onlyLowStock
                      ? 'bg-neutral-900 text-white border-black shadow-xs'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Bajo Stock ({lowStockCount})</span>
                </button>
              </div>
            </div>

            {/* Product Type Filter Pills (Standard vs Combo) */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mr-1">
                Tipo:
              </span>
              <button
                type="button"
                onClick={() => setProductTypeFilter('all')}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  productTypeFilter === 'all'
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Todos ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setProductTypeFilter('standard')}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  productTypeFilter === 'standard'
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Estándar ({products.filter((p) => p.type !== 'combo').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setProductTypeFilter('combo')}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  productTypeFilter === 'combo'
                    ? 'bg-amber-400 text-neutral-950 shadow-xs ring-1 ring-amber-500'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-amber-900" />
                <span>Combos / Packs ({comboCount})</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 space-y-2">
                <Package className="w-10 h-10 mx-auto text-neutral-300" />
                <p className="font-bold text-sm text-neutral-700">
                  No se encontraron productos en la lista
                </p>
                <p className="text-xs text-neutral-500">
                  Intenta modificar los filtros o registra un nuevo producto.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Card View (< sm) */}
                <div className="sm:hidden divide-y divide-neutral-200">
                  {filteredProducts.map((p) => {
                    const cat = categories.find((c) => c.id === p.categoryId);
                    const isLowStock = p.stock <= p.minStock;
                    const isOutOfStock = p.stock <= 0;

                    return (
                      <div key={p.id} className="p-4 space-y-3 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-mono text-[10px] font-bold bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200">
                                {p.sku}
                              </span>
                              <span className="text-[11px] text-neutral-500 font-medium">
                                {cat?.name || 'General'}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-neutral-900 leading-snug">{p.name}</h4>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg cursor-pointer active:scale-95"
                              title="Editar producto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-2 text-neutral-600 hover:text-red-600 hover:bg-neutral-100 rounded-lg cursor-pointer active:scale-95"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-xs">
                          <div>
                            <span className="text-neutral-500 text-[10px] block font-medium">Stock:</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono font-black text-sm text-neutral-900">{p.stock}</span>
                              <span className="text-neutral-400 font-mono text-[10px]">/ mín {p.minStock}</span>
                              {isOutOfStock ? (
                                <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-bold rounded">
                                  Sin Stock
                                </span>
                              ) : isLowStock ? (
                                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded">
                                  Bajo
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                                  OK
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-neutral-500 text-[10px] block font-medium">Precio Venta:</span>
                            <span className="text-sm font-black text-emerald-600 font-mono block mt-0.5">
                              S/ {p.salePrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tablet & Desktop Table (hidden sm:block) */}
                <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 uppercase tracking-wider font-bold text-[11px]">
                      <th className="py-3 px-4 font-mono">SKU</th>
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4 text-right font-mono">P. Compra</th>
                      <th className="py-3 px-4 text-right font-mono">P. Venta</th>
                      <th className="py-3 px-4 text-center font-mono">Stock / Mín</th>
                      <th className="py-3 px-4 text-center">Estado Stock</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredProducts.map((p) => {
                      const cat = categories.find((c) => c.id === p.categoryId);
                      const isLowStock = p.stock <= p.minStock;
                      const isOutOfStock = p.stock <= 0;

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-neutral-50 transition-colors ${
                            isOutOfStock
                              ? 'bg-neutral-200/50'
                              : isLowStock
                              ? 'bg-neutral-100/60'
                              : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-black">
                            {p.sku}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-neutral-900">{p.name}</div>
                            <div className="text-[10px] text-neutral-500">
                              Unidad: {p.unit || 'unidad'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-lg font-medium text-[11px] border border-neutral-200">
                              <CategoryIcon name={cat?.icon || 'Tag'} className="w-3.5 h-3.5 text-neutral-700" />
                              <span>{cat?.name || 'General'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-neutral-600 font-mono">
                            S/ {p.purchasePrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-neutral-950 font-mono">
                            S/ {p.salePrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold font-mono">
                            <span className="text-black">{p.stock}</span>
                            <span className="text-neutral-400 font-normal"> / {p.minStock}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isOutOfStock ? (
                              <span className="px-2.5 py-1 bg-black text-white rounded-full text-[10px] font-bold">
                                Sin Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2.5 py-1 bg-neutral-200 text-black border border-neutral-400 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                                <AlertTriangle className="w-3 h-3 text-black" />
                                Bajo Mínimo
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold">
                                Normal
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                                title="Editar producto"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          </div>
        </>
      )}

      {/* CATEGORIES TAB CONTENT */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const prodCount = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-950 text-emerald-400 flex items-center justify-center font-bold border border-neutral-800">
                      <CategoryIcon name={cat.icon} className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900">{cat.name}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">{cat.description || 'Sin descripción'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-lg">
                    {prodCount} productos
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                      title="Editar categoría"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
};
