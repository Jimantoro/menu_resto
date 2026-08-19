import React, { useState } from 'react';
import { MenuItem, Pesanan, CartMap, CartEntry } from '../types';
import { dbService } from '../services/db';
import { formatRupiah } from '../utils/formatters';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  ReceiptText, 
  QrCode, 
  Banknote, 
  CreditCard,
  Hash
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartMap;
  onSuccess: (newOrderId: number) => void;
  presetTable?: string;
  presetCustomer?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onSuccess,
  presetTable = '05',
  presetCustomer = 'Take Away',
}) => {
  const [noMeja, setNoMeja] = useState(presetTable);
  const [namaPelanggan, setNamaPelanggan] = useState(presetCustomer);
  const [metodePembayaran, setMetodePembayaran] = useState<'Tunai' | 'QRIS' | 'Debit/Kartu'>('Tunai');
  const [uangDiterimaStr, setUangDiterimaStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const cartList: CartEntry[] = (Object.values(cart) as CartEntry[]).filter((c) => c && c.quantity > 0);
  const totalHarga: number = cartList.reduce((sum, entry) => sum + entry.quantity * entry.item.harga, 0);
  const uangDiterima: number = parseInt(uangDiterimaStr.replace(/\D/g, ''), 10) || 0;
  const kembalian: number = uangDiterima > totalHarga ? uangDiterima - totalHarga : 0;

  const handleQuickNominal = (amount: number) => {
    sound.playTap();
    setUangDiterimaStr(amount.toString());
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNoMeja = noMeja.trim();

    if (!cleanNoMeja) {
      setErrorMessage('Nomor Meja harus diisi!');
      sound.playDelete();
      return;
    }

    if (metodePembayaran === 'Tunai' && uangDiterimaStr && uangDiterima < totalHarga) {
      setErrorMessage('Uang diterima kurang dari total pembayaran!');
      sound.playDelete();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Create order in DatabaseHelper
      const newOrderId = dbService.createPesanan(cleanNoMeja, totalHarga, 'pending', {
        namaPelanggan: namaPelanggan.trim() || `Meja ${cleanNoMeja}`,
        metodePembayaran,
        uangDiterima: uangDiterima > 0 ? uangDiterima : totalHarga,
        kembalian: kembalian,
      });

      // 2. Add detail pesanan for each item
      for (const entry of cartList) {
        dbService.addDetailPesanan(
          newOrderId,
          entry.item.id,
          entry.quantity,
          entry.item.harga,
          entry.item.nama
        );
      }

      // 3. Audio and visual celebration
      sound.playSuccess();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // confetti fallback
      }

      // Reset form
      setNoMeja('');
      setNamaPelanggan('');
      setUangDiterimaStr('');

      onSuccess(newOrderId);
    } catch (err) {
      setErrorMessage('Terjadi kesalahan saat menyimpan pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100 tracking-tight">Konfirmasi Pembayaran</h3>
              <p className="text-xs text-slate-400">RestoKasir Pro • Checkout</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSaveOrder} className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Table Number (etDialogNoMeja) */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-orange-500" />
              <span>Nomor Meja <span className="text-red-500">*</span></span>
            </label>
            <div className="relative">
              <input
                id="etDialogNoMeja"
                type="text"
                value={noMeja}
                onChange={(e) => setNoMeja(e.target.value)}
                placeholder="Contoh: 05 atau VIP-1"
                autoFocus
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-base placeholder-slate-400"
              />
            </div>
            {/* Quick Table Presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Preset:</span>
              {['01', '02', '03', '04', '05', '06', 'VIP-1', 'Take Away'].map((tbl) => (
                <button
                  key={tbl}
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setNoMeja(tbl);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-colors ${
                    noMeja === tbl
                      ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {tbl}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Nama Pelanggan (Opsional)
            </label>
            <input
              type="text"
              value={namaPelanggan}
              onChange={(e) => setNamaPelanggan(e.target.value)}
              placeholder="Contoh: Bpk. Hendra / Ibu Ratna"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all placeholder-slate-400"
            />
          </div>

          {/* Order Summary Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-200">
              <span>Pesanan ({cartList.reduce((acc, c) => acc + c.quantity, 0)} item)</span>
              <span>Subtotal</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 divide-y divide-slate-100 pr-1 text-xs">
              {cartList.map(({ item, quantity }) => (
                <div key={item.id} className="pt-1.5 flex items-center justify-between text-slate-700">
                  <span className="font-semibold">
                    {item.nama} <span className="text-slate-400 font-bold">×{quantity}</span>
                  </span>
                  <span className="font-bold text-slate-900">{formatRupiah(item.harga * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
              <span>Total Pembayaran</span>
              <span className="text-xl font-black text-orange-600 tracking-tight">{formatRupiah(totalHarga)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setMetodePembayaran('Tunai');
                }}
                className={`py-3 px-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  metodePembayaran === 'Tunai'
                    ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setMetodePembayaran('QRIS');
                  setUangDiterimaStr(totalHarga.toString());
                }}
                className={`py-3 px-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  metodePembayaran === 'QRIS'
                    ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-blue-600" />
                <span>QRIS Instant</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setMetodePembayaran('Debit/Kartu');
                  setUangDiterimaStr(totalHarga.toString());
                }}
                className={`py-3 px-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  metodePembayaran === 'Debit/Kartu'
                    ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span>Kartu / Debit</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {metodePembayaran === 'Tunai' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">
                Uang Diterima dari Pelanggan
              </label>
              <input
                type="text"
                value={uangDiterimaStr ? `Rp ${parseInt(uangDiterimaStr.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID')}` : ''}
                onChange={(e) => setUangDiterimaStr(e.target.value.replace(/\D/g, ''))}
                placeholder={formatRupiah(totalHarga)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-black focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 text-base"
              />

              {/* Quick Money Buttons */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickNominal(totalHarga)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-slate-800"
                >
                  Uang Pas
                </button>
                {[50000, 100000, 150000, 200000].map((nominal) => (
                  <button
                    key={nominal}
                    type="button"
                    onClick={() => handleQuickNominal(nominal)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-slate-800"
                  >
                    {formatRupiah(nominal)}
                  </button>
                ))}
              </div>

              {uangDiterima > 0 && (
                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Kembalian:</span>
                  <span className={kembalian >= 0 ? 'text-emerald-700 text-base font-black' : 'text-red-600 text-sm font-bold'}>
                    {formatRupiah(kembalian)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Bayar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
