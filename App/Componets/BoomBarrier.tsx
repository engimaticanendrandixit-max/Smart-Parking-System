import React, { useState, useEffect } from 'react';

interface Props {
  vehicleNo?: string;
  fastagId?: string;
  onBarrierStateChange?: (isOpen: boolean) => void;
}

const BoomBarrier: React.FC<Props> = ({ vehicleNo = "UP 78 AB 1234", fastagId = "FT-88992211", onBarrierStateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>(['[SYSTEM] WAITING AT RFID MAIN GAUNTLET...']);

  const addLog = (msg: string) => {
    setLogMessages((prev) => [msg, ...prev.slice(0, 4)]);
  };

  const handleSimulateSensor = () => {
    if (scanning || isOpen) return;

    setScanning(true);
    addLog(`[SENSOR] VEHICLE DETECTED: [${vehicleNo}]`);
    
    // RFID identification handshake
    setTimeout(() => {
      addLog(`[RFID] SENSING FASTAG REF: ${fastagId}...`);
      
      setTimeout(() => {
        addLog('[FAS-SECURE] ID MATCHED. CHECKING WALLET STAKE...');
        
        setTimeout(() => {
          addLog('[BILLING] ACCOUNT APPROVED. FEE: ₹40.00 PARKSENSE HANDSHAKE VALID.');
          setIsOpen(true);
          setScanning(false);
          addLog('[BARRIER] BOOM GATES UNFOLDING. PROCEED SLOWLY.');
          if (onBarrierStateChange) onBarrierStateChange(true);

          // Auto close after 6 seconds of simulated vehicle passing through
          setTimeout(() => {
            setIsOpen(false);
            addLog('[SENSOR] VEHICLE HAS CLEARED SENSORS. COILING BARRIER RETREAT.');
            addLog('[SYSTEM] GATE BARRIER SECURELY CLOSED.');
            if (onBarrierStateChange) onBarrierStateChange(false);
          }, 6000);

        }, 1200);
      }, 1000);
    }, 1000);
  };

  const toggleManual = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    addLog(`[MANUAL OVERRIDE] BARRIER ${nextState ? 'DEPLOYED OPEN' : 'DEPLOYED CLOSED'}.`);
    if (onBarrierStateChange) onBarrierStateChange(nextState);
  };

  return (
    <div id="boom-barrier-simulator" className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-6">
      {/* Visual Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-2 py-1 rounded-md border border-indigo-500/20 uppercase tracking-widest inline-flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full bg-indigo-400 ${isOpen ? 'animate-ping' : ''}`}></span>
            ARDUINO GATES
          </span>
          <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mt-1">
            Access Barrier Control
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black text-slate-500 uppercase">LED:</span>
          <div className={`w-4 h-4 rounded-full border shadow-[0_0_12px] transition-all duration-500 ${
            isOpen 
              ? 'bg-emerald-500 border-emerald-400 shadow-emerald-500/60' 
              : scanning 
                ? 'bg-amber-500 border-amber-400 shadow-amber-500/60 animate-pulse' 
                : 'bg-red-500 border-red-400 shadow-red-500/60'
          }`}></div>
        </div>
      </div>

      {/* Main Structural Visual Representation of Boom Barrier Gate */}
      <div className="relative h-44 bg-slate-950 rounded-[2rem] border border-slate-800/80 overflow-hidden flex items-end justify-center pb-4 select-none">
        {/* Sky / Grid Background */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Simulation Overlay Labels */}
        <div className="absolute top-4 left-4 text-[8px] font-mono text-slate-600 uppercase tracking-widest">
          RFID ZONE MAIN GATE TERMINAL 01
        </div>
        <div className="absolute top-4 right-4 text-[8px] font-mono text-indigo-400 uppercase tracking-widest">
          {isOpen ? 'STATUS: MOUNT OPEN' : scanning ? 'STATUS: INITIATING SENSE' : 'STATUS: CLOSED SECURE'}
        </div>

        {/* Pivot Post Column & Boom Arm Container */}
        <div className="relative w-full max-w-[280px] h-28 flex items-end justify-between px-6 z-10">
          
          {/* Leftside Gate Post Housing where the Boom arm attaches */}
          <div className="relative w-12 h-20 bg-gradient-to-t from-slate-850 to-slate-700 border-x border-t border-slate-600 rounded-t-xl flex flex-col items-center justify-start pt-3 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
            {/* Logo on controller cage */}
            <div className="w-5 h-5 bg-slate-950 rounded-sm border border-slate-800 flex items-center justify-center">
              <span className="text-[7px] text-blue-500 font-black italic">PS</span>
            </div>
            {/* Embedded Bolt / Pivot point */}
            <div className="absolute bottom-6 right-2 w-4 h-4 bg-slate-900 rounded-full border-2 border-slate-500 flex items-center justify-center z-20">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
            </div>

            {/* Rotating Stripey Boom Barrier Arm */}
            <div 
              style={{
                transform: isOpen ? 'rotate(-90deg)' : 'rotate(0deg)',
                transformOrigin: '90% 50%',
              }}
              className="absolute bottom-6 right-4 w-48 h-3.5 bg-yellow-400 rounded-lg flex items-center overflow-hidden border border-yellow-500 shadow-2xl transition-transform duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] z-10"
            >
              {/* Slanted caution stripes embedded inside the bar */}
              <div className="w-full h-full flex justify-between pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-4 h-full bg-slate-950 bg-opacity-95 transform -skew-x-12"
                    style={{ marginLeft: i === 0 ? '-4px' : '0' }}
                  ></div>
                ))}
              </div>
              
              {/* Optional glowing Warning LED tape on the bar */}
              <div className={`absolute left-4 right-4 h-0.5 rounded-full transition-all duration-500 ${
                isOpen ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-500 shadow-[0_0_8px_#f87171]'
              }`}></div>
            </div>
          </div>

          {/* Rightside Receiver Post */}
          <div className="relative w-8 h-10 bg-slate-850 border-x border-t border-slate-700 rounded-t-lg flex flex-col items-center justify-center">
            {/* Lock slot latch */}
            <div className="w-4 h-4 bg-slate-950 rounded-b border border-slate-800"></div>
          </div>

        </div>

        {/* Dynamic Warning Signal on ground */}
        <div className={`absolute bottom-0 left-12 right-12 h-1 bg-gradient-to-r transition-all duration-1000 ${
          isOpen ? 'from-emerald-500/20 via-emerald-500/50 to-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'from-red-500/20 via-red-500/50 to-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
        }`}></div>
      </div>

      {/* Control Actions Bento Panel Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleSimulateSensor}
          disabled={scanning || isOpen}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-40 uppercase italic tracking-tighter text-xs"
        >
          {scanning ? 'SCANNING FASTAG...' : isOpen ? 'VEHICLE PASSING' : 'SIMULATE FAS-SCAN'}
        </button>

        <button
          onClick={toggleManual}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-black py-4 rounded-2xl transition border border-slate-700 active:scale-95 uppercase italic tracking-tighter text-xs"
        >
          {isOpen ? 'MANUAL CLOSE' : 'MANUAL OPEN'}
        </button>
      </div>

      {/* Terminal Logging box for real status monitoring */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">
          Gate RFID Comm Diagnostics
        </p>
        <div className="space-y-1 font-mono text-[9px] text-slate-400">
          {logMessages.map((msg, idx) => (
            <div key={idx} className={`truncate ${idx === 0 ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoomBarrier;
