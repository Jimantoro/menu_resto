import React, { useState } from 'react';
import { Pesanan, OrderStatus } from '../types';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import { sound } from '../utils/audio';
import { 
  ClipboardList, 
  Trash2, 
  Play, 
  CheckCheck, 
  Receipt, 
  Search, 
  Clock, 
  Plus
} from 'lucide-react';

interface PesananListProps {
  pesananList: Pesanan[];
  onStatusChanged: (id: number, status: OrderStatus) => void;
  onOrderDeleted: (id: number) => void;
  onViewReceipt: (pesanan: Pesanan) => void;
  onBackToMenu: () => void;
}

export const PesananList: React.FC<PesananListProps> = ({
  pesananList,
  onStatusChanged,
  onOrderDeleted,
  onViewReceipt,
  onBackToMenu,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const filteredOrders = pesananList.filter((order) => {
    const matchesFilter = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      order.noMeja.toLowerCase().includes(query) ||
      (order.namaPelanggan && order.namaPelanggan.toLowerCase().includes(query)) ||
      order.id.toString().includes(query);
    return matchesFilter && matchesSearch;
  });

  const pendingCount = pesananList.filter((p) => p.status === 'pending').length;
  const processingCount = pesananList.filter((p) => p.status === 'processing').length;
  const doneCount = pesananList.filter((p) => p.status === 'done').length;

  const handleProses = (id: number) => {
    sound.playStatusChange();
    onStatusChanged(id, 'processing');
  };

  const handleSelesai = (id: number) => {
    sound.playSuccess();
    onStatusChanged(id, 'done');
  };

  const handleDelete = (id: number) => {
    sound.playDelete();
    onOrderDeleted(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 pb-24 space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">Antrean & Riwayat Pesanan</h2>
            <p className="text-xs text-slate-400 font-medium">Monitoring status pesanan dari dapur hingga kasir</p>
          </div>
        </div>

        <button
          id="btnKembali"
          onClick={() => {
            sound.playTap();
            onBackToMenu();
          }}
          className="self-start sm:self-auto px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pesanan</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              sound.playTap();
              setFilterStatus('all');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            Semua ({pesananList.length})
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setFilterStatus('pending');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>Pending ({pendingCount})</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setFilterStatus('processing');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterStatus === 'processing'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Diproses ({processingCount})</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setFilterStatus('done');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              filterStatus === 'done'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Selesai ({doneCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor meja atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/40"
          />
        </div>
      </div>

      {/* Orders List / Cards (Matching item_pesanan.xml) */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Tidak ada pesanan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery || filterStatus !== 'all'
              ? 'Tidak ditemukan pesanan yang sesuai dengan filter.'
              : 'Belum ada antrean pesanan. Tambahkan pesanan baru dari menu kasir.'}
          </p>
        </div>
      ) : (
        <div id="recyclerViewPesanan" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((pesanan) => {
            const isPending = pesanan.status.toLowerCase() === 'pending';
            const isProcessing = pesanan.status.toLowerCase() === 'processing';
            const isDone = pesanan.status.toLowerCase() === 'done';

            return (
              <div
                key={pesanan.id}
                id={`item-pesanan-${pesanan.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-orange-200 hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                {/* Header Row: Table Number & Status */}
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2">
                    <div>
                      <h4 id={`tvNoMeja-${pesanan.id}`} className="font-black text-lg text-slate-900">
                        Meja {pesanan.noMeja}
                      </h4>
                      {pesanan.namaPelanggan && (
                        <p className="text-xs text-slate-500 font-medium">{pesanan.namaPelanggan}</p>
                      )}
                    </div>

                    <span
                      id={`tvStatus-${pesanan.id}`}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                        isPending
                          ? 'bg-orange-50 text-orange-600 border border-orange-200'
                          : isProcessing
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      {pesanan.status}
                    </span>
                  </div>

                  {/* Timestamp & Payment method */}
                  <div className="flex items-center gap-2.5 text-xs text-slate-400 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span id={`tvTanggal-${pesanan.id}`}>{formatDateTime(pesanan.tanggal)}</span>
                    </div>
                    {pesanan.metodePembayaran && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]">
                        {pesanan.metodePembayaran}
                      </span>
                    )}
                  </div>

                  {/* Item Details Summary */}
                  {pesanan.details && pesanan.details.length > 0 && (
                    <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1">
                      {pesanan.details.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-700">
                          <span className="truncate pr-2 font-medium">
                            {item.menuNama} <span className="font-bold text-slate-400">×{item.quantity}</span>
                          </span>
                          <span className="font-bold text-slate-900 shrink-0">
                            {formatRupiah(item.harga * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total Price */}
                  <div className="mt-3.5 flex items-baseline justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-400">Total:</span>
                    <span
                      id={`tvTotal-${pesanan.id}`}
                      className="text-lg font-black text-slate-900 tracking-tight"
                    >
                      {formatRupiah(pesanan.total)}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* View receipt icon button */}
                  <button
                    onClick={() => {
                      sound.playTap();
                      onViewReceipt(pesanan);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    title="Lihat Struk Kasir"
                  >
                    <Receipt className="w-3.5 h-3.5 text-orange-500" />
                    <span>Struk</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* btnHapus */}
                    {(isPending || isDone) && (
                      <>
                        {deleteConfirmId === pesanan.id ? (
                          <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                            <button
                              onClick={() => handleDelete(pesanan.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded text-[11px] font-bold hover:bg-red-700 cursor-pointer"
                            >
                              Hapus
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px] font-bold cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`btnHapus-${pesanan.id}`}
                            onClick={() => setDeleteConfirmId(pesanan.id)}
                            className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* btnProses */}
                    {isPending && (
                      <button
                        id={`btnProses-${pesanan.id}`}
                        onClick={() => handleProses(pesanan.id)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Proses</span>
                      </button>
                    )}

                    {/* btnSelesai */}
                    {isProcessing && (
                      <button
                        id={`btnSelesai-${pesanan.id}`}
                        onClick={() => handleSelesai(pesanan.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Selesai</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
