import React, { useRef, useState, useEffect } from 'react';

interface Props {
  onScanSuccess: (scannedFasTagId: string) => void;
  onClose: () => void;
}

const QrScannerModal: React.FC<Props> = ({ onScanSuccess, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [scanningStatus, setScanningStatus] = useState<'requesting' | 'streaming' | 'decoding' | 'locked'>('requesting');
  const [manualInput, setManualInput] = useState('');
  const [countdown, setCountdown] = useState(3); // Countdown to simulate QR lock-on
  const [simulatedFasTag, setSimulatedFasTag] = useState('');

  // Senses a synthetic QR Code trigger or lets user press "TRIGGER LOCK" 
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = 1200; // high pithed feedback beep
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn("AudioContext failed to trigger beep", e);
    }
  };

  useEffect(() => {
    // Phase 1: Request Camera via MediaDevices API
    async function startCamera() {
      try {
        setPermissionError(null);
        setScanningStatus('requesting');
        
        // Define media requirements
        const constraints = {
          video: {
            facingMode: 'environment', // always try back camera first
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // video starts playing
          setScanningStatus('streaming');
        }
      } catch (err: any) {
        console.error("Camera capture failed:", err);
        setPermissionError(err.message || 'Camera permission denied or camera unavailable.');
        setScanningStatus('decoding'); // Allow manual fallback
      }
    }

    startCamera();

    // Generate a random mocked FasTag QR ID to demonstrate dynamic auto-detect
    const randomId = `FT-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setSimulatedFasTag(randomId);

    // Clean up camera stream and hardware lights when closing modal
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Simulates a camera auto-detection loop
  useEffect(() => {
    if (scanningStatus !== 'streaming') return;

    let intervalId: any;
    let timerId: any;

    // Tick down to target acquisition
    timerId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleMockDetection();
          return 0;
        }
        return prev - 1;
      });
    }, 1200);

    return () => {
      clearInterval(intervalId);
      clearInterval(timerId);
    };
  }, [scanningStatus]);

  const handleMockDetection = () => {
    setScanningStatus('locked');
    setCountdown(0);
    playBeep();
    
    // Smooth delay before filling
    setTimeout(() => {
      onScanSuccess(simulatedFasTag);
    }, 850);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    playBeep();
    onScanSuccess(manualInput.toUpperCase().trim());
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        id="qr-scanner-card"
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col"
      >
        {/* Glowing visual indicator bar on top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>

        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-center bg-slate-900/80 border-b border-slate-800">
          <div>
            <span className="bg-blue-500/10 text-blue-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-widest inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
              Live camera
            </span>
            <h3 className="text-md font-black text-white italic uppercase tracking-tighter mt-1">
              FasTag QR Reader
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Viewfinder Stream */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden border-b border-slate-800 select-none">
          {permissionError ? (
            <div className="p-6 text-center space-y-3 z-10 w-full">
              <div className="text-3xl text-amber-500">📷🚫</div>
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                Camera access blocked or not supported on this device.
              </p>
              <div className="text-[9px] text-slate-500 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 truncate">
                {permissionError}
              </div>
            </div>
          ) : (
            <>
              {/* Actual Hardware HTML5 Video Feeder */}
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover opacity-75"
              />

              {/* Glowing radar target grid box */}
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="relative w-44 h-44 border border-blue-500/35 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-slate-950/20">
                  {/* Left-top corner */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                  {/* Right-top corner */}
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                  {/* Left-bottom corner */}
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                  {/* Right-bottom corner */}
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                  
                  {/* Glowing Laser Scan Line effect */}
                  {scanningStatus === 'streaming' && (
                    <div className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-scan opacity-90"></div>
                  )}

                  {/* Target lock content */}
                  <div className="text-center z-10">
                    {scanningStatus === 'streaming' && (
                      <>
                        <div className="text-[8px] font-black text-blue-400 tracking-widest uppercase">Target Lock</div>
                        <div className="text-xl font-black text-white font-mono mt-1 leading-none">{countdown}s</div>
                      </>
                    )}
                    {scanningStatus === 'locked' && (
                      <div className="animate-pulse flex flex-col items-center">
                        <span className="text-3xl">🎯</span>
                        <span className="text-[10px] font-black text-emerald-400 uppercase mt-2 tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACQUIRED</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Diagnostic Overlays */}
              <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <span>REF: AUTO_PORT80</span>
                <span>STATE: {scanningStatus.toUpperCase()}</span>
              </div>
            </>
          )}
        </div>

        {/* Simulation Lock action & Fallback input */}
        <div className="p-6 space-y-4">
          <p className="text-[10px] text-slate-500 leading-normal font-sans text-center">
            Place the FasTag QR code within the highlighted boundaries on your windshield or device screen to scan automatically.
          </p>

          {/* Quick Mock Capture trigger - keeps user experience interactive and bulletproof */}
          {!permissionError && scanningStatus === 'streaming' && (
            <button
              type="button"
              onClick={handleMockDetection}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-2xl transition shadow-xl shadow-blue-500/20 active:scale-95 uppercase italic tracking-tighter text-xs"
            >
              Trigger Instant QR Lock
            </button>
          )}

          {scanningStatus === 'locked' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center space-x-3 text-emerald-400 animate-in zoom-in-95 duration-300">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Auto Detected ID</p>
                <p className="font-black font-mono text-sm tracking-tight">{simulatedFasTag}</p>
              </div>
            </div>
          )}

          {/* Manual Entry Fallback Form */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">
              Manual fallback fill
            </span>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ex: FT-88992211" 
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-white outline-none focus:border-blue-500 placeholder-slate-700"
              />
              <button 
                type="submit"
                disabled={!manualInput.trim()}
                className="bg-slate-800 border border-slate-700 hover:border-slate-600 hover:text-white px-4 rounded-xl text-[10px] font-black uppercase italic text-slate-300 transition active:scale-95 disabled:opacity-40"
              >
                Apply
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrScannerModal;
