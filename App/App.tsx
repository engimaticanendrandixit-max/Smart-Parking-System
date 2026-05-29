
import React, { useState, useEffect } from 'react';
import { View, User, Reservation } from './types';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ReservationFlow from './components/ReservationFlow';
import SuccessView from './components/SuccessView';
import Onboarding from './components/Onboarding';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [user, setUser] = useState<User | null>(null);
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [preselectedLocationId, setPreselectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('parksense_user');
    const savedRes = localStorage.getItem('parksense_res');
    const seenOnboarding = localStorage.getItem('parksense_onboarding_seen');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedRes) setCurrentReservation(JSON.parse(savedRes));
      
      if (!seenOnboarding) {
        setShowOnboarding(true);
      }
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('parksense_user', JSON.stringify(u));
    
    const seenOnboarding = localStorage.getItem('parksense_onboarding_seen');
    if (!seenOnboarding) {
      setShowOnboarding(true);
    }
    setCurrentView('dashboard');
  };

  const handleSignup = (u: User) => {
    setUser(u);
    localStorage.setItem('parksense_user', JSON.stringify(u));
    setShowOnboarding(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentReservation(null);
    localStorage.removeItem('parksense_user');
    localStorage.removeItem('parksense_res');
    setCurrentView('login');
  };

  const handleReserve = (res: Reservation) => {
    setCurrentReservation(res);
    localStorage.setItem('parksense_res', JSON.stringify(res));
    setCurrentView('success');
  };

  const handleCancelBooking = () => {
    if (!user) return;
    const penalty = 5;
    const updatedUser = { ...user, walletBalance: user.walletBalance - penalty };
    setUser(updatedUser);
    setCurrentReservation(null);
    localStorage.setItem('parksense_user', JSON.stringify(updatedUser));
    localStorage.removeItem('parksense_res');
    alert(`Booking cancelled. ₹${penalty} cancellation fee deducted from your FasTag wallet.`);
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('parksense_onboarding_seen', 'true');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start pb-10 relative overflow-x-hidden">
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}

      {/* Header */}
      <header className="w-full bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center max-w-4xl mx-auto rounded-b-2xl">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/><circle cx="7" cy="14.5" r="1.5"/><circle cx="17" cy="14.5" r="1.5"/>
            </svg>
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">ParkSense</h1>
        </div>
        {user && !['login', 'signup'].includes(currentView) && (
          <div className="flex items-center space-x-4">
             {currentReservation && (
               <button 
                 onClick={handleCancelBooking}
                 className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-bold transition"
               >
                 Cancel Booking
               </button>
             )}
             <button 
              onClick={handleLogout}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="w-full max-w-md md:max-w-2xl px-4 pt-6">
        {currentView === 'login' && <Login onLogin={handleLogin} onSwitchToSignup={() => setCurrentView('signup')} />}
        {currentView === 'signup' && <Signup onSignup={handleSignup} onSwitchToLogin={() => setCurrentView('login')} />}
        {currentView === 'dashboard' && user && (
          <Dashboard 
            user={user} 
            activeReservation={currentReservation}
            onReserve={(locId?: string) => {
              setPreselectedLocationId(locId || null);
              setCurrentView('reserve');
            }} 
            onUpdateBalance={(bal) => setUser({ ...user, walletBalance: bal })}
            onCancel={handleCancelBooking}
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem('parksense_user', JSON.stringify(updated));
            }}
          />
        )}
        {currentView === 'reserve' && (
          <ReservationFlow 
            preselectedLocationId={preselectedLocationId}
            onBack={() => {
              setPreselectedLocationId(null);
              setCurrentView('dashboard');
            }} 
            onComplete={(res) => {
              setPreselectedLocationId(null);
              handleReserve(res);
            }} 
          />
        )}
        {currentView === 'success' && currentReservation && (
          <SuccessView reservation={currentReservation} onHome={() => setCurrentView('dashboard')} />
        )}
      </main>

      <footer className="mt-auto py-8 text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold text-center space-y-2">
        <p>Smart RFID Infrastructure &copy; {new Date().getFullYear()} PARKSENSE</p>
        <p className="text-blue-500/60 tracking-[0.3em] font-black italic">Presented by Team CodeNXT</p>
      </footer>
    </div>
  );
};

export default App;
