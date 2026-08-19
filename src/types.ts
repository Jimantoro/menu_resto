export type MenuCategory = 'Semua' | 'Makanan' | 'Minuman' | 'Camilan';

export interface MenuItem {
  id: number;
  nama: string;
  kategori: 'Makanan' | 'Minuman' | 'Camilan';
  harga: number;
  gambar: string | number;
  deskripsi?: string;
  tersedia?: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  catatan?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'done';

export interface DetailPesanan {
  id: number;
  pesananId: number;
  menuId: number;
  menuNama: string;
  quantity: number;
  harga: number;
  catatan?: string;
}

export interface Pesanan {
  id: number;
  noMeja: string;
  namaPelanggan?: string;
  tanggal: number; // timestamp ms
  total: number;
  status: OrderStatus;
  metodePembayaran?: 'Tunai' | 'QRIS' | 'Debit/Kartu';
  uangDiterima?: number;
  kembalian?: number;
  details?: DetailPesanan[];
}

export interface CartEntry {
  item: MenuItem;
  quantity: number;
}

export type CartMap = Record<number, CartEntry>;

export type ViewTab = 'kasir' | 'pesanan' | 'laporan' | 'kelola_menu';

