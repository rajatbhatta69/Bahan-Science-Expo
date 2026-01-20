import React, { createContext, useState, useEffect, useContext, useMemo } from "react";
import { STATIONS, ROUTES } from "../data/transportData";
import { calculateDistance, getBearing } from "../utils/geoUtils";
import { moveBus } from "../services/simulationEngine"; // Cleaned up logic

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

  // Initial fleet generation
  const [buses, setBuses] = useState(() => {
    const fleet = [];
    ROUTES.forEach(route => {
      const count = route.id === 'R1' ? 12 : 4;
      for (let i = 0; i < count; i++) {
        fleet.push({
          id: `${route.id}-B${i}`,
          routeId: route.id,
          startProgress: i / count,
          direction: i % 2 === 0 ? 1 : -1,
          pathIndex: 0,
          detailedPath: [],
          lat: 27.7172,
          lng: 85.3240,
          heading: 0,
        });
      }
    });
    return fleet;
  });

  // --- 3. EFFECTS ---

  // Update activeDirection automatically
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

  // Fetch OSRM Geometries on mount
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

  // Simulation Heartbeat
  useEffect(() => {
    const simulator = setInterval(() => {
      setBuses(current => current.map(bus => moveBus(bus, ROUTES)));
    }, 2000);
    return () => clearInterval(simulator);
  }, []);

  // --- DYNAMIC SELECTION ENGINE ---
  useEffect(() => {
    if (!showBuses || !userStart || !userEnd) {
      if (selectedBus) setSelectedBus(null);
      return;
    }

    const route = ROUTES.find(r => r.stations.includes(userStart.id) && r.stations.includes(userEnd.id));
    if (!route) return;

    // Fixes "Green Bus" bias by resolving station coordinates correctly for math
    const stationCoords = activeDirection === 1
      ? (userStart.cw || userStart)
      : (userStart.acw || userStart);

    const candidates = buses
      .filter(bus => bus.routeId === route.id && bus.direction === activeDirection)
      .map(bus => {
        if (!bus.detailedPath || !bus.detailedPath.length) return { ...bus, pathDist: Infinity };

        let userPathIdx = -1;
        let minD = Infinity;

        // Find the point on the road closest to the station
        bus.detailedPath.forEach((pt, i) => {
          const d = Math.pow(pt[0] - stationCoords.lat, 2) + Math.pow(pt[1] - stationCoords.lng, 2);
          if (d < minD) { minD = d; userPathIdx = i; }
        });

        const pathDist = getPathDistance(
          bus.pathIndex,
          userPathIdx,
          bus.detailedPath.length,
          bus.direction,
          route.isCircular
        );

        return { ...bus, pathDist, userPathIdx };
      })
      // Filter: Distance must be > 2 (not passed yet) and < 60% of route (no weird lines)
      .filter(bus => bus.pathDist > 2 && bus.pathDist < (bus.detailedPath.length * 0.6))
      .sort((a, b) => a.pathDist - b.pathDist);

    if (candidates.length > 0) {
      const bestBus = candidates[0];
      // We store the whole bestBus object because it contains the 'pathDist'
      setSelectedBus({ ...bestBus });
    } else {
      setSelectedBus(null);
    }
  }, [buses, userStart, userEnd, activeDirection, showBuses]);

  // --- 4. ACTIONS ---
  const findAndSelectNearestBus = () => {
    if (!userStart || !userEnd) return;
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
      STATIONS, 
      ROUTES
    }}>
      {children}
    </BusContext.Provider>
  );
};

export const useBuses = () => useContext(BusContext);