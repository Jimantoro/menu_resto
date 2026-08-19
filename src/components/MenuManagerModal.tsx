import React, { useState } from 'react';
import { MenuItem } from '../types';
import { dbService } from '../services/db';
import { formatRupiah } from '../utils/formatters';
import { sound } from '../utils/audio';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Check, 
  X, 
  Utensils, 
  Coffee, 
  Cookie,
  BookOpen,
  Image as ImageIcon 
} from 'lucide-react';

interface MenuManagerProps {
  onMenuUpdated: () => void;
}

export const MenuManager: React.FC<MenuManagerProps> = ({ onMenuUpdated }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(dbService.getAllMenu());
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem>>({
    nama: '',
    kategori: 'Makanan',
    harga: 20000,
    gambar: '',
    deskripsi: '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const refreshList = () => {
    const list = dbService.getAllMenu();
    setMenuItems(list);
    onMenuUpdated();
  };

  const handleOpenNew = () => {
    sound.playTap();
    setEditingItem({
      nama: '',
      kategori: 'Makanan',
      harga: 15000,
      gambar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      deskripsi: '',
    });
    setIsEditing(true);
  };

  const handleEdit = (item: MenuItem) => {
    sound.playTap();
    setEditingItem({ ...item });
    setIsEditing(true);
  };

  const handleDelete = (id: number) => {
    sound.playDelete();
    if (confirm('Yakin ingin menghapus item menu ini dari database?')) {
      dbService.deleteMenu(id);
      refreshList();
    }
  };

  const handleResetDefaults = () => {
    sound.playTap();
    if (confirm('Kembalikan semua menu ke daftar bawaan standar? Menu kustom akan terhapus.')) {
      dbService.resetMenuToDefault();
      refreshList();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.nama || !editingItem.harga) return;

    dbService.saveMenu({
      id: editingItem.id || 0,
      nama: editingItem.nama,
      kategori: editingItem.kategori as any,
      harga: Number(editingItem.harga),
      gambar: editingItem.gambar || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      deskripsi: editingItem.deskripsi || '',
    });

    sound.playSuccess();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    setIsEditing(false);
    refreshList();
  };


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 pb-24 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">Katalog & Manajemen Menu</h2>
            <p className="text-xs text-slate-400 font-medium">Ubah harga, tambah varian baru, atau kelola stok menu</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Kembalikan Menu ke Pengaturan Awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
          <button
            onClick={handleOpenNew}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Menu berhasil diperbarui dan disinkronkan ke database SQLite!</span>
        </div>
      )}

      {/* Menu Table / Cards List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800">Daftar Menu ({menuItems.length} item)</h3>
          <span className="text-xs text-slate-400">Tersedia untuk kasir</span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {menuItems.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                  {typeof item.gambar === 'string' && item.gambar.startsWith('http') ? (
                    <img src={item.gambar} alt={item.nama} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <Utensils className="w-6 h-6 text-slate-300" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 truncate">{item.nama}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                      {item.kategori}
                    </span>
                  </div>
                  <p className="text-xs font-black text-orange-600 mt-0.5">{formatRupiah(item.harga)}</p>
                  {item.deskripsi && (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.deskripsi}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                  title="Edit Menu"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Hapus Menu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Add Modal Form */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">
                {editingItem.id ? 'Edit Menu Resto' : 'Tambah Menu Baru'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nama Menu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingItem.nama}
                  onChange={(e) => setEditingItem({ ...editingItem, nama: e.target.value })}
                  placeholder="Contoh: Ayam Geprek Sambal Matah"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingItem.kategori}
                    onChange={(e) => setEditingItem({ ...editingItem, kategori: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500/40"
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Camilan">Camilan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={editingItem.harga}
                    onChange={(e) => setEditingItem({ ...editingItem, harga: Number(e.target.value) })}
                    placeholder="25000"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>URL Gambar Foto</span>
                </label>
                <input
                  type="url"
                  value={typeof editingItem.gambar === 'string' ? editingItem.gambar : ''}
                  onChange={(e) => setEditingItem({ ...editingItem, gambar: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Deskripsi Menu (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={editingItem.deskripsi || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, deskripsi: e.target.value })}
                  placeholder="Deskripsi singkat bahan atau cita rasa makanan..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/40"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
