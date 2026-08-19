/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, Pesanan, ViewTab, MenuCategory, OrderStatus, CartMap, CartEntry } from './types';
import { dbService } from './services/db';

import { Header } from './components/Header';
import { MenuCard } from './components/MenuCard';
import { SideCartPanel } from './components/SideCartPanel';
import { CartBar } from './components/CartBar';
import { CheckoutModal } from './components/CheckoutModal';
import { PesananList } from './components/PesananList';
import { ReceiptModal } from './components/ReceiptModal';
import { MenuManager } from './components/MenuManagerModal';
import { SummaryStats } from './components/SummaryStatsModal';
import { sound } from './utils/audio';
import { 
  Utensils, 
  Coffee, 
  Cookie, 
  Sparkles, 
  ClipboardList, 
  BookOpen, 
  BarChart3, 
  Menu as MenuIcon,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor
} from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ViewTab>('kasir');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [soundActive, setSoundActive] = useState(sound.isEnabled());

  // Data State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);

  // Cart State: { [menuId]: { item, quantity } }
  const [cart, setCart] = useState<CartMap>({});

  // Modals State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPresetTable, setCheckoutPresetTable] = useState('05');
  const [checkoutPresetCustomer, setCheckoutPresetCustomer] = useState('Take Away');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Pesanan | null>(null);

  // Load Data on Mount
  const loadData = () => {
    setMenuItems(dbService.getAllMenu());
    setPesananList(dbService.getAllPesanan());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Menu Items
  const displayedMenu = useMemo(() => {
    let result = menuItems;
    if (selectedCategory !== 'Semua') {
      result = result.filter((m) => m.kategori.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.nama.toLowerCase().includes(q) || m.kategori.toLowerCase().includes(q));
    }
    return result;
  }, [menuItems, selectedCategory, searchQuery]);

  // Cart Handlers
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const current = prev[item.id] ? prev[item.id].quantity : 0;
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: current + 1,
        },
      };
    });
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    setCart((prev) => {
      const current = prev[item.id] ? prev[item.id].quantity : 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: current - 1,
        },
      };
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  const handleOpenCheckoutWithPreset = (table = '05', customer = 'Take Away') => {
    setCheckoutPresetTable(table);
    setCheckoutPresetCustomer(customer);
    setIsCheckoutOpen(true);
  };

  // Order Handlers
  const handleOrderStatusChanged = (id: number, status: OrderStatus) => {
    dbService.updatePesananStatus(id, status);
    setPesananList(dbService.getAllPesanan());
  };

  const handleOrderDeleted = (id: number) => {
    dbService.deletePesanan(id);
    setPesananList(dbService.getAllPesanan());
  };

  const handleCheckoutSuccess = (newOrderId: number) => {
    setIsCheckoutOpen(false);
    handleClearCart();
    const updated = dbService.getAllPesanan();
    setPesananList(updated);
    // Switch to Pesanan Tab
    setActiveTab('pesanan');
    // Show receipt
    const createdOrder = updated.find((o) => o.id === newOrderId);
    if (createdOrder) {
      setSelectedReceiptOrder(createdOrder);
    }
  };

  const totalCartCount: number = (Object.values(cart) as CartEntry[]).reduce((sum, c) => sum + (c?.quantity || 0), 0);
  const pendingCount = pesananList.filter((p) => p.status === 'pending').length;
  const processingCount = pesananList.filter((p) => p.status === 'processing').length;

  const handleToggleSound = () => {
    const next = sound.toggleSound();
    setSoundActive(next);
    if (next) sound.playTap();
  };

  // Main content for Kasir Tab
  const renderKasirContent = () => (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      {/* Category Subheader */}
      <div className="px-4 sm:px-8 py-3.5 bg-white border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between shrink-0">
        <div id="tabLayout" className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
          {(['Semua', 'Makanan', 'Minuman', 'Camilan'] as MenuCategory[]).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  sound.playTap();
                  setSelectedCategory(cat);
                }}
                className={`px-4 sm:px-6 py-2 font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                {cat === 'Semua' && <Sparkles className="w-3.5 h-3.5 text-orange-500" />}
                {cat === 'Makanan' && <Utensils className="w-3.5 h-3.5" />}
                {cat === 'Minuman' && <Coffee className="w-3.5 h-3.5" />}
                {cat === 'Camilan' && <Cookie className="w-3.5 h-3.5" />}
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-black ${
                  isSelected ? 'bg-orange-100 text-orange-700' : 'bg-slate-200/60 text-slate-500'
                }`}>
                  {cat === 'Semua' 
                    ? menuItems.length 
                    : menuItems.filter((m) => m.kategori.toLowerCase() === cat.toLowerCase()).length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-bold text-slate-400 hidden sm:block">
          <span>Menampilkan <strong className="text-slate-800">{displayedMenu.length}</strong> menu</span>
        </div>
      </div>

      {/* Menu Catalog Grid */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto content-start bg-slate-50">
        {displayedMenu.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center my-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">Tidak ada menu yang ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Coba kata kunci pencarian lain atau tambahkan menu baru di tab Kelola Menu.
            </p>
          </div>
        ) : (
          <div 
            id="recyclerViewMenu" 
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-24 md:pb-6"
          >
            {displayedMenu.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                quantityInCart={cart[item.id]?.quantity || 0}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar (Mobile only) */}
      <CartBar
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOpenCheckout={() => handleOpenCheckoutWithPreset('05', 'Take Away')}
        onGoToOrders={() => setActiveTab('pesanan')}
      />
    </div>
  );

  return (
    <div className="h-screen w-full flex bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-orange-100">
      {/* 1. Left Vertical Navigation Bar (Theme Component) */}
      <nav className="w-20 bg-slate-900 flex flex-col items-center py-6 gap-8 shrink-0 select-none z-20">
        {/* Brand Logo "R" */}
        <div 
          onClick={() => {
            sound.playTap();
            setActiveTab('kasir');
          }}
          className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-orange-500/25 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          title="RestoKasir Pro"
        >
          R
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-6 w-full px-2">
          {/* Menu / Kasir */}
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('kasir');
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer w-full text-center"
            title="Menu Kasir"
          >
            <div className={`p-3 rounded-2xl transition-all ${
              activeTab === 'kasir' 
                ? 'bg-slate-800 text-orange-400 shadow-xs' 
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
            }`}>
              <MenuIcon className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              activeTab === 'kasir' ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'
            }`}>
              Menu
            </span>
          </button>

          {/* Orders */}
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('pesanan');
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer w-full text-center relative"
            title="Daftar Pesanan & Antrean"
          >
            <div className={`p-3 rounded-2xl transition-all relative ${
              activeTab === 'pesanan' 
                ? 'bg-slate-800 text-orange-400 shadow-xs' 
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
            }`}>
              <ClipboardList className="w-6 h-6" />
              {(pendingCount > 0 || processingCount > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-slate-900 animate-pulse"></span>
              )}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              activeTab === 'pesanan' ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'
            }`}>
              Orders
            </span>
          </button>

          {/* Menu Catalog Management */}
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('kelola_menu');
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer w-full text-center"
            title="Kelola Menu & Harga"
          >
            <div className={`p-3 rounded-2xl transition-all ${
              activeTab === 'kelola_menu' 
                ? 'bg-slate-800 text-orange-400 shadow-xs' 
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
            }`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              activeTab === 'kelola_menu' ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'
            }`}>
              Catalog
            </span>
          </button>

          {/* Reports */}
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('laporan');
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer w-full text-center"
            title="Laporan Penjualan"
          >
            <div className={`p-3 rounded-2xl transition-all ${
              activeTab === 'laporan' 
                ? 'bg-slate-800 text-orange-400 shadow-xs' 
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
            }`}>
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              activeTab === 'laporan' ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'
            }`}>
              Report
            </span>
          </button>
        </div>

        {/* Bottom Utility Controls */}
        <div className="mt-auto flex flex-col items-center gap-4">
          <button
            onClick={handleToggleSound}
            title={soundActive ? 'Audio Aktif' : 'Audio Senyap'}
            className="p-3 text-slate-500 hover:text-orange-400 hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
          >
            {soundActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCount={pendingCount}
          processingCount={processingCount}
          cartItemCount={totalCartCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isPhoneFrame={isPhoneFrame}
          setIsPhoneFrame={setIsPhoneFrame}
        />

        {/* Dynamic Center Area */}
        <div className="flex-1 flex min-w-0 h-full overflow-hidden">
          {isPhoneFrame ? (
            <div className="py-6 px-3 flex-1 flex items-center justify-center overflow-y-auto bg-slate-200/50">
              {/* Android Simulator Frame */}
              <div className="w-full max-w-[420px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative ring-1 ring-slate-700">
                {/* Notch */}
                <div className="w-32 h-5 bg-black rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                  <div className="w-10 h-1 bg-slate-900 rounded-full"></div>
                </div>

                {/* Screen Area */}
                <div className="bg-slate-50 rounded-[32px] overflow-hidden min-h-[720px] max-h-[82vh] overflow-y-auto relative flex flex-col">
                  <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between font-bold">
                    <span>RestoKasir Mobile</span>
                    <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-md">SQLite OK</span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    {activeTab === 'kasir' && renderKasirContent()}
                    {activeTab === 'pesanan' && (
                      <PesananList
                        pesananList={pesananList}
                        onStatusChanged={handleOrderStatusChanged}
                        onOrderDeleted={handleOrderDeleted}
                        onViewReceipt={(p) => setSelectedReceiptOrder(p)}
                        onBackToMenu={() => setActiveTab('kasir')}
                      />
                    )}
                    {activeTab === 'kelola_menu' && <MenuManager onMenuUpdated={loadData} />}
                    {activeTab === 'laporan' && <SummaryStats pesananList={pesananList} />}
                  </div>
                </div>

                {/* Home indicator */}
                <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-2.5"></div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex min-w-0 h-full overflow-hidden">
              {activeTab === 'kasir' && (
                <>
                  {/* Left Menu Area */}
                  {renderKasirContent()}

                  {/* Right POS Cart Sidebar (Theme aside.w-96) */}
                  <div className="hidden md:flex h-full">
                    <SideCartPanel
                      cart={cart}
                      onAddToCart={handleAddToCart}
                      onRemoveFromCart={handleRemoveFromCart}
                      onClearCart={handleClearCart}
                      onOpenCheckout={handleOpenCheckoutWithPreset}
                    />
                  </div>
                </>
              )}

              {activeTab === 'pesanan' && (
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  <PesananList
                    pesananList={pesananList}
                    onStatusChanged={handleOrderStatusChanged}
                    onOrderDeleted={handleOrderDeleted}
                    onViewReceipt={(p) => setSelectedReceiptOrder(p)}
                    onBackToMenu={() => setActiveTab('kasir')}
                  />
                </div>
              )}

              {activeTab === 'kelola_menu' && (
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  <MenuManager onMenuUpdated={loadData} />
                </div>
              )}

              {activeTab === 'laporan' && (
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  <SummaryStats pesananList={pesananList} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Dialog Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onSuccess={handleCheckoutSuccess}
        presetTable={checkoutPresetTable}
        presetCustomer={checkoutPresetCustomer}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
        pesanan={selectedReceiptOrder}
      />
    </div>
  );
}
