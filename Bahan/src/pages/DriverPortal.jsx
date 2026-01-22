import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, set, remove } from "firebase/database";
import { useBuses } from '../context/BusContext'; // Import this to get your list of buses

const DriverPortal = () => {
  const [tracking, setTracking] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  
  // 1. State for selected bus (Default to R1-B0)
  const [selectedBusId, setSelectedBusId] = useState('R1-B0');

  useEffect(() => {
    let watchId;

    if (tracking) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, heading } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });

          // 2. PUSH TO FIREBASE using the selectedBusId
          set(ref(db, `live_buses/${selectedBusId}`), {
            lat: latitude,
            lng: longitude,
            heading: heading || 0, // Sending raw heading if phone supports it
            lastUpdated: Date.now(),
            active: true
          });
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      // 3. CLEANUP: When tracking stops, remove the bus from the live database
      // This makes the icon disappear or turn back into a mock bus on the main map
      remove(ref(db, `live_buses/${selectedBusId}`));
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [tracking, selectedBusId]);

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black mb-2 text-center">DRIVER PORTAL</h1>
        <p className="text-zinc-500 text-center mb-8">Select your vehicle to start broadcasting</p>

        {/* 4. Bus Selector Dropdown */}
        <div className="mb-6">
          <label className="text-xs font-bold text-zinc-500 uppercase ml-2">Vehicle ID</label>
          <select 
            disabled={tracking}
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mt-1 text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
          >
            <option value="R1-B0">Route 1 - Bus A (R1-B0)</option>
            <option value="R1-B1">Route 1 - Bus B (R1-B1)</option>
            <option value="R2-B0">Route 2 - Bus A (R2-B0)</option>
            <option value="R2-B1">Route 2 - Bus B (R2-B1)</option>
          </select>
        </div>
        
        <div className="text-center mb-8 p-6 bg-zinc-900 rounded-[2rem] border border-zinc-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Latitude</p>
              <p className="font-mono text-lg">{coords.lat.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Longitude</p>
              <p className="font-mono text-lg">{coords.lng.toFixed(6)}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setTracking(!tracking)}
          className={`w-full py-6 rounded-[2rem] font-black text-2xl shadow-2xl transition-all active:scale-95 ${
            tracking 
              ? 'bg-red-500 text-white shadow-red-500/20' 
              : 'bg-white text-black shadow-white/10'
          }`}
        >
          {tracking ? 'STOP BROADCAST' : 'GO LIVE'}
        </button>

        {tracking && (
          <div className="flex items-center justify-center gap-2 mt-6 animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-500 font-bold uppercase text-xs tracking-widest">Live on Passenger Maps</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverPortal;