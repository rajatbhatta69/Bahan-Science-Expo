import React, { useState, useEffect, useContext } from 'react';
import ReportModal from './ReportModal'; // Verify spelling: Modal vs Model
import UserHub from './UserHub';
import { UserContext } from '../context/UserContext';
import { Search, Clock } from 'lucide-react';

const Navbar = () => {
  const [time, setTime] = useState(new Date());
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <nav className="h-16 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-[1000] sticky top-0">
        
        {/* Left: Command Search */}
        <div className="flex items-center w-1/3">
          <div className="relative w-full max-w-xs group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#C05621] transition-colors" />
            <input
              type="text"
              placeholder="COMMAND SEARCH..."
              className="w-full bg-white/5 border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-[10px] font-bold tracking-widest text-zinc-200 focus:outline-none focus:border-[#C05621]/50 focus:bg-white/10 transition-all placeholder:text-zinc-700 uppercase"
            />
          </div>
        </div>

        {/* Right: Telemetry & User Hub */}
        <div className="flex items-center space-x-6">
          
          {/* Status Indicator */}
          <div className="hidden xl:flex items-center space-x-3">
             <div className="text-right">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none">Status: Nominal</p>
              <p className="text-[8px] text-zinc-600 uppercase font-bold mt-1">Nodes Active: 24/24</p>
            </div>
            <div className="h-8 w-[1px] bg-white/5" />
          </div>

          {/* Precision Clock */}
          <div className="flex items-center gap-3 mr-4">
            <Clock size={14} className="text-zinc-500" />
            <div className="text-left border-l border-white/10 pl-3">
              <p className="text-white font-mono text-sm font-bold tracking-wider leading-none">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </p>
              <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mt-1">KTM Standard</p>
            </div>
          </div>

          {/* THE ONLY USER HUB YOU NEED */}
          <UserHub onOpenReport={() => setIsReportModalOpen(true)} />
        </div>
      </nav>

      {/* The Modal */}
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;