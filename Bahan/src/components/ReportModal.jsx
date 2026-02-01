import React, { useState } from 'react';
import ReportingPanel from './ReportingPanel';
import RewardsVault from './RewardsVault';
import { X, ShieldAlert, Gift } from 'lucide-react';

const ReportModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('intel'); // 'intel' | 'rewards'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop with heavy blur for focus */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Tab Switcher Header */}
        <div className="flex border-b border-white/5 bg-white/5">
          <button 
            onClick={() => setActiveTab('intel')}
            className={`flex-1 py-5 flex items-center justify-center gap-2 transition-all ${activeTab === 'intel' ? 'text-white bg-white/5 border-b-2 border-[#C05621]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <ShieldAlert size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Field Intel</span>
          </button>
          <button 
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-5 flex items-center justify-center gap-2 transition-all ${activeTab === 'rewards' ? 'text-white bg-white/5 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Gift size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Rewards</span>
          </button>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              {activeTab === 'intel' ? "Intelligence Report" : "Rewards Vault"}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Dynamic Content Switching */}
          <div className="min-h-[300px] animate-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'intel' ? (
              <ReportingPanel onActionComplete={() => {
                // Short delay for user feedback before closing
                setTimeout(onClose, 400);
              }} />
            ) : (
              <RewardsVault />
            )}
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="bg-white/5 p-4 text-center border-t border-white/5">
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
              {activeTab === 'intel' 
                ? "Your data improves Kathmandu's transit accuracy" 
                : "Verified intel earns you real-world currency"}
            </p>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;