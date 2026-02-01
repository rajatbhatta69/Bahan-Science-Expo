import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, ChevronDown } from 'lucide-react';

const UserHub = ({ onOpenReport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(UserContext);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 p-1 pr-3 rounded-full transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C05621] to-[#7b3415] flex items-center justify-center font-black text-white text-[10px]">
          {user.name[0]}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[10px] font-black text-white uppercase tracking-tighter">{user.name}</p>
          <p className="text-[8px] font-bold text-orange-500 uppercase">{user.points} XP</p>
        </div>
        <ChevronDown size={12} className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* This overlay ensures the menu closes if you click outside */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-3 w-56 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-2">
              <button 
                onClick={() => { onOpenReport(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group text-left"
              >
                <ShieldAlert size={16} className="text-orange-500" />
                <span className="text-xs font-bold text-zinc-300 uppercase">Submit Intel</span>
              </button>

              {/* THE SECRET DOOR */}
              <Link 
                to="/operator" 
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group"
              >
                <LayoutDashboard size={16} className="text-blue-500" />
                <span className="text-xs font-bold text-zinc-300 uppercase">Operator Console</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserHub;