
import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  onSignup: (user: User) => void;
  onSwitchToLogin: () => void;
}

const Signup: React.FC<Props> = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    vehicleNo: '',
    fastagId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      ...formData,
      walletBalance: 100.00
    };
    onSignup(newUser);
  };

  return (
    <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 w-full animate-in fade-in slide-in-from-bottom duration-300">
      <h2 className="text-3xl font-black text-white mb-2 italic tracking-tighter uppercase">Join Us</h2>
      <p className="text-slate-400 mb-8 text-sm">Register your vehicle & FasTag ID</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <input 
            type="text" required placeholder="Full Name"
            className="w-full bg-slate-950 px-4 py-4 rounded-2xl border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
          <input 
            type="email" required placeholder="Email Address"
            className="w-full bg-slate-950 px-4 py-4 rounded-2xl border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="tel" required placeholder="Phone Number"
            className="w-full bg-slate-950 px-4 py-4 rounded-2xl border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <input 
            type="text" required placeholder="Vehicle No (e.g. UP 32 AB 1234)"
            className="w-full bg-slate-950 px-4 py-4 rounded-2xl border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={formData.vehicleNo}
            onChange={(e) => setFormData({...formData, vehicleNo: e.target.value})}
          />
          <input 
            type="text" required placeholder="FasTag RFID ID"
            className="w-full bg-slate-950 px-4 py-4 rounded-2xl border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={formData.fastagId}
            onChange={(e) => setFormData({...formData, fastagId: e.target.value})}
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-500 transition shadow-xl shadow-blue-500/20 active:scale-95 mt-4 uppercase italic tracking-tighter"
        >
          Create Digital Account
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-500 text-sm">
          Already have an account? {' '}
          <button onClick={onSwitchToLogin} className="text-blue-400 font-bold hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
