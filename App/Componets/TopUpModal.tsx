
import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  currentBalance: number;
  onSuccess: (newBalance: number) => void;
}

const TopUpModal: React.FC<Props> = ({ onClose, currentBalance, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'upi' | 'banking' | 'qr'>('upi');

  const handlePay = () => {
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) {
      onSuccess(currentBalance + val);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Fuel Wallet</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="mb-8">
          <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Top-up Amount</label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-blue-500 italic tracking-tighter">₹</span>
            <input 
              type="number" autoFocus
              className="w-full pl-12 pr-6 py-6 bg-slate-950 rounded-3xl text-3xl font-black text-white outline-none border border-slate-800 focus:border-blue-600 transition italic tracking-tighter"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3 mb-10">
          <p className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] px-1">Gateway</p>
          <button 
            onClick={() => setMethod('upi')}
            className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition ${method === 'upi' ? 'border-blue-600 bg-blue-600/10' : 'border-slate-800 bg-slate-950'}`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400 font-black text-[10px] tracking-tighter italic">UPI</div>
              <span className="font-bold text-white text-sm uppercase italic tracking-tighter">Instant Transfer</span>
            </div>
            {method === 'upi' && <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>}
          </button>

          <button 
            onClick={() => setMethod('qr')}
            className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition ${method === 'qr' ? 'border-blue-600 bg-blue-600/10' : 'border-slate-800 bg-slate-950'}`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center text-green-400 text-lg">📸</div>
              <span className="font-bold text-white text-sm uppercase italic tracking-tighter">Scan & Pay</span>
            </div>
            {method === 'qr' && <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>}
          </button>
        </div>

        <button 
          onClick={handlePay}
          className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl hover:bg-blue-500 transition shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-30 uppercase italic tracking-tighter"
          disabled={!amount || parseFloat(amount) <= 0}
        >
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

export default TopUpModal;
