import React from 'react';
import { Pesanan } from '../types';
import { formatRupiah } from '../utils/formatters';
import { 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Flame, 
  CreditCard,
  QrCode,
  Banknote,
  BarChart3
} from 'lucide-react';

interface SummaryStatsProps {
  pesananList: Pesanan[];
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ pesananList }) => {
  const totalRevenue = pesananList.reduce((sum, p) => sum + p.total, 0);
  const doneOrders = pesananList.filter((p) => p.status === 'done');
  const doneRevenue = doneOrders.reduce((sum, p) => sum + p.total, 0);
  const pendingCount = pesananList.filter((p) => p.status === 'pending').length;
  const processingCount = pesananList.filter((p) => p.status === 'processing').length;
  const avgTicket = pesananList.length > 0 ? Math.round(totalRevenue / pesananList.length) : 0;

  // Breakdown by payment method
  const tunaiTotal = pesananList.filter((p) => p.metodePembayaran === 'Tunai').reduce((s, p) => s + p.total, 0);
  const qrisTotal = pesananList.filter((p) => p.metodePembayaran === 'QRIS').reduce((s, p) => s + p.total, 0);
  const kartuTotal = pesananList.filter((p) => p.metodePembayaran === 'Debit/Kartu').reduce((s, p) => s + p.total, 0);

  // Top Items aggregator
  const itemCounts: { [name: string]: { count: number; revenue: number } } = {};
  pesananList.forEach((order) => {
    order.details?.forEach((d) => {
      if (!itemCounts[d.menuNama]) {
        itemCounts[d.menuNama] = { count: 0, revenue: 0 };
      }
      itemCounts[d.menuNama].count += d.quantity;
      itemCounts[d.menuNama].revenue += d.harga * d.quantity;
    });
  });

  const topItems = Object.entries(itemCounts)
    .map(([nama, data]) => ({ nama, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 pb-24 space-y-6">
      {/* Top Banner */}
      <div className="flex items-center gap-3 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">Laporan & Analitik Restoran</h2>
          <p className="text-xs text-slate-400 font-medium">Rekapitulasi penjualan realtime dan performa menu</p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-orange-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Omset</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{formatRupiah(totalRevenue)}</p>
          <p className="text-[11px] text-slate-400 font-medium">Dari {pesananList.length} transaksi</p>
        </div>

        {/* Transaksi Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Selesai / Lunas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">{doneOrders.length}</p>
          <p className="text-[11px] text-slate-400 font-medium">{formatRupiah(doneRevenue)}</p>
        </div>

        {/* Antrean Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Antrean Aktif</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight">{pendingCount + processingCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">{pendingCount} Pending • {processingCount} Proses</p>
        </div>

        {/* Rata-rata per Meja */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Rata-rata Nota</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{formatRupiah(avgTicket)}</p>
          <p className="text-[11px] text-slate-400 font-medium">Per meja / transaksi</p>
        </div>
      </div>

      {/* Breakdown Methods & Top Seller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Payment breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <span>Metode Pembayaran</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-800">Tunai (Cash)</p>
                  <p className="text-[11px] text-slate-400">{pesananList.filter((p) => p.metodePembayaran === 'Tunai').length} transaksi</p>
                </div>
              </div>
              <p className="font-black text-xs sm:text-sm text-slate-900">{formatRupiah(tunaiTotal)}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-800">QRIS Instant</p>
                  <p className="text-[11px] text-slate-400">{pesananList.filter((p) => p.metodePembayaran === 'QRIS').length} transaksi</p>
                </div>
              </div>
              <p className="font-black text-xs sm:text-sm text-slate-900">{formatRupiah(qrisTotal)}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-800">Debit / Kartu</p>
                  <p className="text-[11px] text-slate-400">{pesananList.filter((p) => p.metodePembayaran === 'Debit/Kartu').length} transaksi</p>
                </div>
              </div>
              <p className="font-black text-xs sm:text-sm text-slate-900">{formatRupiah(kartuTotal)}</p>
            </div>
          </div>
        </div>

        {/* Top Seller Menu */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>5 Menu Terlaris</span>
          </h3>

          {topItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Belum ada data pesanan tersimpan.
            </div>
          ) : (
            <div className="space-y-2.5">
              {topItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-slate-800 truncate">{item.nama}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-xs text-orange-600">{item.count} porsi</p>
                    <p className="text-[10px] text-slate-400">{formatRupiah(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
