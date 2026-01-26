import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, set, remove, onDisconnect, serverTimestamp } from "firebase/database";

const DriverPortal = () => {
  const [tracking, setTracking] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [selectedBusId, setSelectedBusId] = useState('R1-B0');

  // Use a ref to keep track of the watchId across renders
  const watchIdRef = useRef(null);

  useEffect(() => {
    const busRef = ref(db, `live_buses/${selectedBusId}`);

    if (tracking) {
      // 1. EMERGENCY CLEANUP: If the driver loses internet or closes the tab
      onDisconnect(busRef).remove();

      // 2. START TRACKING
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, heading } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });

          // 3. UPDATE FIREBASE
          set(busRef, {
            lat: latitude,
            lng: longitude,
            heading: heading || 0,
            lastUpdated: serverTimestamp(),
            active: true,
            // We add a "status" field just for extra clarity in the DB
            status: "online"
          });
        },
        (err) => {
          console.error("GPS Error:", err);
          setTracking(false);
          alert("Please enable GPS/Location services.");
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    } else {
      // 4. INTENTIONAL STOP: Manually remove data from Firebase
      stopTracking();
    }

    return () => stopTracking();
  }, [tracking, selectedBusId]);

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    // Scrub the data so the bus reverts to mock mode on the website
    remove(ref(db, `live_buses/${selectedBusId}`));
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white font-sans">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <div className="inline-block p-3 bg-[#C05621]/20 rounded-2xl mb-4">
            <div className="w-3 h-3 bg-[#C05621] rounded-full animate-ping"></div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Driver Node</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">KTM Transit Broadcast System</p>
        </header>

        <div className="space-y-6">
          {/* Vehicle Selection */}
          <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem]">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 mb-2 block">
              Assign Vehicle ID
            </label>
            <select
              disabled={tracking}
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-bold outline-none focus:border-[#C05621] transition-all disabled:opacity-50"
            >
              <option value="R1-B0">R1-B0 (Gongabu - Koteshwor)</option>
              <option value="R1-B1">R1-B1 (Gongabu - Koteshwor)</option>
              <option value="R2-B0">R2-B0 (Raniban - Ratnapark)</option>
            </select>
          </div>

          {/* GPS Monitor */}
          <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] flex justify-between items-center">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Lat / Lng</p>
              <p className="font-mono text-sm mt-1">
                {coords.lat ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "Awaiting GPS..."}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${tracking ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
              {tracking ? "Linked" : "Idle"}
            </div>
          </div>

          {/* Main Action Button */}
          <button
            onClick={() => setTracking(!tracking)}
            className={`w-full py-8 rounded-[2.5rem] font-black text-2xl tracking-tighter transition-all active:scale-95 shadow-2xl ${tracking
                ? 'bg-red-600 text-white shadow-red-600/20'
                : 'bg-white text-black shadow-white/10 hover:bg-zinc-200'
              }`}
          >
            {tracking ? 'END BROADCAST' : 'GO LIVE'}
          </button>
        </div>

        {tracking && (
          <footer className="mt-10 text-center space-y-2">
            <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
              Transmission Active
            </p>
            <p className="text-zinc-600 text-[9px] uppercase font-bold italic">
              "Providing real-time ETA for Kathmandu commuters"
            </p>
          </footer>
        )}
      </div>
    </div>
  );
};

export default DriverPortal;