import React, { useState, useEffect } from 'react';
import { ViewTab } from '../types';
import { 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor,
  Search,
  User,
  Clock
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  pendingCount: number;
  processingCount: number;
  cartItemCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  processingCount,
  cartItemCount,
  searchQuery,
  setSearchQuery,
  isPhoneFrame,
  setIsPhoneFrame,
}) => {
  const [soundActive, setSoundActive] = useState(sound.isEnabled());
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      };
      const dateStr = now.toLocaleDateString('id-ID', options);
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${dateStr} • ${hours}:${minutes} WIB`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const next = sound.toggleSound();
    setSoundActive(next);
    if (next) sound.playTap();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <span>RestoKasir Pro</span>
          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md tracking-wider uppercase">
            v1.0.4
          </span>
        </h1>
      </div>

      {/* Center Search / Status */}
      <div className="flex items-center gap-4 flex-1 max-w-md mx-4">
        {activeTab === 'kasir' && (
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari menu makanan / minuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-100 border-none rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Controls & Cashier Profile */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Live Date and Time */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-tight">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">{currentTime}</span>
        </div>

        {/* View Mode & Sound Toggles */}
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3 sm:pl-4">
          <button
            onClick={() => {
              sound.playTap();
              setIsPhoneFrame(!isPhoneFrame);
            }}
            title={isPhoneFrame ? 'Mode POS Desktop' : 'Mode Simulator Android'}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs hidden md:flex items-center gap-1.5 transition-colors"
          >
            {isPhoneFrame ? (
              <Monitor className="w-4 h-4 text-orange-500" />
            ) : (
              <Smartphone className="w-4 h-4 text-orange-500" />
            )}
          </button>

          <button
            onClick={handleToggleSound}
            title={soundActive ? 'Matikan Suara Audio' : 'Nyalakan Suara Audio'}
            className={`p-2 rounded-xl border transition-colors ${
              soundActive 
                ? 'text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100' 
                : 'text-slate-400 bg-slate-100 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {soundActive ? <Volume2 className="w-4 h-4 text-orange-500" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Cashier Badge */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3 sm:pl-4">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 border border-orange-200 flex items-center justify-center font-bold text-xs shadow-2xs">
            <User className="w-4 h-4" />
          </div>
          <div className="text-xs hidden sm:block">
            <p className="font-bold text-slate-700 leading-tight">Budi Admin</p>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">Kasir Utama</p>
          </div>
        </div>
      </div>
    </header>
  );
};
