
import React, { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to ParkSense",
    description: "The ultimate RFID-based smart parking ecosystem integrated with your FasTag. Presented by Team CodeNXT.",
    icon: "🚀"
  },
  {
    title: "Seamless FasTag Wallet",
    description: "No more cash or cards. Your parking fees are automatically deducted from your digital wallet via RFID handshake.",
    icon: "💳"
  },
  {
    title: "Instant Reservation",
    description: "Browse Hotels, Malls, and Central hubs to lock your slot before you even arrive. Real-time availability at your fingertips.",
    icon: "🅿️"
  },
  {
    title: "AI reach guidance",
    description: "After booking, get precise reach formats and slot navigation powered by Gemini AI to find your spot instantly.",
    icon: "📍"
  }
];

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[200] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-sm text-center relative z-10">
        <div className="text-7xl mb-8 animate-bounce transition-transform duration-500 transform hover:scale-110">
          {steps[currentStep].icon}
        </div>
        
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4 animate-in slide-in-from-bottom duration-500">
          {steps[currentStep].title}
        </h2>
        
        <p className="text-slate-400 font-medium leading-relaxed mb-12 min-h-[80px] animate-in slide-in-from-bottom duration-700">
          {steps[currentStep].description}
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mb-10">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-blue-500 shadow-[0_0_10px_#2563eb]' : 'w-2 bg-slate-800'}`}
            ></div>
          ))}
        </div>

        <div className="space-y-4">
          <button 
            onClick={next}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl hover:bg-blue-500 transition shadow-xl shadow-blue-500/20 active:scale-95 uppercase italic tracking-tighter"
          >
            {currentStep === steps.length - 1 ? 'Start Parking' : 'Next Step'}
          </button>
          
          <button 
            onClick={onComplete}
            className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase italic tracking-widest transition"
          >
            Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
