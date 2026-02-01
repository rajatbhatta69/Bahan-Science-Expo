import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { MapPin, Bus, AlertTriangle } from 'lucide-react';

const IntelOption = ({ icon: Icon, title, desc, color, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group active:scale-[0.98]"
  >
    <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-white shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <div className="text-left">
      <p className="text-xs font-black text-white uppercase tracking-wider group-hover:text-[#C05621] transition-colors">{title}</p>
      <p className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">{desc}</p>
    </div>
  </button>
);

const ReportingPanel = ({ onActionComplete }) => {
  const { awardPoints } = useContext(UserContext);

  const handleReport = (type, points) => {
    // 1. Grant the XP
    awardPoints(points);
    
    // 2. Trigger any closing animation/logic in the parent modal
    if (onActionComplete) onActionComplete(type);
    
    // Optional: Alert or Toast can go here
    console.log(`Intel Received: ${type}. +${points} XP`);
  };

  return (
    <div className="space-y-3">
      <div className="px-2 mb-4">
        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Select Intel Type</h3>
      </div>

      <IntelOption 
        icon={Bus} 
        title="Bus Status" 
        desc="Occupancy or Facility update (+15 XP)" 
        color="bg-blue-500"
        onClick={() => handleReport('bus', 15)}
      />

      <IntelOption 
        icon={MapPin} 
        title="Route Intel" 
        desc="Stop or Path correction (+25 XP)" 
        color="bg-[#C05621]"
        onClick={() => handleReport('route', 25)}
      />

      <IntelOption 
        icon={AlertTriangle} 
        title="Traffic Alert" 
        desc="Live congestion update (+10 XP)" 
        color="bg-red-500"
        onClick={() => handleReport('traffic', 10)}
      />
    </div>
  );
};

export default ReportingPanel;