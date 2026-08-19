import React from 'react';
import { Pesanan } from '../types';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import { sound } from '../utils/audio';
import { 
  X, 
  Printer, 
  Share2, 
  Check, 
  UtensilsCrossed 
} from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  pesanan: Pesanan | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  pesanan,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !pesanan) return null;

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  const handleCopyText = () => {
    sound.playTap();
    const itemsText = pesanan.details
      ?.map((d) => `${d.menuNama} x${d.quantity} - ${formatRupiah(d.harga * d.quantity)}`)
      .join('\n') || '';

    const text = `*RESTOKASIR PRO - STRUK TRANSAKSI*\n` +
      `No. Pesanan: #${pesanan.id}\n` +
      `Meja: ${pesanan.noMeja}\n` +
      `Pelanggan: ${pesanan.namaPelanggan || '-'}\n` +
      `Waktu: ${formatDateTime(pesanan.tanggal)}\n` +
      `--------------------------------\n` +
      `${itemsText}\n` +
      `--------------------------------\n` +
      `TOTAL: ${formatRupiah(pesanan.total)}\n` +
      `Metode: ${pesanan.metodePembayaran || 'Tunai'}\n` +
      `Status: ${pesanan.status.toUpperCase()}\n` +
      `Terima kasih atas kunjungan Anda!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        {/* Top Control Bar */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
          <span className="text-xs font-extrabold tracking-wider uppercase text-slate-300">Struk Pembayaran POS</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyText}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Salin Teks Struk"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Cetak Struk"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Receipt Body */}
        <div id="receiptPaper" className="p-6 bg-white overflow-y-auto font-mono text-xs text-slate-800 space-y-4">
          {/* Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black text-xl flex items-center justify-center mx-auto mb-1">
              R
            </div>
            <h3 className="font-extrabold text-base tracking-tight font-sans text-slate-900">RESTOKASIR PRO</h3>
            <p className="text-[11px] text-slate-500">Jl. Kuliner Nusantara No. 88</p>
            <p className="text-[10px] text-slate-400">Telp: 0812-3456-7890</p>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Order:</span>
              <span className="font-bold">#{pesanan.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nomor Meja:</span>
              <span className="font-bold text-orange-600">Meja {pesanan.noMeja}</span>
            </div>
            {pesanan.namaPelanggan && (
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span className="font-medium">{pesanan.namaPelanggan}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu:</span>
              <span>{formatDateTime(pesanan.tanggal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kasir:</span>
              <span>Budi Admin (Kasir 01)</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
            {pesanan.details && pesanan.details.length > 0 ? (
              pesanan.details.map((d, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <p className="font-semibold text-slate-900">{d.menuNama}</p>
                    <p className="text-[10px] text-slate-500">
                      {d.quantity} × {formatRupiah(d.harga)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">{formatRupiah(d.harga * d.quantity)}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 italic">Detail pesanan tidak tersedia</div>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-xs pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
              <span>TOTAL TAGIHAN</span>
              <span className="text-orange-600 font-extrabold">{formatRupiah(pesanan.total)}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>Metode Pembayaran:</span>
              <span className="font-bold">{pesanan.metodePembayaran || 'Tunai'}</span>
            </div>
            {pesanan.uangDiterima && pesanan.uangDiterima > 0 && (
              <>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Bayar (Tunai):</span>
                  <span>{formatRupiah(pesanan.uangDiterima)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Kembalian:</span>
                  <span className="font-bold text-emerald-700">{formatRupiah(pesanan.kembalian || 0)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-slate-400 space-y-0.5 pt-1">
            <p className="font-bold text-slate-600">Terima kasih atas kunjungan Anda!</p>
            <p>Password Wifi: restokeren123</p>
            <p className="text-[9px] text-slate-300 pt-1">Powered by RestoKasir Pro v1.0.4</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
          <button
            onClick={handleCopyText}
            className="flex-1 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-600" />
                <span>Salin Struk</span>
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-bold text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
