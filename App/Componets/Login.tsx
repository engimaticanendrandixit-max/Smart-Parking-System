
import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
}

const Login: React.FC<Props> = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = {
      fullName: 'Gaurav Kumar',
      email: email || 'gaurav@example.com',
      phone: '+91 9876543210',
      vehicleNo: 'UP 78 AB 1234',
      fastagId: 'FT-88992211',
      walletBalance: 450.50
    };
    onLogin(mockUser);
  };

  return (
    <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 w-full animate-in fade-in zoom-in duration-300">
      <h2 className="text-3xl font-black text-white mb-2 italic tracking-tighter uppercase">Welcome</h2>
      <p className="text-slate-400 mb-8 text-sm">FasTag Integrated Parking Management</p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Email / Phone</label>
          <input 
            type="text" 
            required
            className="w-full bg-slate-950 px-4 py-4 rounded-2xl border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Enter credentials"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Password</label>
          <input 
            type="password" 
            required
            className="w-full bg-slate-950 px-4 py-4 rounded-2xl border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-500 transition shadow-xl shadow-blue-500/20 active:scale-95 uppercase italic tracking-tighter"
        >
          Initialize Session
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm">
          New to ParkSense? {' '}
          <button onClick={onSwitchToSignup} className="text-blue-400 font-bold hover:underline">
            Register Vehicle
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
