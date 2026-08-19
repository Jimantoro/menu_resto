import { MenuItem, Pesanan, DetailPesanan, OrderStatus } from '../types';
import { INITIAL_MENU_ITEMS } from '../data/initialData';

const STORAGE_KEY_MENU = 'resto_kasir_menu_v1';
const STORAGE_KEY_PESANAN = 'resto_kasir_pesanan_v1';
const STORAGE_KEY_DETAIL = 'resto_kasir_detail_pesanan_v1';

class DatabaseService {
  private isInitialized = false;

  constructor() {
    this.initDatabase();
  }

  public initDatabase(): void {
    if (this.isInitialized) return;

    if (!localStorage.getItem(STORAGE_KEY_MENU)) {
      localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(INITIAL_MENU_ITEMS));
    }

    if (!localStorage.getItem(STORAGE_KEY_PESANAN)) {
      // Seed sample orders for instant visual feedback matching realistic POS status
      const sampleOrders: Pesanan[] = [
        {
          id: 101,
          noMeja: '04',
          namaPelanggan: 'Bpk. Hendra',
          tanggal: Date.now() - 1000 * 60 * 25, // 25 mins ago
          total: 55000,
          status: 'processing',
          metodePembayaran: 'QRIS',
        },
        {
          id: 102,
          noMeja: '02',
          namaPelanggan: 'Ibu Ratna',
          tanggal: Date.now() - 1000 * 60 * 12, // 12 mins ago
          total: 62000,
          status: 'pending',
          metodePembayaran: 'Tunai',
        },
        {
          id: 103,
          noMeja: '07',
          namaPelanggan: 'Andi',
          tanggal: Date.now() - 1000 * 60 * 55, // 55 mins ago
          total: 47000,
          status: 'done',
          metodePembayaran: 'Debit/Kartu',
          uangDiterima: 50000,
          kembalian: 3000,
        },
      ];
      localStorage.setItem(STORAGE_KEY_PESANAN, JSON.stringify(sampleOrders));

      const sampleDetails: DetailPesanan[] = [
        { id: 1, pesananId: 101, menuId: 1, menuNama: 'Nasi Goreng Spesial', quantity: 2, harga: 25000 },
        { id: 2, pesananId: 101, menuId: 7, menuNama: 'Es Teh Manis', quantity: 1, harga: 5000 },
        { id: 3, pesananId: 102, menuId: 3, menuNama: 'Ayam Bakar Madu', quantity: 1, harga: 30000 },
        { id: 4, pesananId: 102, menuId: 4, menuNama: 'Soto Ayam Lamongan', quantity: 1, harga: 22000 },
        { id: 5, pesananId: 102, menuId: 9, menuNama: 'Kopi Susu Gula Aren', quantity: 1, harga: 10000 },
        { id: 6, pesananId: 103, menuId: 6, menuNama: 'Bebek Goreng Kremes', quantity: 1, harga: 35000 },
        { id: 7, pesananId: 103, menuId: 10, menuNama: 'Jus Alpukat', quantity: 1, harga: 12000 },
      ];
      localStorage.setItem(STORAGE_KEY_DETAIL, JSON.stringify(sampleDetails));
    }

    this.isInitialized = true;
  }

  // --- MENU CRUD ---
  public getAllMenu(): MenuItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MENU);
      return data ? JSON.parse(data) : INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  }

  public getMenuByCategory(kategori: string): MenuItem[] {
    const all = this.getAllMenu();
    if (kategori === 'Semua') return all;
    return all.filter((item) => item.kategori.toLowerCase() === kategori.toLowerCase());
  }

  public saveMenu(menu: MenuItem): MenuItem {
    const all = this.getAllMenu();
    const existingIndex = all.findIndex((m) => m.id === menu.id);
    if (existingIndex >= 0) {
      all[existingIndex] = menu;
    } else {
      const newId = all.length > 0 ? Math.max(...all.map((m) => m.id)) + 1 : 1;
      menu.id = newId;
      all.push(menu);
    }
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(all));
    return menu;
  }

  public deleteMenu(id: number): void {
    const all = this.getAllMenu().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(all));
  }

  public resetMenuToDefault(): void {
    localStorage.setItem(STORAGE_KEY_MENU, JSON.stringify(INITIAL_MENU_ITEMS));
  }

  // --- PESANAN CRUD (Matches SQLite DatabaseHelper) ---
  public getAllPesanan(): Pesanan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PESANAN);
      const orders: Pesanan[] = data ? JSON.parse(data) : [];
      const details = this.getAllDetails();

      // Attach details to each order
      return orders
        .map((order) => ({
          ...order,
          details: details.filter((d) => d.pesananId === order.id),
        }))
        .sort((a, b) => b.tanggal - a.tanggal);
    } catch {
      return [];
    }
  }

  public getPesananById(id: number): Pesanan | undefined {
    const orders = this.getAllPesanan();
    return orders.find((o) => o.id === id);
  }

  public createPesanan(
    noMeja: string,
    total: number,
    status: OrderStatus = 'pending',
    extra?: {
      namaPelanggan?: string;
      metodePembayaran?: 'Tunai' | 'QRIS' | 'Debit/Kartu';
      uangDiterima?: number;
      kembalian?: number;
    }
  ): number {
    const orders = this.getRawPesananList();
    const newId = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 101;

    const newPesanan: Pesanan = {
      id: newId,
      noMeja,
      tanggal: Date.now(),
      total,
      status,
      namaPelanggan: extra?.namaPelanggan || `Tamu Meja ${noMeja}`,
      metodePembayaran: extra?.metodePembayaran || 'Tunai',
      uangDiterima: extra?.uangDiterima,
      kembalian: extra?.kembalian,
    };

    orders.unshift(newPesanan);
    localStorage.setItem(STORAGE_KEY_PESANAN, JSON.stringify(orders));
    return newId;
  }

  public addDetailPesanan(
    pesananId: number,
    menuId: number,
    quantity: number,
    harga: number,
    menuNama?: string,
    catatan?: string
  ): void {
    const details = this.getAllDetails();
    const newId = details.length > 0 ? Math.max(...details.map((d) => d.id)) + 1 : 1;

    let finalName = menuNama;
    if (!finalName) {
      const menu = this.getAllMenu().find((m) => m.id === menuId);
      finalName = menu ? menu.nama : `Menu #${menuId}`;
    }

    details.push({
      id: newId,
      pesananId,
      menuId,
      menuNama: finalName,
      quantity,
      harga,
      catatan,
    });

    localStorage.setItem(STORAGE_KEY_DETAIL, JSON.stringify(details));
  }

  public updatePesananStatus(id: number, status: OrderStatus): void {
    const orders = this.getRawPesananList();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx >= 0) {
      orders[idx].status = status;
      localStorage.setItem(STORAGE_KEY_PESANAN, JSON.stringify(orders));
    }
  }

  public deletePesanan(id: number): void {
    // Delete from pesanan table
    const orders = this.getRawPesananList().filter((o) => o.id !== id);
    localStorage.setItem(STORAGE_KEY_PESANAN, JSON.stringify(orders));

    // Delete from detail_pesanan table
    const details = this.getAllDetails().filter((d) => d.pesananId !== id);
    localStorage.setItem(STORAGE_KEY_DETAIL, JSON.stringify(details));
  }

  private getRawPesananList(): Pesanan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PESANAN);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getAllDetails(): DetailPesanan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DETAIL);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}

export const dbService = new DatabaseService();
