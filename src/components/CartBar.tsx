import React, { useState } from 'react';
import { MenuItem, CartMap, CartEntry } from '../types';
import { ShoppingBag, ChevronUp, ChevronDown, Trash2, Plus, Minus, ArrowRight, ListOrdered } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { sound } from '../utils/audio';

interface CartBarProps {
  cart: CartMap;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
  onGoToOrders: () => void;
}

export const CartBar: React.FC<CartBarProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onOpenCheckout,
  onGoToOrders,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const cartList: CartEntry[] = (Object.values(cart) as CartEntry[]).filter((c) => c && c.quantity > 0);
  const totalItemCount: number = cartList.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalPrice: number = cartList.reduce((sum, entry) => sum + entry.quantity * entry.item.harga, 0);

  const handleCheckoutClick = () => {
    sound.playTap();
    if (totalItemCount > 0) {
      onOpenCheckout();
    } else {
      onGoToOrders();
    }
  };

  const handleClear = () => {
    sound.playDelete();
    onClearCart();
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-25 p-3 sm:p-4 pointer-events-none md:hidden">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        {/* Expanded Cart Detail Panel */}
        {isExpanded && totalItemCount > 0 && (
          <div className="mb-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 sm:p-5 max-h-[60vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                <h4 className="font-bold text-slate-900">Rincian Pesanan ({totalItemCount} item)</h4>
              </div>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 px-2.5 py-1 rounded-md hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan</span>
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100 my-2 flex-1 pr-1">
              {cartList.map(({ item, quantity }) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{item.nama}</p>
                    <p className="text-xs text-slate-500">
                      {formatRupiah(item.harga)} × {quantity} = <span className="font-semibold text-orange-600">{formatRupiah(item.harga * quantity)}</span>
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                    <button
                      onClick={() => {
                        sound.playTap();
                        onRemoveFromCart(item);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-50 active:scale-95 shadow-2xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-slate-900">{quantity}</span>
                    <button
                      onClick={() => {
                        sound.playAddToCart();
                        onAddToCart(item);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-md shadow-orange-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">Subtotal Item</span>
              <span className="font-bold text-base text-slate-900">{formatRupiah(totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-transform hover:shadow-2xl">
          {/* Left summary & expansion toggle */}
          <div 
            onClick={() => totalItemCount > 0 && setIsExpanded(!isExpanded)}
            className={`flex items-center gap-3 select-none ${totalItemCount > 0 ? 'cursor-pointer hover:opacity-90' : ''}`}
          >
            <div className="relative w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-orange-400 border border-slate-700">
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalItemCount}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span id="tvTotalItem" className="text-xs sm:text-sm font-medium text-slate-300">
                  {totalItemCount > 0 ? `${totalItemCount} item dipilih` : 'Keranjang kosong'}
                </span>
                {totalItemCount > 0 && (
                  <button className="text-slate-400 hover:text-white">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <p id="tvTotalHarga" className="text-base sm:text-lg font-bold text-orange-400 leading-none mt-0.5 tracking-tight">
                {formatRupiah(totalPrice)}
              </p>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="flex items-center gap-2">
            <button
              id="btnLihatPesanan"
              onClick={handleCheckoutClick}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-md ${
                totalItemCount > 0
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {totalItemCount > 0 ? (
                <>
                  <span>Bayar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <ListOrdered className="w-4 h-4 text-orange-400" />
                  <span>Antrean</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
