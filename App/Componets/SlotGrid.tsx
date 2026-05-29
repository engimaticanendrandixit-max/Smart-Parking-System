
import React, { useState, useEffect, useRef } from 'react';
import { ParkingLevel } from '../types';

interface Props {
  level: ParkingLevel;
  onSelectSlot: (slotId: string) => void;
}

const SlotGrid: React.FC<Props> = ({ level, onSelectSlot }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(4);
  const [displayLimit, setDisplayLimit] = useState(24);

  // Responsive calculation logic
  useEffect(() => {
    const calculateLayout = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      // Define preferred slot size (including gap)
      const slotSize = 75; 
      const calculatedCols = Math.max(3, Math.floor(containerWidth / slotSize));
      
      // We want to show a representative set of slots, but not so many it lags.
      const calculatedRows = window.innerHeight > 800 ? 8 : 6;
      const maxSlots = calculatedCols * calculatedRows;
      
      setColumns(calculatedCols);
      setDisplayLimit(Math.min(level.capacity, maxSlots));
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, [level.capacity]);

  // Calculate occupancy metrics
  const occupancyRatio = level.occupied / level.capacity;
  const isFull = level.occupied >= level.capacity;
  const isHighDemand = occupancyRatio >= 0.85 && !isFull;
  const isModerateDemand = occupancyRatio >= 0.6 && occupancyRatio < 0.85;

  const handleSlotClick = (id: string) => {
    setSelected(id);
    setIsConfirmed(false);
  };

  // Generate dynamic availability style based on floor load
  const getAvailabilityStyle = (isOccupied: boolean, isSelected: boolean) => {
    if (isOccupied) return 'bg-slate-950 border-slate-900 text-slate-800 cursor-not-allowed';
    
    // Selection state is most prominent
    if (isSelected) return 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] scale-110 z-10 ring-2 ring-blue-400/50';

    // Intensity levels for available slots
    if (isHighDemand) {
      return 'bg-amber-500/10 border-amber-500/40 text-amber-500 hover:bg-amber-600 hover:text-white animate-pulse-intense shadow-[0_0_10px_rgba(245,158,11,0.1)]';
    }
    if (isModerateDemand) {
      return 'bg-yellow-500/50 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-white';
    }
    return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-600 hover:text-white';
  };

  // Dynamic slot generation based on calculated limit
  const slots = Array.from({ length: displayLimit }, (_, i) => {
    const actualIndex = Math.floor(i * (level.capacity / displayLimit));
    return {
      id: `SLOT-${String.fromCharCode(65 + level.levelNumber)}-${actualIndex + 1}`,
      occupied: i < (level.occupied / level.capacity) * displayLimit || isFull
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div 
        ref={containerRef}
        className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden"
      >
        {/* Visual Demand Indicator Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Floor Operations</p>
            <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isFull ? 'text-red-500' : isHighDemand ? 'text-amber-500' : isModerateDemand ? 'text-yellow-500' : 'text-emerald-500'}`}>
              {isFull ? '🚫 ENTRY CLOSED' : isHighDemand ? '⚠️ LIMITED SLOTS' : isModerateDemand ? '⚖️ MODERATE LOADS' : '✅ HIGH AVAILABILITY'}
            </p>
          </div>
          <div className="bg-slate-950 px-4 py-1.5 rounded-full text-[10px] font-black text-blue-400 italic uppercase tracking-tighter border border-slate-800 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isFull ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`}></span>
            LVL {level.levelNumber}
          </div>
        </div>

        {/* Enhanced Real-time Occupancy Counter & Progress Bar */}
        <div className="mb-8 space-y-4 bg-slate-950/40 p-5 rounded-[2rem] border border-slate-800/50 shadow-inner">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isFull ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]'}`}></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Capacity Monitor</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white italic tracking-tighter">
                {level.occupied}
                <span className="text-slate-600 text-sm mx-1.5">/</span>
                <span className="text-slate-500 text-sm">{level.capacity}</span>
              </span>
              <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest -mt-1">Slots Allocated</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden relative shadow-inner">
              <div 
                className={`h-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 ${
                  isFull ? 'bg-red-600 shadow-[0_0_15px_#dc2626]' :
                  isHighDemand ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 
                  isModerateDemand ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]' : 
                  'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                }`}
                style={{ width: `${occupancyRatio * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center px-1">
               <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Zone Entry</span>
               <span className={`text-[9px] font-black italic tracking-tighter ${isFull ? 'text-red-500' : 'text-blue-400'}`}>
                 SYSTEM LOAD: {Math.round(occupancyRatio * 100)}%
               </span>
               <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Full Capacity</span>
            </div>
          </div>
        </div>
        
        {isFull ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in">
             <div className="text-5xl">🛑</div>
             <p className="font-black text-white uppercase italic tracking-tighter">No entry permitted</p>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-8">All slots on this floor are currently locked or occupied. Please return and select another level.</p>
          </div>
        ) : (
          <>
            <div 
              className="grid gap-4 max-h-[400px] overflow-y-auto p-1 custom-scrollbar"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  disabled={slot.occupied}
                  onClick={() => handleSlotClick(slot.id)}
                  className={`
                    aspect-square rounded-2xl flex items-center justify-center text-[8px] font-black transition-all duration-500 border
                    ${getAvailabilityStyle(slot.occupied, selected === slot.id)}
                  `}
                >
                  {slot.occupied ? 'FULL' : slot.id.split('-').pop()}
                </button>
              ))}
            </div>

            {selected && (
              <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-between animate-in zoom-in duration-300">
                <div>
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Selected Slot</p>
                  <p className="text-sm font-black text-white italic tracking-tighter uppercase">{selected}</p>
                </div>
                {!isConfirmed ? (
                  <button 
                    onClick={() => setIsConfirmed(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-tighter shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition active:scale-95"
                  >
                    Confirm Choice
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6 text-[9px] font-black uppercase italic tracking-tighter border-t border-slate-800/50 pt-6">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 border rounded-sm ${isFull ? 'bg-slate-950' : isHighDemand ? 'bg-amber-900/20 border-amber-500/50 animate-pulse' : isModerateDemand ? 'bg-yellow-900/20 border-yellow-500/40' : 'bg-emerald-900/20 border-emerald-500/30'}`}></div>
            <span className="text-slate-400">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-slate-950 border border-slate-900 rounded-sm"></div>
            <span className="text-slate-700">Reserved</span>
          </div>
        </div>
      </div>

      <button
        disabled={!selected || !isConfirmed || isFull}
        onClick={() => selected && onSelectSlot(selected)}
        className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl hover:bg-blue-500 disabled:opacity-30 transition shadow-xl shadow-blue-500/20 active:scale-95 uppercase italic tracking-tighter flex items-center justify-center gap-3"
      >
        <span>Lock Selected Slot</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
};

export default SlotGrid;
