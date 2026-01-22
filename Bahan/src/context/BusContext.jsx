import React, { createContext, useState, useEffect, useContext, useMemo } from "react";
import { STATIONS, ROUTES } from "../data/transportData";
import { calculateDistance, getBearing } from "../utils/geoUtils";
import { moveBus } from "../services/simulationEngine"; // Cleaned up logic
import { db } from '../firebase';
import { ref, onValue } from "firebase/database";

const BusContext = createContext();

// --- 1. LOGIC HANDLERS ---
const getPathDistance = (busIdx, userIdx, totalPoints, direction, isCircular) => {
  if (userIdx === -1) return Infinity; // Safety check

  if (isCircular) {
    return direction === 1
      ? (userIdx - busIdx + totalPoints) % totalPoints
      : (busIdx - userIdx + totalPoints) % totalPoints;
  } else {
    // Linear logic (Ratnapark routes)
    if (direction === 1) return userIdx >= busIdx ? userIdx - busIdx : Infinity;
    return busIdx >= userIdx ? busIdx - userIdx : Infinity;
  }
};

export const BusProvider = ({ children }) => {
  // --- 2. STATE ---
  const [userStart, setUserStart] = useState(null);
  const [userEnd, setUserEnd] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showBuses, setShowBuses] = useState(false);
  const [activeDirection, setActiveDirection] = useState(1);
  const [isManuallyDismissed, setIsManuallyDismissed] = useState(false); // <--- ADD THIS

const [buses, setBuses] = useState(() => {
  const fleet = [];
  ROUTES.forEach(route => {
    const count = route.id === 'R1' ? 12 : 4; 
    
    for (let i = 0; i < count; i++) {
      fleet.push({
        id: `${route.id}-B${i}`,
        // UPDATE THIS LINE:
        name: route.name, 
        
        numberPlate: `BA ${Math.floor(Math.random() * 9) + 1} PA ${Math.floor(1000 + Math.random() * 8999)}`,
        routeId: route.id,
        startProgress: i / count,
        direction: i % 2 === 0 ? 1 : -1,
        pathIndex: 0,
        detailedPath: [],
        lat: 27.7172, lng: 85.3240,
        heading: 0,
        totalSeats: 40,
        availableSeats: Math.floor(Math.random() * 25),
        delayMin: Math.floor(Math.random() * 8) - 2,
      });
    }
  });
  return fleet;
});


  useEffect(() => {
    // 1. Reference the ENTIRE 'live_buses' folder, not just 'bus_1'
    const allLiveBusesRef = ref(db, 'live_buses');

    const unsubscribe = onValue(allLiveBusesRef, (snapshot) => {
      const allData = snapshot.val(); // This is now an object: { "R1-B0": {...}, "R1-B1": {...} }

      setBuses(prevBuses => prevBuses.map(bus => {
        // 2. Check if THIS specific bus has data in Firebase
        const liveData = allData ? allData[bus.id] : null;

        if (liveData && liveData.active) {
          // 3. Calculate heading only if it moved
          const newHeading = (liveData.lat !== bus.lat || liveData.lng !== bus.lng)
            ? getBearing(bus.lat, bus.lng, liveData.lat, liveData.lng)
            : bus.heading;

          return {
            ...bus,
            lat: liveData.lat,
            lng: liveData.lng,
            heading: newHeading,
            isLive: true,
            // We keep the current search direction so it stays visible on the map
            direction: activeDirection
          };
        }

        // 4. If the bus is NOT in Firebase (driver stopped), 
        // it reverts to being a normal mock bus.
        return { ...bus, isLive: false };
      }));
    });

    return () => unsubscribe();
  }, [activeDirection]); // Add activeDirection here so the bus updates when user switches views

  // Initial fleet generation


  // --- 3. EFFECTS ---

  // 1. Update activeDirection automatically
  useEffect(() => {
    if (userStart && userEnd) {
      const route = ROUTES.find(r => r.stations.includes(userStart.id) && r.stations.includes(userEnd.id));
      if (route) {
        const sIdx = route.stations.indexOf(userStart.id);
        const eIdx = route.stations.indexOf(userEnd.id);
        const dir = route.isCircular
          ? ((eIdx - sIdx + route.stations.length) % route.stations.length <= (sIdx - eIdx + route.stations.length) % route.stations.length ? 1 : -1)
          : (eIdx > sIdx ? 1 : -1);
        setActiveDirection(dir);
      }
    }
  }, [userStart, userEnd]);

  // 2. Fetch OSRM Geometries on mount
  useEffect(() => {
    const fetchGeometries = async () => {
      const routeGeometries = {};
      for (const route of ROUTES) {
        const waypoints = route.stations
          .map(id => {
            const s = STATIONS.find(st => st.id === id);
            return s ? `${s.cw?.lng || s.lng},${s.cw?.lat || s.lat}` : null;
          })
          .filter(Boolean)
          .join(';');

        try {
          await new Promise(r => setTimeout(r, 200));
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`);
          const data = await res.json();
          if (data.code === "Ok") {
            routeGeometries[route.id] = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          }
        } catch (e) { console.error("OSRM Fetch Error:", e); }
      }

      setBuses(prev => prev.map(bus => {
        const path = routeGeometries[bus.routeId] || [];
        if (!path.length) return bus;
        const idx = Math.floor(bus.startProgress * path.length);
        return { ...bus, detailedPath: path, pathIndex: idx, lat: path[idx][0], lng: path[idx][1] };
      }));
    };
    fetchGeometries();
  }, []);

  // 3. RESTORED: Simulation Heartbeat (The "Motor")
  useEffect(() => {
    const simulator = setInterval(() => {
      setBuses(current => current.map(bus => {
        // If the bus is live, do NOT let the simulation engine move it
        if (bus.isLive) return bus;
        return moveBus(bus, ROUTES);
      }));
    }, 2000);
    return () => clearInterval(simulator);
  }, []); // Empty dependency array keeps it running once on mount

  // 4. DYNAMIC SELECTION ENGINE
  useEffect(() => {
    // 1. If search is cleared, reset everything including the manual dismiss flag
    if (!showBuses || !userStart || !userEnd) {
      setSelectedBus(null);
      setIsManuallyDismissed(false);
      return;
    }

    // 2. CRITICAL: If the user manually closed the card, STOP EVERYTHING.
    // Do not look for candidates, do not calculate distances. Just exit.
    if (isManuallyDismissed) {
      return;
    }

    const route = ROUTES.find(r => r.stations.includes(userStart.id) && r.stations.includes(userEnd.id));
    if (!route) return;

    const stationCoords = activeDirection === 1 ? (userStart.cw || userStart) : (userStart.acw || userStart);

    const candidates = buses
      .filter(bus => bus.routeId === route.id && bus.direction === activeDirection)
      .map(bus => {
        if (!bus.detailedPath || bus.detailedPath.length === 0) {
          return { ...bus, pathDist: Infinity, userPathIdx: -1 };
        }
        let userPathIdx = -1;
        let minD = Infinity;
        bus.detailedPath.forEach((pt, i) => {
          const d = Math.pow(pt[0] - stationCoords.lat, 2) + Math.pow(pt[1] - stationCoords.lng, 2);
          if (d < minD) { minD = d; userPathIdx = i; }
        });

        const pathDist = getPathDistance(bus.pathIndex, userPathIdx, bus.detailedPath.length, bus.direction, route.isCircular);
        return {
          ...bus,
          pathDist: isNaN(pathDist) ? Infinity : pathDist,
          userPathIdx
        };
      })
      // Ensure pathDist is positive (bus is behind the user) 
      // and the bus isn't too far away (within 60% of route length)
      .filter(bus => bus.pathDist > 0 && bus.pathDist < (bus.detailedPath.length * 0.6))
      .sort((a, b) => a.pathDist - b.pathDist);

    // 3. Only auto-select a bus if the user hasn't selected one yet 
    // AND they haven't manually dismissed the view.
    if (candidates.length > 0 && !selectedBus && !isManuallyDismissed) {
      setSelectedBus({ ...candidates[0] });
    }
  }, [buses, userStart, userEnd, activeDirection, showBuses, isManuallyDismissed, selectedBus]);
  // Added selectedBus to dependencies to ensure it tracks the null state accurately


  // --- 4. ACTIONS ---
  const findAndSelectNearestBus = () => {
    if (!userStart || !userEnd) return;
    setIsManuallyDismissed(false); // Reset dismissal on new search
    setSelectedBus(null);
    setShowBuses(true);
  };

  // --- 5. DATA MERGING ---
  // This is the key: We take the live position from 'buses' 
  // but KEEP the 'pathDist' from the 'selectedBus' state.
  const liveSelectedBus = useMemo(() => {
    if (!selectedBus) return null;
    const busInFleet = buses.find(b => b.id === selectedBus.id);
    if (!busInFleet) return null;

    return {
      ...busInFleet,
      pathDist: selectedBus.pathDist,
      userPathIdx: selectedBus.userPathIdx
    };
  }, [buses, selectedBus]);

  return (
    <BusContext.Provider value={{
      buses,
      selectedBus: liveSelectedBus,
      setSelectedBus,
      userStart,
      setUserStart,
      userEnd,
      setUserEnd,
      showBuses,
      setShowBuses,
      activeDirection,
      findAndSelectNearestBus,
      setIsManuallyDismissed,
      STATIONS,
      ROUTES
    }}>
      {children}
    </BusContext.Provider>
  );
};

export const useBuses = () => useContext(BusContext);