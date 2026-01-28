import React, { useState, useMemo } from 'react';
import { useBuses } from '../context/BusContext';
import { MapPin, Navigation, Search, X, Clock, Map as MapIcon, ChevronLeft, Zap } from 'lucide-react';
import { GitBranch, ArrowRight, Info } from 'lucide-react';
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
    activeDirection, setIsManuallyDismissed,
    findOptimalPath // <--- ADD THIS HERE
  } = useBuses();

  // --- TOUCH LOGIC START ---
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);

  // UI-only bottom sheet state
  const [sheetState, setSheetState] = useState('half');
  // 'collapsed' | 'half' | 'expanded'

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientY);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe) {
      setSheetState((prev) =>
        prev === 'collapsed' ? 'half' : 'expanded'
      );
    }

    if (isDownSwipe) {
      setSheetState((prev) =>
        prev === 'expanded' ? 'half' : 'collapsed'
      );
    }

  };
  // --- TOUCH LOGIC END ---

  const getNextStationName = (bus) => {
    const route = ROUTES.find(r => r.id === bus.routeId);
    if (!route || !bus.detailedPath || bus.detailedPath.length === 0) return "Detecting...";

    // 1. Map all stations on this route to their index on the OSRM path
    const stationMapping = route.stations.map(id => {
      const station = STATIONS.find(s => s.id === id);
      if (!station) return null;

      // Find where this station sits on the detailed line
      let stationPathIdx = -1;
      let minD = Infinity;
      const coords = bus.direction === 1 ? (station.cw || station) : (station.acw || station);

      bus.detailedPath.forEach((pt, i) => {
        const d = Math.pow(pt[0] - coords.lat, 2) + Math.pow(pt[1] - coords.lng, 2);
        if (d < minD) { minD = d; stationPathIdx = i; }
      });
      return { name: station.name, idx: stationPathIdx };
    }).filter(Boolean);

    // 2. Filter for the station that is IMMEDIATELY in front of the bus
    let next;
    if (bus.direction === 1) {
      next = stationMapping.filter(s => s.idx > bus.pathIndex).sort((a, b) => a.idx - b.idx)[0];
    } else {
      next = stationMapping.filter(s => s.idx < bus.pathIndex).sort((a, b) => b.idx - a.idx)[0];
    }

    // 3. Fallback for circular routes or end of line
    if (!next && route.isCircular) {
      return bus.direction === 1 ? stationMapping[0]?.name : stationMapping[stationMapping.length - 1]?.name;
    }

    return next ? next.name : "Arriving at Terminus";
  };

  const handleSearchClick = () => {
    if (userStart && userEnd) {
      findAndSelectNearestBus();
    } else {
      alert("Please select both your location and destination.");
    }
  };

  const journey = useMemo(() => {
    const path = findOptimalPath(userStart?.id, userEnd?.id, ROUTES);
    if (!path || path.type !== 'TRANSFER') return path;

    // 1. FIND NEAREST FIRST LEG BUS (Moving towards the User)
    const firstLegBuses = buses
      .filter(b => b.routeId === path.firstRouteId && b.direction === activeDirection)
      .map(bus => {
        // Calculate how far the bus is from the USER'S start station
        const route = ROUTES.find(r => r.id === bus.routeId);
        let distToUser = 0;

        // Find user station index in detailed path
        const userStation = STATIONS.find(s => s.id === userStart.id);
        const uCoords = bus.direction === 1 ? (userStation.cw || userStation) : (userStation.acw || userStation);
        let userPathIdx = -1;
        let minD = Infinity;
        bus.detailedPath.forEach((pt, i) => {
          const d = Math.pow(pt[0] - uCoords.lat, 2) + Math.pow(pt[1] - uCoords.lng, 2);
          if (d < minD) { minD = d; userPathIdx = i; }
        });

        const bIdx = bus.pathIndex;
        const total = bus.detailedPath.length;
        if (route.isCircular) {
          distToUser = bus.direction === 1 ? (userPathIdx - bIdx + total) % total : (bIdx - userPathIdx + total) % total;
        } else {
          distToUser = bus.direction === 1 ? (userPathIdx >= bIdx ? userPathIdx - bIdx : Infinity) : (bIdx >= userPathIdx ? bIdx - userPathIdx : Infinity);
        }
        return { ...bus, distToUser };
      })
      .filter(b => b.distToUser !== Infinity)
      .sort((a, b) => a.distToUser - b.distToUser);

    const bestFirstBus = firstLegBuses[0];

    // 2. CALCULATE LEG 1 TOTAL TRAVEL TIME (Bus to User + User to Hub)
    let leg1TravelTime = 15; // Realistic fallback for KTM
    const route1 = ROUTES.find(r => r.id === path.firstRouteId);

    if (route1 && bestFirstBus?.detailedPath) {
      // Find Hub index in detailed path
      const hubStation = STATIONS.find(s => s.id === path.transferAt);
      const hCoords = bestFirstBus.direction === 1 ? (hubStation.cw || hubStation) : (hubStation.acw || hubStation);
      let hubPathIdx = -1;
      let minH = Infinity;
      bestFirstBus.detailedPath.forEach((pt, i) => {
        const d = Math.pow(pt[0] - hCoords.lat, 2) + Math.pow(pt[1] - hCoords.lng, 2);
        if (d < minH) { minH = d; hubPathIdx = i; }
      });

      // Distance from Bus to Hub = (Bus to User) + (User to Hub)
      // Actually simpler: Just Bus to Hub
      const bIdx = bestFirstBus.pathIndex;
      const total = bestFirstBus.detailedPath.length;
      let distToHub = route1.isCircular
        ? (bestFirstBus.direction === 1 ? (hubPathIdx - bIdx + total) % total : (bIdx - hubPathIdx + total) % total)
        : (bestFirstBus.direction === 1 ? Math.max(0, hubPathIdx - bIdx) : Math.max(0, bIdx - hubPathIdx));

      leg1TravelTime = Math.round(distToHub * 0.12); // 0.12 mins per point
    }

    // 3. CALCULATE LEG 2 WAIT TIME (Real Bus tracking for the second route)
    const secondLegBuses = buses
      .filter(b => b.routeId === path.secondRouteId)
      .map(bus => {
        // Find distance from this bus to the HUB
        const hubStation = STATIONS.find(s => s.id === path.transferAt);
        const hCoords = bus.direction === 1 ? (hubStation.cw || hubStation) : (hubStation.acw || hubStation);
        let hubPathIdx = -1;
        let minH = Infinity;
        bus.detailedPath?.forEach((pt, i) => {
          const d = Math.pow(pt[0] - hCoords.lat, 2) + Math.pow(pt[1] - hCoords.lng, 2);
          if (d < minH) { minH = d; hubPathIdx = i; }
        });

        const bIdx = bus.pathIndex;
        const total = bus.detailedPath?.length || 100;
        const distToHub = (hubPathIdx - bIdx + total) % total;
        const etaToHub = distToHub * 0.12;

        return { ...bus, etaToHub };
      })
      // Find buses that arrive AFTER the user gets to the hub
      .filter(b => b.etaToHub > leg1TravelTime)
      .sort((a, b) => a.etaToHub - b.etaToHub);

    const bestNextBus = secondLegBuses[0];
    // Wait time is (Arrival of Next Bus) - (Arrival of User)
    const waitTime = bestNextBus ? Math.round(bestNextBus.etaToHub - leg1TravelTime) : 10;

    return {
      ...path,
      leg1Time: Math.max(1, leg1TravelTime),
      leg2Wait: Math.max(2, waitTime),
      nextBusName: bestNextBus?.name || "Next Available Bus"
    };
  }, [userStart, userEnd, ROUTES, buses, activeDirection]);

  const displayBuses = useMemo(() => {
    // Condition: ONLY requires the locations to be selected
    if (!userStart || !userEnd || !journey) return [];

    return buses.filter(bus => {
      const route = ROUTES.find(r => r.id === bus.routeId);
      if (!route) return false;

      if (journey.type === 'DIRECT') {
        const isCorrectRoute = route.stations.includes(userStart.id) && route.stations.includes(userEnd.id);
        return isCorrectRoute && bus.direction === activeDirection;
      }

      if (journey.type === 'TRANSFER') {
        const isFirstLegRoute = route.stations.includes(userStart.id) && route.stations.includes(journey.transferAt);
        if (!isFirstLegRoute) return false;
        const startIdx = route.stations.indexOf(userStart.id);
        const hubIdx = route.stations.indexOf(journey.transferAt);
        return bus.direction === (hubIdx > startIdx ? 1 : -1);
      }
      return false;
    });
  }, [buses, ROUTES, userStart, userEnd, journey, activeDirection]);


  return (
    <div
      className={`
        /* SHARED STYLES */
        flex flex-col font-sans z-[1000] overflow-hidden backdrop-blur-xl border-white/10 transition-all duration-500 ease-in-out
        
        /* DESKTOP (Large screens) */
        lg:w-96 lg:h-screen lg:bg-zinc-950/80 lg:border-r lg:relative lg:translate-y-0
        
        /* MOBILE (Small screens) */
        fixed bottom-0 left-0 w-full bg-zinc-950/95 border-t rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
        ${sheetState === 'collapsed'
          ? 'h-[18vh]'
          : sheetState === 'half'
            ? 'h-[45vh]'
            : 'h-[85vh]'
        }

      `}
    >
      {/* Mobile Drag Handle - The Touch Trigger */}
      <div
        className="lg:hidden w-full flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing touch-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full" />
      </div>
      {/* Header Section */}
      <div className="p-6 pt-2 lg:pt-6 space-y-6">
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex items-center gap-3">
            <img src={AppLogo} alt="Logo" className="h-10 w-auto object-contain" />
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-white leading-none tracking-tighter uppercase">Bahan Live</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em]">KTM Transit Intel</p>
              </div>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 transition-all active:scale-90">
            <Zap size={14} />
          </button>
        </div>

        {/* DYNAMIC TOP SECTION */}
        {!showBuses ? (
          // 1. Show FULL inputs while the user is still deciding
          <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner animate-in fade-in duration-500">
            <SearchableSelect
              label="From"
              icon={<MapPin size={16} />}
              color="text-[#C05621]"
              placeholder="Starting station"
              value={userStart}
              onSelect={(val) => { setUserStart(val); setSelectedBus(null); }}
              stations={STATIONS}
            />
            <SearchableSelect
              label="To"
              icon={<Navigation size={16} />}
              color="text-blue-500"
              placeholder="Destination station"
              value={userEnd}
              onSelect={(val) => {
                setUserEnd(val);
                setSelectedBus(null);
                if (val) setSheetState('half');
                // This force-opens the sidebar on mobile
              }}
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
        ) : (
          // 2. SHRINK only AFTER the user clicks "FIND LIVE RIDES" 
          // or if they have already selected a specific bus.
          // 2. SHRINK only AFTER the user clicks "FIND LIVE RIDES" 
          <div className="bg-[#C05621]/10 border border-[#C05621]/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                {selectedBus ? "Tracking Vehicle" : "Planned Route"}
              </span>
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="truncate max-w-[80px]">{userStart?.name}</span>
                <ArrowRight size={12} className="text-[#C05621]" />
                <span className="truncate max-w-[80px]">{userEnd?.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* This is your new 'Swipe Down' button */}
              <button
                onClick={() => setSheetState('collapsed')}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 transition-all active:scale-90 lg:hidden"
                title="Minimize"
              >
                <ChevronLeft size={18} className="-rotate-90" />
              </button>

              <button
                onClick={() => {
                  setShowBuses(false);
                  setSelectedBus(null);
                  setIsManuallyDismissed(true);
                }}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 transition-colors flex items-center gap-2 group"
              >
                <span className="text-[10px] font-black uppercase">Edit</span>
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        {/* CHANGE: Check if we have buses to show, NOT the sidebar state */}
        {(!userStart || !userEnd) && !selectedBus ?
          (<div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <MapIcon size={48} className="text-zinc-700" />
            <p className="text-xs text-zinc-500 font-medium">Select your route to start<br />live tracking.</p>
          </div>
          ) : selectedBus ? (
            (() => {
              // 1. Get the current moving bus from the live fleet
              const liveBus = buses.find(b => b.id === selectedBus.id) || selectedBus;
              const route = ROUTES.find(r => r.id === liveBus.routeId);

              // 2. Recalculate the distance LIVE based on moving pathIndex
              // Use the userPathIdx we saved when the bus was first selected
              let livePathDist = 0;
              if (liveBus.detailedPath && selectedBus.userPathIdx) {
                // We need to calculate the distance between the MOVING bus index and the STATION index
                const bIdx = liveBus.pathIndex;
                const uIdx = selectedBus.userPathIdx;
                const total = liveBus.detailedPath.length;

                if (route?.isCircular) {
                  livePathDist = liveBus.direction === 1
                    ? (uIdx - bIdx + total) % total
                    : (bIdx - uIdx + total) % total;
                } else {
                  livePathDist = liveBus.direction === 1
                    ? (uIdx >= bIdx ? uIdx - bIdx : 0)
                    : (bIdx >= uIdx ? bIdx - uIdx : 0);
                }
              }

              // 3. Apply your display math
              const displayDist = livePathDist > 0 ? (livePathDist * 0.04).toFixed(1) : "0.0";
              const liveETA = livePathDist > 0 ? Math.max(1, Math.round(livePathDist * 0.12)) : "--";

              return (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-[#C05621] rounded-[2rem] p-6 text-white shadow-2xl shadow-[#C05621]/30 relative overflow-hidden">
                    <Zap className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] font-mono border border-white/10 uppercase mb-2 inline-block">
                            {liveBus.numberPlate || "BA 2 PA 1234"}
                          </span>
                          <h2 className="text-3xl font-black tracking-tighter uppercase leading-tight">{liveBus.name || liveBus.id}</h2>
                          <p className="text-white/80 text-[10px] font-bold uppercase mt-1">
                            Next: {getNextStationName(liveBus)}
                          </p>
                        </div>
                        <span className="bg-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase animate-pulse">Live</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                          <div className="flex items-center gap-2 text-white/60 mb-1">
                            <Clock size={12} /> <span className="text-[9px] font-bold uppercase">Will arrive in</span>
                          </div>
                          <div className="text-2xl font-black italic">{liveETA} <span className="text-xs not-italic">MIN</span></div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                          <div className="flex items-center gap-2 text-white/60 mb-1">
                            <MapIcon size={12} /> <span className="text-[9px] font-bold uppercase">Distance left</span>
                          </div>
                          <div className="text-2xl font-black italic">{displayDist} <span className="text-xs not-italic">KM</span></div>
                        </div>
                      </div>

                      {/* Seats and Status Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white/10 px-4 py-3 rounded-xl flex items-center justify-between border border-white/10">
                          <span className="text-[9px] font-bold text-white/60 uppercase">Seats</span>
                          <span className="text-xs font-black">{liveBus.availableSeats ?? 12} Free</span>
                        </div>
                        <div className="bg-white/10 px-4 py-3 rounded-xl flex items-center justify-between border border-white/10">
                          <span className="text-[9px] font-bold text-white/60 uppercase">Status</span>
                          <span className="text-[9px] font-black uppercase text-emerald-300">
                            {liveBus.delayMin > 0 ? `${liveBus.delayMin}m Delay` : 'On Time'}
                          </span>
                        </div>
                      </div>

                      {/* NEW: Back to List Button (Crucial for the "Manual Dismiss" logic) */}
                      <button
                        onClick={() => {
                          setIsManuallyDismissed(true);
                          setSelectedBus(null);
                        }}
                        className="w-full bg-black/20 hover:bg-black/40 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 group"
                      >
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to All Rides</span>
                      </button>
                    </div>
                  </div>
                  {/* DYNAMIC FOOTER: STATUS OR TRANSFER ALERT */}
                  {journey?.type === 'TRANSFER' ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GitBranch size={12} className="text-yellow-500" />
                          <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Transfer Alert</span>
                        </div>
                        <span className="text-white font-mono text-[10px] font-bold animate-pulse">STEP 1 ACTIVE</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-tight italic">
                        "Stay on board. You need to get off at <span className="text-white font-bold">{STATIONS.find(s => s.id === journey.transferAt)?.name}</span> to catch your next bus."
                      </p>
                    </div>
                  ) : (
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">System Status</span>
                      <span className="text-emerald-500 font-mono text-[10px] font-bold animate-pulse">● TRACKING ACTIVE</span>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="space-y-4">
              <h2 className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] px-1">Available Rides</h2>

              {/* SWITCH INFO CARD */}
              {journey?.type === 'TRANSFER' && (
                <div className="bg-zinc-900 border border-[#C05621]/30 p-5 rounded-2xl space-y-4 mb-4">
                  <div className="flex items-center gap-2 text-[#C05621]">
                    <Zap size={16} />
                    <span className="text-xs font-black uppercase">Smart Transfer Guidance</span>
                  </div>

                  <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                    "Take a <span className="text-white font-bold">{ROUTES.find(r => r.id === journey.firstRouteId)?.name}</span> bus from {userStart?.name}.
                    You'll reach <span className="text-[#C05621] font-bold">{STATIONS.find(s => s.id === journey.transferAt)?.name}</span> in about
                    <span className="text-white font-bold"> {journey.leg1Time} minutes</span>."
                  </p>

                  <div className="py-3 border-y border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-zinc-500" />
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">Waiting Time</span>
                    </div>
                    <span className="text-emerald-500 font-black">{journey.leg2Wait} MINS</span>
                  </div>

                  <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                    "After you arrive, a <span className="text-white font-bold">{journey.nextBusName}</span> bus will reach the hub in
                    <span className="text-white font-bold"> {journey.leg2Wait} minutes</span> to take you to {userEnd?.name}."
                  </p>
                </div>
              )}


              {displayBuses.map((bus) => (
                <div key={bus.id} onClick={() => setSelectedBus(bus)} className="p-4 rounded-2xl cursor-pointer border border-white/5 bg-white/5 hover:bg-white/10 transition-all mb-3 group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#C05621]/20 p-2 rounded-lg text-[#C05621]"><MapIcon size={14} /></div>
                      <div>
                        <h3 className="text-white text-sm font-bold group-hover:text-[#C05621]">{bus.name || bus.id}</h3>
                        <p className="text-[9px] text-zinc-500">Near: {getNextStationName(bus)}</p>
                      </div>
                    </div>
                    <div className="text-[#C05621] font-black text-lg italic uppercase">
                      {!isNaN(bus.pathDist) && bus.pathDist < 10000 ? (
                        <>
                          {(bus.pathDist * 0.04).toFixed(1)}
                          <span className="text-[9px] not-italic ml-0.5">KM</span>
                        </>
                      ) : (
                        <span className="text-[10px] animate-pulse text-zinc-600">Calculating...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <p className="text-[11px] font-bold bg-gradient-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent text-center uppercase tracking-tight">
          सवारीको जानकारी हर पल हातमा
        </p>

        <a href="/driver" target="_blank" className="text-[9px] text-zinc-700 hover:text-zinc-400 transition-colors uppercase font-bold">
          Admin: Driver Portal
        </a>
      </div>
    </div>
  );
};

export default Sidebar;