import React, { useState, useEffect } from 'react';
import ReportModal from './ReportModel'; // Check spelling: Modal vs Model

const Navbar = () => {
  const [time, setTime] = useState(new Date());
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <nav className="h-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-8 z-1000">
        {/* Left: Search Bar */}
        <div className="flex items-center w-1/3">
          <div className="relative w-full max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">🔍</span>
            <input
              type="text"
              placeholder="Search Bus, Route or Station..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-[#C05621] transition-all"
            />
          </div>
        </div>

        {/* Right: Status, Clock, and Alert */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Live</span>
          </div>

          <div className="text-right">
            <p className="text-white font-mono text-lg leading-none">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-tighter mt-1">Kathmandu Standard Time</p>
          </div>

          {/* FIXED: The button now has the onClick handler */}
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="bg-[#C05621] hover:bg-[#a3491c] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-[0_0_15px_rgba(192,86,33,0.3)]"
          >
            REPORT DELAY
          </button>
        </div>
      </nav>

      {/* The Modal Component */}
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;