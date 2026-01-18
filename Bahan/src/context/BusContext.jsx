import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { STATIONS, ROUTES } from "../data/transportData";

// --- 1. GLOBAL UTILITIES (Defined outside to fix ReferenceErrors) ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const BusContext = createContext();

export const BusProvider = ({ children }) => {
  const [userStart, setUserStart] = useState(null);
  const [userEnd, setUserEnd] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showBuses, setShowBuses] = useState(false);

  // --- 2. BUS STATE WITH PATH TRACKING ---
  const [buses, setBuses] = useState([
    { id: 1, name: "Bus 01 (Ring Road)", routeId: 'R1', pathIndex: 0, detailedPath: [], status: "On Time" },
    { id: 2, name: "Bus 02 (Ring Road)", routeId: 'R1', pathIndex: 80, detailedPath: [], status: "On Time" },
    { id: 3, name: "Bus 03 (Balaju-Raniban)", routeId: 'R2', pathIndex: 0, detailedPath: [], status: "Delayed" },
    { id: 4, name: "Bus 04 (Ratnapark-Dillibazar)", routeId: 'R3', pathIndex: 0, detailedPath: [], status: "On Time" }
  ].map(bus => {
    // Initial Lat/Lng placeholder until OSRM loads
    const route = ROUTES.find(r => r.id === bus.routeId);
    const station = STATIONS.find(s => s.id === route.stations[0]);
    return { ...bus, lat: station.lat, lng: station.lng, heading: 0 };
  }));

  // --- 3. INITIALIZE ROAD CURVES (With Fallback) ---
  useEffect(() => {
    const fetchPaths = async () => {
      const updatedBuses = await Promise.all(buses.map(async (bus) => {
        const route = ROUTES.find(r => r.id === bus.routeId);
        const waypoints = route.stations.map(id => {
          const s = STATIONS.find(st => st.id === id);
          return `${s.lng},${s.lat}`;
        }).join(';');

        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`);
          const data = await res.json();

          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            // SAFETY: Ensure pathIndex isn't out of bounds for the new path
            const safeIndex = bus.pathIndex % coords.length;
            return {
              ...bus,
              detailedPath: coords,
              pathIndex: safeIndex,
              lat: coords[safeIndex][0],
              lng: coords[safeIndex][1]
            };
          }
        } catch (e) {
          console.error("OSRM Fetch Failed for bus:", bus.id, e);
        }
        return bus; // Return original bus if fetch fails
      }));
      setBuses(updatedBuses);
    };

    fetchPaths();
  }, []); // Runs once on load

  // --- 4. SIMULATION HEARTBEAT (Reliable Movement) ---
  // --- 4. SIMULATION HEARTBEAT (Reliable Movement) ---
  // --- 4. SIMULATION HEARTBEAT (Update this block) ---
useEffect(() => {
  const simulator = setInterval(() => {
    // This (currentBuses) => ... is the "Functional Update" 
    // It forces React to see the change every single tick
    setBuses((currentBuses) =>
      currentBuses.map((bus) => {
        if (!bus.detailedPath || bus.detailedPath.length === 0) return bus;

        // Move forward by 5 steps
        let nextIndex = (bus.pathIndex + 5) % bus.detailedPath.length;
        
        const currentPos = bus.detailedPath[bus.pathIndex];
        const nextPos = bus.detailedPath[nextIndex];

        // Calculate distance remaining on the road to the end of the path
        let remainingDist = 0;
        for (let i = nextIndex; i < bus.detailedPath.length - 1; i++) {
            remainingDist += calculateDistance(
                bus.detailedPath[i][0], bus.detailedPath[i][1],
                bus.detailedPath[i+1][0], bus.detailedPath[i+1][1]
            );
        }

        const angle = Math.atan2(nextPos[1] - currentPos[1], nextPos[0] - currentPos[0]) * (180 / Math.PI);

        // We return a NEW object so the Map sees the change
        return { 
          ...bus, 
          pathIndex: nextIndex, 
          lat: nextPos[0], 
          lng: nextPos[1], 
          heading: angle,
          remainingDistance: remainingDist
        };
      })
    );
  }, 8000); // Matches your 8s CSS transition
  return () => clearInterval(simulator);
}, []);

  const ZoomHandler = () => {
    const map = useMap();

    useEffect(() => {
      map.on('zoomstart', () => {
        // Add a class to the map container that kills bus transitions
        map.getContainer().classList.add('is-zooming');
      });

      map.on('zoomend', () => {
        map.getContainer().classList.remove('is-zooming');
      });
    }, [map]);

    return null;
  };

  // --- 5. DIRECTIONAL PATH SLICER ---
  const getRoutePath = useCallback((startId, endId, routeId) => {
    const route = ROUTES.find(r => r.id === routeId);
    if (!route || !startId || !endId) return [];

    const startIndex = route.stations.indexOf(startId);
    const endIndex = route.stations.indexOf(endId);
    if (startIndex === -1 || endIndex === -1) return [];

    const total = route.stations.length;
    const getPathWithDistance = (direction) => {
      let path = [];
      let distance = 0;
      let curr = startIndex;
      while (curr !== endIndex) {
        path.push(route.stations[curr]);
        let next = direction === 'CW' ? (curr + 1) % total : (curr - 1 + total) % total;
        const s1 = STATIONS.find(s => s.id === route.stations[curr]);
        const s2 = STATIONS.find(s => s.id === route.stations[next]);
        distance += calculateDistance(s1.lat, s1.lng, s2.lat, s2.lng);
        curr = next;
      }
      path.push(route.stations[endIndex]);
      return { path, distance };
    };

    if (!route.isCircular) {
      return startIndex <= endIndex
        ? route.stations.slice(startIndex, endIndex + 1)
        : route.stations.slice(endIndex, startIndex + 1).reverse();
    }

    const clockwise = getPathWithDistance('CW');
    const antiClockwise = getPathWithDistance('ACW');
    return clockwise.distance <= antiClockwise.distance ? clockwise.path : antiClockwise.path;
  }, []);

  // --- 6. NEAREST BUS LOGIC ---
  const findAndSelectNearestBus = () => {
    if (!userStart || !userEnd) return;

    const validBuses = buses.filter(bus => {
      const route = ROUTES.find(r => r.id === bus.routeId);
      return route.stations.includes(userStart.id) && route.stations.includes(userEnd.id);
    });

    if (validBuses.length > 0) {
      let nearest = validBuses[0];
      let minDistance = Infinity;

      validBuses.forEach(bus => {
        const dist = calculateDistance(bus.lat, bus.lng, userStart.lat, userStart.lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = bus;
        }
      });

      setSelectedBus(nearest);
      setShowBuses(true);
    } else {
      alert("No buses found for this route.");
    }
  };

  // --- NEW: THE FIXED-RAIL SLICER ---
  // This finds the part of the road between the bus and the user
  // --- UPDATED: THE FIXED-RAIL SLICER ---
  const getLiveTetherPath = (bus, targetStation) => {
    // 1. Safety check
    if (!bus.detailedPath || bus.detailedPath.length === 0 || !targetStation) {
      return [];
    }

    // 2. Find where the target station (User Start) is on the master road
    let minTargetDist = Infinity;
    let targetIndexInPath = 0;

    bus.detailedPath.forEach((pt, idx) => {
      const d = calculateDistance(pt[0], pt[1], targetStation.lat, targetStation.lng);
      if (d < minTargetDist) {
        minTargetDist = d;
        targetIndexInPath = idx;
      }
    });

    // 3. SLICE THE STRING: Start EXACTLY where the bus is (pathIndex)
    // and end where the user is (targetIndexInPath)
    if (bus.pathIndex <= targetIndexInPath) {
      // Bus is behind the user - normal slice
      return bus.detailedPath.slice(bus.pathIndex, targetIndexInPath + 1);
    } else {
      // Bus passed the user - must go around the whole Ring Road
      return [
        ...bus.detailedPath.slice(bus.pathIndex),
        ...bus.detailedPath.slice(0, targetIndexInPath + 1)
      ];
    }
  };

  return (
    <BusContext.Provider value={{
      buses,
      selectedBus,
      setSelectedBus,
      userStart,
      setUserStart,
      userEnd,
      setUserEnd,
      showBuses,
      setShowBuses,
      findAndSelectNearestBus,
      getLiveTetherPath, // ADD THIS LINE HERE
      STATIONS,
      ROUTES,
      getRoutePath
    }}>
      {children}
    </BusContext.Provider>
  );
};

export const useBuses = () => {
  const context = useContext(BusContext);
  if (!context) throw new Error("useBuses must be used within a BusProvider");
  return context;
};