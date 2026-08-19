import React, { useState } from 'react';
import { MenuItem, CartMap, CartEntry } from '../types';
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag, Receipt, Sparkles, Hash, User } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { sound } from '../utils/audio';

interface SideCartPanelProps {
  cart: CartMap;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
  onClearCart: () => void;
  onOpenCheckout: (customTable?: string, customCustomer?: string) => void;
}

export const SideCartPanel: React.FC<SideCartPanelProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onOpenCheckout,
}) => {
  const [tableNumber, setTableNumber] = useState('05');
  const [customerName, setCustomerName] = useState('Take Away');
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [includeTax, setIncludeTax] = useState(true);

  const cartList: CartEntry[] = (Object.values(cart) as CartEntry[]).filter((c) => c && c.quantity > 0);
  const totalItemCount: number = cartList.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal: number = cartList.reduce((sum, entry) => sum + entry.quantity * entry.item.harga, 0);
  const taxAmount: number = includeTax ? Math.round(subtotal * 0.1) : 0;
  const grandTotal: number = subtotal + taxAmount;

  const handleClear = () => {
    sound.playDelete();
    onClearCart();
  };

  const handleProcess = () => {
    sound.playTap();
    onOpenCheckout(tableNumber, customerName);
  };

  return (
    <aside className="w-88 xl:w-96 bg-white border-l border-slate-200 flex flex-col shadow-2xl z-10 h-full shrink-0">
      {/* Top Header: Pesanan Saat Ini + Bersihkan */}
      <div className="p-5 xl:p-6 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Pesanan Saat Ini</h2>
            {totalItemCount > 0 && (
              <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                {totalItemCount} item
              </span>
            )}
          </div>
          {totalItemCount > 0 && (
            <button
              onClick={handleClear}
              className="text-xs font-bold text-red-500 uppercase hover:text-red-700 hover:underline transition-all flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Bersihkan</span>
            </button>
          )}
        </div>

        {/* Quick Table & Customer Chips */}
        <div className="flex gap-3">
          {/* Table Card */}
          <div 
            onClick={() => setIsEditingTable(!isEditingTable)}
            className="flex-1 p-3 bg-orange-50 border border-orange-100 rounded-xl cursor-pointer hover:bg-orange-100/60 transition-colors group"
          >
            <p className="text-[10px] font-bold text-orange-500 uppercase leading-none mb-1 flex items-center justify-between">
              <span>Nomor Meja</span>
              <span className="text-[9px] text-orange-400 group-hover:underline">Ubah</span>
            </p>
            {isEditingTable ? (
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                onBlur={() => setIsEditingTable(false)}
                autoFocus
                className="w-full text-base font-black text-orange-600 bg-white px-2 py-0.5 rounded border border-orange-300 focus:outline-none"
              />
            ) : (
              <p className="text-xl font-black text-orange-600 leading-none">Meja {tableNumber}</p>
            )}
          </div>

          {/* Customer Type Card */}
          <div 
            onClick={() => {
              const types = ['Take Away', 'Dine In', 'Bpk. Hendra', 'Ibu Ratna', 'VIP Room'];
              const nextIdx = (types.indexOf(customerName) + 1) % types.length;
              setCustomerName(types[nextIdx] || 'Dine In');
              sound.playTap();
            }}
            className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors group"
            title="Klik untuk ubah jenis tamu"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1 flex items-center justify-between">
              <span>Pelanggan</span>
              <span className="text-[9px] text-slate-400 group-hover:underline">Ganti</span>
            </p>
            <p className="text-base font-bold text-slate-700 leading-none truncate">{customerName}</p>
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto flex flex-col p-4 xl:p-6 gap-3 min-h-0">
        {cartList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-300 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <p className="font-bold text-slate-700 text-sm">Keranjang Masih Kosong</p>
            <p className="text-xs text-slate-400 max-w-[200px]">
              Klik menu di sebelah kiri untuk menambahkan pesanan ke meja ini.
            </p>
          </div>
        ) : (
          cartList.map(({ item, quantity }) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-slate-200 transition-all shadow-2xs"
            >
              {/* Thumbnail / Qty badge */}
              <div className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-600 text-xs shrink-0 shadow-2xs">
                {quantity}x
              </div>

              {/* Title & Price */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-700 truncate">{item.nama}</h4>
                <p className="text-xs font-bold text-orange-500 mt-0.5">
                  {formatRupiah(item.harga * quantity)}
                </p>
              </div>

              {/* Stepper Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    sound.playTap();
                    onRemoveFromCart(item);
                  }}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95 transition-transform"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-4 text-center font-black text-xs text-slate-800">{quantity}</span>
                <button
                  onClick={() => {
                    sound.playAddToCart();
                    onAddToCart(item);
                  }}
                  className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-transform"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Financial Summary & Checkout CTA */}
      <div className="p-5 xl:p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-slate-500 font-medium">Subtotal</span>
            <span className="text-slate-800 font-bold">{formatRupiah(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIncludeTax(!includeTax)}>
              <input
                type="checkbox"
                checked={includeTax}
                onChange={() => setIncludeTax(!includeTax)}
                className="w-3.5 h-3.5 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
              />
              <span className="text-slate-500 font-medium">Pajak Resto PB1 (10%)</span>
            </div>
            <span className="text-slate-800 font-bold">{formatRupiah(taxAmount)}</span>
          </div>

          <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-200">
            <span className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-tight">Total</span>
            <span className="text-xl sm:text-2xl font-black text-orange-600 tracking-tighter">
              {formatRupiah(grandTotal)}
            </span>
          </div>
        </div>

        {/* Primary Checkout Button */}
        <button
          onClick={handleProcess}
          disabled={cartList.length === 0}
          className="w-full py-3.5 sm:py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98] uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Proses Pembayaran</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
