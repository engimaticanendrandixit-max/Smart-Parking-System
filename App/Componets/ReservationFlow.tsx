
import React, { useState } from 'react';
import { LOCATIONS } from '../constants';
import { ParkingLocation, ParkingLevel, Reservation } from '../types';
import SlotGrid from './SlotGrid';

interface Props {
  preselectedLocationId?: string | null;
  onBack: () => void;
  onComplete: (res: Reservation) => void;
}

const ReservationFlow: React.FC<Props> = ({ preselectedLocationId, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<'hotel' | 'mall' | 'central' | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<ParkingLocation | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<'two-wheeler' | 'four-wheeler' | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ParkingLevel | null>(null);

  React.useEffect(() => {
    if (preselectedLocationId) {
      const loc = LOCATIONS.find(l => l.id === preselectedLocationId);
      if (loc) {
        setSelectedType(loc.type);
        setSelectedLoc(loc);
        setStep(3);
      }
    }
  }, [preselectedLocationId]);

  const handleLocSelect = (locId: string) => {
    const loc = LOCATIONS.find(l => l.id === locId);
    if (loc) {
      setSelectedLoc(loc);
      setStep(3);
    }
  };

  const handleFinalize = (slotId: string) => {
    if (!selectedLoc || !selectedLevel || !selectedVehicle) return;
    
    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    onComplete({
      locationName: selectedLoc.name,
      level: selectedLevel.levelNumber,
      slotId,
      vehicleType: selectedVehicle,
      otp
    });
  };

  const filteredLocations = LOCATIONS.filter(l => l.type === selectedType);

  return (
    <div className="animate-in slide-in-from-right duration-400 space-y-6">
      <div className="flex items-center mb-2">
        <button onClick={onBack} className="mr-4 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Initialize Reservation</h2>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Choose Venue Category</p>
          {[
            { id: 'hotel', label: 'Hotels & Restaurants', icon: '🏨', desc: 'Taj, Ramada & more' },
            { id: 'mall', label: 'Shopping Malls', icon: '🛍️', desc: 'Lulu, Phoenix & more' },
            { id: 'central', label: 'Centralized Parking', icon: '🅿️', desc: 'Downtown Hubs' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedType(cat.id as any); setStep(2); }}
              className="w-full bg-slate-900 p-6 rounded-[2rem] border border-slate-800 flex items-center justify-between hover:border-blue-600 transition group shadow-xl"
            >
              <div className="flex items-center space-x-5 text-left">
                <span className="text-4xl bg-slate-950 p-4 rounded-3xl shadow-inner group-hover:scale-110 transition duration-300">{cat.icon}</span>
                <div>
                  <span className="block font-black text-white italic uppercase tracking-tighter text-lg">{cat.label}</span>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{cat.desc}</span>
                </div>
              </div>
              <svg className="w-6 h-6 text-slate-700 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (selectedType) && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Select {selectedType} Venue</p>
          <div className="relative">
            <select 
              onChange={(e) => handleLocSelect(e.target.value)}
              className="w-full bg-slate-900 p-6 rounded-[2rem] border border-slate-800 text-white font-black italic uppercase tracking-tighter outline-none focus:ring-4 focus:ring-blue-600/20 appearance-none shadow-2xl"
              defaultValue=""
            >
              <option value="" disabled>Browse verified locations...</option>
              {filteredLocations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <button onClick={() => setStep(1)} className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase italic tracking-tighter px-2">← Switch Category</button>
        </div>
      )}

      {step === 3 && selectedLoc && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-3xl text-center">
             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Destination Locked</p>
             <h3 className="font-black text-white italic uppercase tracking-tighter text-xl">{selectedLoc.name}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => { setSelectedVehicle('two-wheeler'); setStep(4); }}
              className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 hover:border-blue-600 transition flex flex-col items-center text-center group shadow-xl"
            >
              <div className="text-6xl mb-4 animate-bike group-hover:scale-125 transition duration-500">🏍️</div>
              <span className="font-black text-white italic uppercase tracking-tighter">Two Wheeler</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Bike/Scooter</span>
            </button>
            <button 
              onClick={() => { setSelectedVehicle('four-wheeler'); setStep(4); }}
              className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 hover:border-blue-600 transition flex flex-col items-center text-center group shadow-xl"
            >
              <div className="text-6xl mb-4 animate-car group-hover:scale-125 transition duration-500">🚗</div>
              <span className="font-black text-white italic uppercase tracking-tighter">Four Wheeler</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Car/SUV</span>
            </button>
          </div>
        </div>
      )}

      {step === 4 && selectedLoc && selectedVehicle && (
        <div className="space-y-6 animate-in zoom-in duration-400">
           <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex justify-between items-center">
             <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selected Location</p>
               <h3 className="font-black text-white italic uppercase tracking-tighter text-sm">{selectedLoc.name}</h3>
             </div>
             <div className="text-2xl">{selectedVehicle === 'two-wheeler' ? '🏍️' : '🚗'}</div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Available Parking Levels</p>
            {selectedLoc.levels.filter(l => l.type === selectedVehicle).map(level => {
               const isFull = level.occupied >= level.capacity;
               return (
                 <button 
                  key={level.levelNumber}
                  disabled={isFull}
                  onClick={() => { setSelectedLevel(level); setStep(5); }}
                  className={`w-full p-6 rounded-3xl border flex justify-between items-center transition group shadow-xl ${isFull ? 'bg-slate-950/50 border-red-900/20 opacity-60 cursor-not-allowed' : 'bg-slate-900 border-slate-800 hover:border-blue-600'}`}
                 >
                   <div className="text-left">
                     <p className={`font-black italic uppercase tracking-tighter text-lg ${isFull ? 'text-slate-600' : 'text-white'}`}>LEVEL {level.levelNumber}</p>
                     <p className={`text-[10px] font-bold uppercase tracking-widest ${isFull ? 'text-red-500' : 'text-blue-400'}`}>
                       {isFull ? '❌ COMPLETELY FULL' : `${level.capacity - level.occupied} slots free`}
                     </p>
                   </div>
                   <div className="text-right">
                      <p className={`text-[10px] font-black uppercase mb-1 ${isFull ? 'text-red-900' : 'text-slate-600'}`}>Load: {Math.round((level.occupied/level.capacity)*100)}%</p>
                      <div className="bg-slate-950 h-2 w-32 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-600 shadow-[0_0_10px_#dc2626]' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]'}`} 
                            style={{ width: `${(level.occupied / level.capacity) * 100}%` }}
                          ></div>
                      </div>
                   </div>
                 </button>
               );
            })}
          </div>
        </div>
      )}

      {step === 5 && selectedLoc && selectedLevel && selectedVehicle && (
        <SlotGrid 
          level={selectedLevel} 
          onSelectSlot={handleFinalize} 
        />
      )}
    </div>
  );
};

export default ReservationFlow;
