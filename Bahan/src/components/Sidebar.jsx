import React, { useState, useMemo } from 'react';
import { useBuses } from '../context/BusContext';
import { MapPin, Navigation, Search, X, Clock, Map as MapIcon, ChevronLeft, Zap } from 'lucide-react';
import { calculateDistance } from '../utils/geoUtils'; // Use the central utility
import AppLogo from '../assets/Logo_Dark.png'

// --- SUB-COMPONENT: SEARCHABLE DROPDOWN ---
const SearchableSelect = ({ label, icon, color, placeholder, value, onSelect, stations }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredStations = useMemo(() => {
    return [...stations]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, stations]);

  return (
    <div className="relative group">
      <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] ml-1">
        {label}
      </label>
      <div className="relative mt-1">
        <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${color}`}>
          {icon}
        </span>
        <input
          type="text"
          value={value ? value.name : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (value) onSelect(null);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 text-zinc-200 pl-10 pr-10 py-3 rounded-xl focus:border-[#C05621]/50 outline-none transition-all placeholder:text-zinc-600"
        />
        {(value || searchTerm) && (
          <button
            onClick={() => { onSelect(null); setSearchTerm(""); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && !value && searchTerm.length > 0 && (
        <div className="absolute z-100 w-full mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
          {filteredStations.length > 0 ? (
            filteredStations.map(s => (
              <div
                key={s.id}
                onClick={() => {
                  onSelect(s);
                  setSearchTerm(s.name);
                  setIsOpen(false);
                }}
                className="px-4 py-3 text-sm text-zinc-300 hover:bg-[#C05621] hover:text-white cursor-pointer border-b border-white/5 last:border-0 transition-colors"
              >
                {s.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-zinc-600 italic">No stations found...</div>
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN SIDEBAR COMPONENT ---
const Sidebar = () => {
  const {
    buses, STATIONS, ROUTES, userStart, setUserStart,
    userEnd, setUserEnd, setSelectedBus, selectedBus,
    findAndSelectNearestBus, showBuses, setShowBuses,
    activeDirection // <--- ADD THIS HERE
  } = useBuses();

  const handleSearchClick = () => {
    if (userStart && userEnd) {
      findAndSelectNearestBus();
    } else {
      alert("Please select both your location and destination.");
    }
  };

  const getNearestStationName = (busLat, busLng) => {
    if (!STATIONS || STATIONS.length === 0) return "Unknown";
    let nearest = STATIONS[0];
    let minDistance = Infinity;

    STATIONS.forEach(station => {
      const dist = calculateDistance(busLat, busLng, station.lat, station.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = station;
      }
    });
    return nearest.name;
  };

  const displayBuses = useMemo(() => {
    if (!showBuses || !userStart || !userEnd) return [];
    return buses.filter(bus => {
      const route = ROUTES.find(r => r.id === bus.routeId);
      const isOnRoute = route?.stations.includes(userStart.id) && route?.stations.includes(userEnd.id);
      // NEW: Only show buses moving in the calculated activeDirection
      return isOnRoute && bus.direction === activeDirection;
    });
  }, [showBuses, buses, ROUTES, userStart, userEnd, activeDirection]);

  return (
    <div className="w-96 h-screen bg-zinc-950/80 backdrop-blur-xl border-r border-white/10 flex flex-col font-sans z-[1000]">
      {/* Header Section */}
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center w-full space-y-4">
  <button
    onClick={() => window.location.reload()}
    className="flex flex-col items-center active:scale-95 transition-transform duration-200 w-full"
  >
    {/* Large, centered logo */}
    <img 
      src={AppLogo} 
      alt="Bahan Logo" 
      className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(192,86,33,0.2)]" 
    />
  </button>

  <div className="flex flex-col items-center gap-1.5">
    <div className="flex items-center gap-2.5">
      {/* Centered Live Status Indicator */}
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
      </span>
      
      {/* Slogan Centered */}
      <p className="text-[14px] font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent text-center font-noto-sans">
        सवारीको जानकारी हर पल हातमा
      </p>
    </div>
    
    {/* Centered English subtitle */}
    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em] text-center">
      Real-time Transit Intelligence
    </p>
  </div>
  
  {/* Optional: A subtle divider to separate the header from the inputs */}
  <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mt-2"></div>
</div>
        </div>
        <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
          <SearchableSelect
            label="From"
            icon={<MapPin size={16} />}
            color="text-[#C05621]"
            placeholder="Starting station"
            value={userStart}
            onSelect={(val) => { setUserStart(val); setShowBuses(false); setSelectedBus(null); }}
            stations={STATIONS}
          />

          <SearchableSelect
            label="To"
            icon={<Navigation size={16} />}
            color="text-blue-500"
            placeholder="Destination station"
            value={userEnd}
            onSelect={(val) => { setUserEnd(val); setShowBuses(false); setSelectedBus(null); }}
            stations={STATIONS}
          />

          <button
            onClick={handleSearchClick}
            className="w-full bg-[#C05621] hover:bg-[#e66a2e] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#C05621]/20 group"
          >
            <Search size={18} className="group-hover:scale-125 transition-transform" />
            FIND LIVE RIDES
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        {!showBuses ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <MapIcon size={48} className="text-zinc-700" />
            <p className="text-xs text-zinc-500 font-medium">Select your route to start<br />live tracking.</p>
          </div>
        ) : selectedBus ? (
          (() => {
            // 1. Get the LIVE data for the bus from the context
            const liveBus = buses.find(b => b.id === selectedBus.id) || selectedBus;

            // --- DISTANCE ---
            const displayDist = liveBus.pathDist && liveBus.pathDist > 0
              ? (liveBus.pathDist * 0.04).toFixed(1)
              : "Calculating...";

            // --- ETA ---
            const liveETA = liveBus.pathDist && liveBus.pathDist > 0
              ? Math.max(1, Math.round(liveBus.pathDist * 0.12))
              : "--";

            return (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                  onClick={() => setSelectedBus(null)}
                  className="flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors mb-2"
                >
                  <ChevronLeft size={14} /> Back to Results
                </button>

                <div className="bg-[#C05621] rounded-3xl p-6 text-white shadow-2xl shadow-[#C05621]/30 relative overflow-hidden">
                  <Zap className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        {/* Use the ID as the name since name might be undefined */}
                        <h2 className="text-3xl font-black tracking-tighter">{liveBus.id}</h2>
                        <p className="text-white/80 text-[10px] font-bold uppercase">
                          Next: {getNearestStationName(liveBus.lat, liveBus.lng)}
                        </p>
                      </div>
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        Moving
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-white/60 mb-1">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">ETA</span>
                        </div>
                        <div className="text-2xl font-black italic">
                          ~ {liveETA} <span className="text-xs not-italic font-medium">MIN</span>
                        </div>
                      </div>

                      <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-white/60 mb-1">
                          <MapIcon size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Distance</span>
                        </div>
                        <div className="text-2xl font-black italic">
                          {displayDist}
                          <span className="text-xs not-italic font-medium ml-1">KM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Status Card */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Tracking Mode</span>
                  <span className="text-emerald-500 font-mono text-[10px] font-bold animate-pulse">
                    ● ACTIVE LIVE
                  </span>
                </div>
              </div>
            );
          })()

        ) : (
          <div className="space-y-4">
            <h2 className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] px-1">Available Rides</h2>
            {displayBuses.map((bus) => (
              <div
                key={bus.id}
                onClick={() => setSelectedBus(bus)}
                className="p-5 rounded-2xl cursor-pointer transition-all border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 group relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-bold group-hover:text-[#C05621] transition-colors">{bus.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-medium mt-1">Near: {getNearestStationName(bus.lat, bus.lng)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[#C05621] font-black text-lg italic">
                      {(bus.pathDist * 0.04).toFixed(1)}
                      <span className="text-[10px] not-italic ml-1">KM</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {displayBuses.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-xs text-zinc-600 font-bold uppercase">No direct rides found.</p>
                <p className="text-[10px] text-zinc-700 mt-2">Try different stations or wait for the Transfer Update.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;