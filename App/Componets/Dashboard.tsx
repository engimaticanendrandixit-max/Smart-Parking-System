
import React, { useState } from 'react';
import { User, Reservation } from '../types';
import TopUpModal from './TopUpModal';
import { searchParking, GroundingResult } from '../geminiService';
import ParkingMap from './ParkingMap';
import BoomBarrier from './BoomBarrier';
import QrScannerModal from './QrScannerModal';

interface Props {
  user: User;
  activeReservation: Reservation | null;
  onReserve: (locationId?: string) => void;
  onUpdateBalance: (bal: number) => void;
  onCancel: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

const Dashboard: React.FC<Props> = ({ user, activeReservation, onReserve, onUpdateBalance, onCancel, onUpdateUser }) => {
  const [showTopUp, setShowTopUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<GroundingResult | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanNotification, setScanNotification] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'bento' | 'map'>('bento');

  const handleScanSuccess = (newFasTagId: string) => {
    onUpdateUser({
      ...user,
      fastagId: newFasTagId
    });
    setScanNotification(`FasTag Linked: ${newFasTagId}`);
    setShowScanner(false);
    
    // Auto-dismiss notification banner
    setTimeout(() => {
      setScanNotification(null);
    }, 4500);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);

    let coords;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (err) {
      console.warn("Geolocation access denied or unavailable.");
    }

    const result = await searchParking(searchQuery, coords);
    setSearchResult(result);
    setIsSearching(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Wallet Card - High Contrast Dark */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">{user.fullName.split(' ')[0]}</h2>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-1">{user.vehicleNo} • RFID ACTIVE</p>
            </div>
            <div className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-600/30">
              FASTAG WALLET
            </div>
          </div>
          
          <div className="mt-10 flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Balance Available</p>
              <p className="text-4xl font-black mt-1 text-white italic">₹{user.walletBalance.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => setShowTopUp(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl font-black transition text-sm shadow-lg shadow-blue-500/20 active:scale-95 italic uppercase tracking-tighter"
            >
              Top Up
            </button>
          </div>
        </div>
        {/* Animated Background Gradients */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:scale-110 transition duration-700"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl group-hover:scale-110 transition duration-700 delay-100"></div>
      </div>

      {/* Navigation Hub & Layout Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 rounded-3xl p-5 gap-4 shadow-xl">
        <div>
          <span className="bg-blue-500/10 text-blue-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-widest inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Browse Configuration
          </span>
          <h3 className="text-md font-black text-white italic uppercase tracking-tighter mt-1">
            Smart View Hub
          </h3>
        </div>
        <div className="flex p-1 bg-slate-950 border border-slate-800/80 rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setViewMode('bento')}
            className={`flex-1 sm:flex-none text-[10px] font-black px-4 py-2.5 rounded-xl uppercase tracking-tighter italic transition-all flex items-center justify-center gap-2 ${
              viewMode === 'bento'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            Bento Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex-1 sm:flex-none text-[10px] font-black px-4 py-2.5 rounded-xl uppercase tracking-tighter italic transition-all flex items-center justify-center gap-2 ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Full-Screen Map
          </button>
        </div>
      </div>

      {/* Dynamic Scan Notification Banner */}
      {scanNotification && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold px-6 py-4 rounded-3xl flex items-center justify-between shadow-xl text-xs italic tracking-tighter animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-3">
            <span className="text-xl">⭐</span>
            <span>{scanNotification.toUpperCase()}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setScanNotification(null)}
            className="text-[10px] font-bold opacity-60 hover:opacity-100 uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {viewMode === 'bento' && (
        /* FasTag Transponder & QR Engine card */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/10 text-blue-400">
              {/* Barcode/Transponder SVG */}
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m-3-1v1m6-1v1M9 20v1m3-1v1m3-1v1M6 8h12c1.104 0 2 .896 2 2v6c0 1.104-.896 2-2 2H6c-1.104 0-2-.896-2-2v-6c0-1.104.896-2 2-2zm2 4h.01M12 12h.01M16 12h.01" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-black tracking-[0.1em] text-slate-500 uppercase leading-none">ACTIVE VEHICLE TRANSPONDER</p>
              <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mt-1.5">{user.fastagId || 'TAP TO CONFIGURE'}</h4>
              <p className="text-[10px] font-bold text-slate-400 leading-none mt-1">
                FasTag ID auto-billed on parking checkout.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="bg-slate-950 border border-slate-800 hover:border-blue-500/40 text-blue-400 hover:text-white px-5 py-3.5 rounded-2xl font-black text-xs uppercase italic tracking-tighter transition flex items-center justify-center gap-2 group active:scale-95 shadow-md flex-shrink-0"
          >
            <svg className="w-4 h-4 text-blue-400 group-hover:scale-110 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m-3-1v1m6-1v1M9 20v1m3-1v1m3-1v1M6 8h12c1.104 0 2 .896 2 2v6c0 1.104-.896 2-2 2H6c-1.104 0-2-.896-2-2v-6c0-1.104.896-2 2-2zm2 4h.01M12 12h.01M16 12h.01" />
            </svg>
            Scan QR Code
          </button>
        </div>
      )}

      {/* Active Reservation Notification */}
      {activeReservation && (
        <div className="space-y-4 animate-in slide-in-from-top duration-500">
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-3xl p-5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Active Slot</p>
                <p className="text-white font-black italic tracking-tighter uppercase">{activeReservation.slotId} at {activeReservation.locationName.split(' ')[0]}</p>
              </div>
            </div>
            <button 
              onClick={onCancel}
              className="text-[10px] font-black uppercase italic text-red-400 hover:text-red-300 transition px-3 py-1 bg-red-500/10 rounded-lg border border-red-500/20"
            >
              Cancel (₹5)
            </button>
          </div>
          
          <BoomBarrier 
            vehicleNo={user.vehicleNo}
            fastagId={user.fastagId}
          />
        </div>
      )}

      {viewMode === 'bento' && (
        /* Search Bar - Sleek Dark */
        <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text"
              className="w-full pl-12 pr-24 py-4 bg-slate-950 rounded-2xl border border-slate-800 focus:border-blue-500 focus:bg-slate-900 transition outline-none text-slate-200 text-sm font-bold placeholder-slate-600"
              placeholder="Search venue for slots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button 
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-800 text-blue-400 px-4 py-2 rounded-xl font-black text-[10px] uppercase italic tracking-tighter border border-slate-700 hover:border-blue-500 transition disabled:opacity-50"
            >
              {isSearching ? 'FINDING...' : 'SEARCH'}
            </button>
          </form>

          {searchResult && (
            <div className="mt-4 p-5 bg-slate-900 rounded-2xl border border-slate-800 animate-in slide-in-from-top duration-300">
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{searchResult.text}</p>
              {searchResult.links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {searchResult.links.map((link, i) => (
                    <a 
                      key={i} href={link.uri} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-[10px] font-black text-blue-400 uppercase italic tracking-tighter hover:bg-slate-800 transition shadow-sm"
                    >
                      <span>{link.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Real-time Parking Map Radar Grid */}
      <ParkingMap 
        onSelectLocation={(locId) => onReserve(locId)}
        activeReservationLocation={activeReservation?.locationName}
        isFullScreen={viewMode === 'map'}
      />

      {viewMode === 'bento' && (
        <div className="space-y-6">
          {/* Main Actions */}
          <div className="grid grid-cols-1 gap-4">
            {!activeReservation && (
              <button 
                onClick={onReserve}
                className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center space-x-5 hover:bg-slate-800 transition group text-left shadow-xl animate-in fade-in duration-300"
              >
                <div className="bg-blue-600/10 text-blue-400 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-black text-white text-lg italic tracking-tighter uppercase">Reserve Slot</h3>
                  <p className="text-slate-500 text-xs font-medium mt-1">Select from Hotels, Malls or Central Parking</p>
                </div>
              </button>
            )}

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl animate-in fade-in duration-300">
              <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { id: 1, place: 'Lulu Mall Parking', date: 'Just now', amount: -40, type: 'Debit' },
                  { id: 2, place: 'UPI Topup', date: 'Today', amount: 500, type: 'Credit' }
                ].map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center pb-4 border-b border-slate-800/50 last:border-0">
                    <div>
                      <p className="font-bold text-white text-sm uppercase italic tracking-tighter">{tx.place}</p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase">{tx.date}</p>
                    </div>
                    <p className={`font-black text-sm italic ${tx.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.amount < 0 ? '-' : '+'}₹{Math.abs(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTopUp && (
        <TopUpModal 
          onClose={() => setShowTopUp(false)} 
          currentBalance={user.walletBalance}
          onSuccess={(newBal) => {
            onUpdateBalance(newBal);
            setShowTopUp(false);
          }}
        />
      )}

      {showScanner && (
        <QrScannerModal 
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
