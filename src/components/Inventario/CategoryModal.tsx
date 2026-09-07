import React, { useState } from 'react';
import { Category } from '../../types';
import { AVAILABLE_CATEGORY_ICONS, CategoryIcon } from '../CategoryIcon';
import { X, Check, Tag } from 'lucide-react';

interface CategoryModalProps {
  category?: Category | null;
  onSave: (catData: any) => void;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ category, onSave, onClose }) => {
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || 'ShoppingBag');
  const [description, setDescription] = useState(category?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('El nombre de la categoría es requerido');

    onSave({
      ...(category ? { id: category.id } : {}),
      name: name.trim(),
      icon,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden my-8 border border-neutral-800">
        <div className="bg-black text-white p-5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">
                {category ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <p className="text-xs text-neutral-400">Organiza tus productos por tipo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Nombre de la Categoría
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Frutas & Verduras"
              className="w-full py-2.5 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
              Seleccionar Ícono Visual
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-neutral-50 border border-neutral-300 rounded-xl">
              {AVAILABLE_CATEGORY_ICONS.map((item) => {
                const isSelected = icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-950 text-emerald-400 border-emerald-500 font-bold shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <CategoryIcon name={item.id} className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : ''}`} />
                    <span className="text-[9px] truncate w-full text-center leading-tight">
                      {item.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Descripción (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve de los productos en esta categoría"
              className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-20 resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-neutral-950 rounded-xl font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Categoría</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
