import React from 'react';
import { MenuItem } from '../types';
import { Plus, Minus, Utensils, Coffee, Cookie } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { sound } from '../utils/audio';

interface MenuCardProps {
  item: MenuItem;
  quantityInCart: number;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
}) => {
  const [imgError, setImgError] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playAddToCart();
    onAddToCart(item);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTap();
    onRemoveFromCart(item);
  };

  const getCategoryIcon = () => {
    switch (item.kategori) {
      case 'Makanan':
        return <Utensils className="w-3 h-3" />;
      case 'Minuman':
        return <Coffee className="w-3 h-3" />;
      case 'Camilan':
        return <Cookie className="w-3 h-3" />;
      default:
        return <Utensils className="w-3 h-3" />;
    }
  };

  return (
    <div 
      id={`menu-item-${item.id}`}
      onClick={handleAdd}
      className={`bg-white rounded-2xl p-3.5 sm:p-4 border shadow-xs flex flex-col justify-between gap-3 group transition-all cursor-pointer relative overflow-hidden select-none ${
        quantityInCart > 0 
          ? 'border-orange-400 ring-2 ring-orange-500/20 bg-orange-50/10' 
          : 'border-slate-200 hover:border-orange-200 hover:shadow-md'
      }`}
    >
      {/* Selected Badge */}
      {quantityInCart > 0 && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs z-10 animate-in fade-in zoom-in-95">
          DIPILIH ({quantityInCart})
        </div>
      )}

      {/* Image Thumbnail */}
      <div className="w-full aspect-4/3 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center relative">
        {typeof item.gambar === 'string' && item.gambar.startsWith('http') && !imgError ? (
          <img
            src={item.gambar}
            alt={item.nama}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-300 p-3 text-center">
            {getCategoryIcon()}
            <span className="text-[11px] mt-1 font-semibold text-slate-400">{item.nama}</span>
          </div>
        )}
      </div>

      {/* Item Info & Category */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            {getCategoryIcon()}
            <span>{item.kategori}</span>
          </p>
          <h3 
            id={`tvNama-${item.id}`} 
            className="font-bold text-slate-800 text-sm sm:text-base leading-tight line-clamp-1 group-hover:text-orange-600 transition-colors"
          >
            {item.nama}
          </h3>
          {item.deskripsi && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed hidden sm:block">
              {item.deskripsi}
            </p>
          )}
        </div>

        {/* Price & Steppers */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <p 
            id={`tvHarga-${item.id}`} 
            className="text-base sm:text-lg font-black text-slate-900 leading-none tracking-tight"
          >
            {formatRupiah(item.harga)}
          </p>

          <div 
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {quantityInCart > 0 ? (
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  id={`btnKurang-${item.id}`}
                  onClick={handleRemove}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-xs hover:bg-slate-100 active:scale-95 transition-transform"
                  title="Kurang 1"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span 
                  id={`tvQuantity-${item.id}`}
                  className="w-5 text-center font-black text-xs sm:text-sm text-slate-900"
                >
                  {quantityInCart}
                </span>
                <button
                  id={`btnTambah-${item.id}`}
                  onClick={handleAdd}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-transform"
                  title="Tambah 1"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id={`btnTambah-${item.id}`}
                onClick={handleAdd}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold shadow-xs shadow-orange-200 flex items-center gap-1 active:scale-95 transition-transform"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pilih</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
