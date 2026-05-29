
import React, { useEffect, useState } from 'react';
import { Reservation } from '../types';
import { getParkingGuide } from '../geminiService';
import BoomBarrier from './BoomBarrier';
import { LOCATIONS } from '../constants';

interface Props {
  reservation: Reservation;
  onHome: () => void;
}

// Haversine distance calculator helper functions
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

const SuccessView: React.FC<Props> = ({ reservation, onHome }) => {
  const [guide, setGuide] = useState<string>('SYNCHRONIZING WITH ARDUINO INFRASTRUCTURE...');
  const [userHex, setUserHex] = useState<{ vehicleNo: string; fastagId: string } | null>(null);

  // GPS routing and ETA states
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'synced' | 'default'>('acquiring');
  const [distance, setDistance] = useState<number | null>(null);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [arrivalTimeStr, setArrivalTimeStr] = useState<string>('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  const calculateEta = (userLat: number, userLon: number) => {
    const venue = LOCATIONS.find(loc => loc.name === reservation.locationName);
    if (!venue || !venue.latitude || !venue.longitude) return;

    const dist = getDistanceFromLatLonInKm(userLat, userLon, venue.latitude, venue.longitude);
    setDistance(dist);

    // Assume average speed = 30 km/h (0.5 km per minute)
    // Add realistic urban traffic offset (+3 mins flat delay for signal and speed variations)
    const baseMinutes = Math.max(2, Math.round(dist * 2.2 + 3));
    setEtaMinutes(baseMinutes);

    // Calculate arrival clock time
    const now = new Date();
    now.setMinutes(now.getMinutes() + baseMinutes);
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    setArrivalTimeStr(now.toLocaleTimeString([], options));
  };

  const syncGeolocation = () => {
    setGpsStatus('acquiring');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserCoords({ lat, lon });
          setGpsStatus('synced');
          calculateEta(lat, lon);
        },
        (error) => {
          console.warn("Geolocation failing/denied, using simulated Lucknow terminal coordinate:", error);
          // Fallback to average central Lucknow coordinate
          const defaultLat = 26.846;
          const defaultLon = 80.946;
          setUserCoords({ lat: defaultLat, lon: defaultLon });
          setGpsStatus('default');
          calculateEta(defaultLat, defaultLon);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      // Geolocation not supported at all
      const defaultLat = 26.846;
      const defaultLon = 80.946;
      setUserCoords({ lat: defaultLat, lon: defaultLon });
      setGpsStatus('default');
      calculateEta(defaultLat, defaultLon);
    }
  };

  useEffect(() => {
    async function load() {
      const text = await getParkingGuide(reservation.locationName, reservation.slotId);
      setGuide(text || '');
    }
    load();

    const savedUser = localStorage.getItem('parksense_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUserHex({ vehicleNo: u.vehicleNo, fastagId: u.fastagId });
      } catch (e) {}
    }

    // Initialize geolocation sync
    syncGeolocation();
  }, [reservation]);

  return (
    <div className="animate-in zoom-in duration-500 space-y-6 pb-12">
      <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-center border-t-8 border-blue-600 relative overflow-hidden">
        <div className="w-24 h-24 bg-blue-600/10 text-blue-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-5xl shadow-inner border border-blue-600/20">
          ✓
        </div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">Slot Reserved</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">RFID Handshake Complete</p>

        {reservation.otp && (
          <div className="mt-8 bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-500/20">
            <p className="text-[10px] uppercase text-white/70 font-black tracking-widest mb-1">Entry Gate OTP</p>
            <div className="flex justify-center space-x-3">
              {reservation.otp.split('').map((digit, i) => (
                <div key={i} className="bg-white/10 w-10 py-3 rounded-xl text-2xl font-black text-white italic border border-white/20">
                  {digit}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-slate-950 rounded-[2rem] p-6 text-left border border-slate-800 relative group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] uppercase text-slate-600 font-black tracking-widest mb-1">Destination</p>
              <p className="font-black text-white text-lg italic tracking-tighter uppercase">{reservation.locationName}</p>
            </div>
            <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl font-black text-sm italic tracking-tighter shadow-lg shadow-blue-500/20">
              {reservation.slotId}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] uppercase text-slate-600 font-black tracking-widest mb-1">Infrastructure</p>
              <p className="font-black text-white italic uppercase tracking-tighter">Level {reservation.level}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-600 font-black tracking-widest mb-1">Vehicle Class</p>
              <p className="font-black text-white italic uppercase tracking-tighter">{reservation.vehicleType.replace('-', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Transit Router (Bento Grid layout) */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="bg-blue-500/10 text-blue-400 text-[9px] font-black px-2 py-1 rounded-md border border-blue-500/20 uppercase tracking-widest inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              GPS SATELLITE ROUTER
            </span>
            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mt-1">
              Estimated Transit Radar
            </h3>
          </div>
          <button 
            type="button"
            onClick={syncGeolocation}
            className="p-2 hover:bg-slate-800 text-slate-400 rounded-xl transition-all hover:text-white"
            title="Refresh GPS Anchor"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
            </svg>
          </button>
        </div>

        {/* Real-time details */}
        <div className="grid grid-cols-2 gap-4">
          {/* Output Display 1: Arrival Time & ETA */}
          <div className="bg-slate-950 p-5 rounded-[2rem] border border-slate-800/80 flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Estimated Touchdown</p>
              <p className="text-3xl font-black text-white tracking-tighter italic uppercase mt-1">
                {etaMinutes ? `${etaMinutes} MINS` : 'CALCULATING...'}
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
              <div>
                <p className="text-[8px] font-bold text-slate-600 uppercase">Clock Arrival</p>
                <p className="font-bold text-blue-400 text-xs italic">{arrivalTimeStr || '--:--'}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold text-slate-600 uppercase">Distance</p>
                <p className="font-bold text-slate-300 text-xs italic">
                  {distance !== null ? `${distance.toFixed(1)} km` : '-- km'}
                </p>
              </div>
            </div>
          </div>

          {/* Output Display 2: Live Tracking Progress & Route Quality */}
          <div className="bg-slate-950 p-5 rounded-[2rem] border border-slate-800/80 flex flex-col justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Route State</p>
              <div className="flex items-center gap-1.5 mt-1">
                {gpsStatus === 'acquiring' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span className="text-[10px] font-black text-amber-500 uppercase italic tracking-tighter">Acquiring Lock</span>
                  </>
                ) : gpsStatus === 'synced' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase italic tracking-tighter">SENSORS ONLINE</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]"></span>
                    <span className="text-[10px] font-black text-blue-500 uppercase italic tracking-tighter">SIMULATED BEACON</span>
                  </>
                )}
              </div>
            </div>

            {/* Micro road layout visualization */}
            <div className="relative mt-4 h-6 w-full bg-slate-900 border border-slate-800/80 rounded-lg flex items-center justify-between px-3 overflow-hidden">
              <div className="absolute top-[48%] left-0 right-0 h-0.5 border-t border-dashed border-slate-800"></div>
              {/* Star point (Start) */}
              <div className="text-[10px] z-10">🏠</div>
              
              {/* Blinking Car progress */}
              <div className="absolute left-[40%] animate-car z-10 text-xs text-blue-500">
                🚗
              </div>

              {/* Destination point */}
              <p className="text-[10px] z-10">🅿️</p>
            </div>
            
            <p className="text-[8px] text-slate-500 leading-normal mt-2">
              {gpsStatus === 'synced' 
                ? 'High accuracy coordinates fed from active GPS antenna client.'
                : 'Showing estimated metrics via standard Lucknow downtown beacon.'}
            </p>
          </div>
        </div>
      </div>

      <BoomBarrier 
        vehicleNo={userHex?.vehicleNo} 
        fastagId={userHex?.fastagId} 
      />

      <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden">
        <h3 className="font-black text-white text-sm mb-4 flex items-center uppercase italic tracking-tighter">
          <svg className="w-5 h-5 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Reach & Park Format
        </h3>
        
        <div className="w-full h-48 bg-slate-950 rounded-3xl relative mb-6 overflow-hidden border border-slate-800">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
               <defs><pattern id="grid-dark" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2563eb" strokeWidth="0.5"/></pattern></defs>
               <rect width="100%" height="100%" fill="url(#grid-dark)" />
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_#2563eb]"></div>
          
          <div className="absolute top-[20%] right-10 bg-blue-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase italic tracking-tighter shadow-lg shadow-blue-500/40">
            RESERVED SLOT: {reservation.slotId}
          </div>
          
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-r from-blue-500/50 to-transparent animate-[scan_3s_linear_infinite]"></div>
        </div>

        <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Reach Instructions</p>
          <div className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap font-medium">
            {guide}
          </div>
        </div>
      </div>

      <button 
        onClick={onHome}
        className="w-full bg-slate-100 text-slate-900 font-black py-5 rounded-3xl hover:bg-white transition shadow-xl active:scale-95 uppercase italic tracking-tighter"
      >
        Return to Control Panel
      </button>
    </div>
  );
};

export default SuccessView;
