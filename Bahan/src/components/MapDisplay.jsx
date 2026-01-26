import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useBuses } from '../context/BusContext';
import { Maximize, Target, Navigation } from 'lucide-react';
import { calculateDistance } from '../utils/geoUtils';
import 'leaflet/dist/leaflet.css';

// --- LOGIC HELPERS ---

const handleCircularPath = (sIdx, eIdx, stations) => {
    const total = stations.length;
    const distCW = (eIdx - sIdx + total) % total;
    const distACW = (sIdx - eIdx + total) % total;
    const direction = distCW <= distACW ? 1 : -1;
    const steps = direction === 1 ? distCW : distACW;

    let pathIds = [];
    for (let i = 0; i <= steps; i++) {
        pathIds.push(stations[(sIdx + (i * direction) + total) % total]);
    }
    return { direction, pathIds };
};

const handleLinearPath = (sIdx, eIdx, stations) => {
    const direction = eIdx > sIdx ? 1 : -1;
    let pathIds = [];
    if (direction === 1) {
        for (let i = sIdx; i <= eIdx; i++) pathIds.push(stations[i]);
    } else {
        for (let i = sIdx; i >= eIdx; i--) pathIds.push(stations[i]);
    }
    return { direction, pathIds };
};

// --- COMPONENTS ---

const useGeolocation = () => {
    const [position, setPosition] = useState(null);
    useEffect(() => {
        const watcher = navigator.geolocation.watchPosition(
            (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.error("GPS Error:", err),
            { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(watcher);
    }, []);
    return position;
};

const createStationIcon = (color, type) => {
    const iconHtml = type === 'start'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`;
    return L.divIcon({
        html: `<div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3))">${iconHtml}</div>`,
        className: 'no-transition',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });
};

const MapController = ({ isLocked, routePath, activeDirection }) => {
    const map = useMap();
    const { selectedBus, userStart, userEnd, showBuses } = useBuses();

    useEffect(() => {
        if (showBuses && selectedBus && isLocked) {
            if (selectedBus.lat && selectedBus.lng) {
                map.panTo([selectedBus.lat, selectedBus.lng], { animate: true });
            }
        } else if (userStart && userEnd) {
            const sCoords = activeDirection === 1 ? (userStart.cw || userStart) : (userStart.acw || userStart);
            const eCoords = activeDirection === 1 ? (userEnd.cw || userEnd) : (userEnd.acw || userEnd);
            const points = [[sCoords.lat, sCoords.lng], [eCoords.lat, eCoords.lng]];
            if (routePath?.length) routePath.forEach(p => points.push(p));
            map.fitBounds(L.latLngBounds(points), { padding: [80, 80], animate: true });
        }
    }, [selectedBus?.id, isLocked, userStart?.id, userEnd?.id, showBuses]);

    return null;
};

// --- Inside MapDisplay.jsx ---

const LiveETALine = ({ bus, userStart, activeDirection, journey }) => {
    const { ROUTES, userEnd } = useBuses();

    const tetherPath = useMemo(() => {

        // ONLY show tether for the first leg of a transfer
        if (journey?.type === 'TRANSFER' && bus.routeId !== journey.firstRouteId) return null;

        if (!bus?.detailedPath || bus.userPathIdx === undefined) return null;

        const { detailedPath, pathIndex, userPathIdx, direction } = bus;
        const total = detailedPath.length;

        // Calculate steps
        let steps = direction === 1
            ? (userPathIdx - pathIndex + total) % total
            : (pathIndex - userPathIdx + total) % total;

        // If the bus is more than 3km (roughly) or 50% of route away, 
        // hide the tether line to keep the map clean.
        if (steps > total * 0.5 || steps === 0) return null;

        let points = [];
        for (let i = 0; i <= steps; i++) {
            const idx = direction === 1
                ? (pathIndex + i) % total
                : (pathIndex - i + total) % total;
            points.push(detailedPath[idx]);
        }

        return points;
    }, [bus, userStart, activeDirection]);

    if (!tetherPath || tetherPath.length < 2) return null;

    return (
        <Polyline
            positions={tetherPath}
            pathOptions={{ color: '#10b981', weight: 4, dashArray: '10, 10' }}
        />
    );
};


const StreetRoute = ({ start, end, isActive }) => {
    const [paths, setPaths] = useState({ leg1: [], leg2: [] });
    const { STATIONS, ROUTES, journey } = useBuses();

    useEffect(() => {
        // Reset paths when search is cleared
        if (!start || !end || !journey) {
            setPaths({ leg1: [], leg2: [] });
            return;
        }

        const getWaypoints = (sId, eId, routeId) => {
            const route = ROUTES.find(r => r.id === routeId);
            if (!route) return null;
            const sIdx = route.stations.indexOf(sId);
            const eIdx = route.stations.indexOf(eId);

            // Re-using your existing logic helpers
            const { direction, pathIds } = route.isCircular
                ? handleCircularPath(sIdx, eIdx, route.stations)
                : handleLinearPath(sIdx, eIdx, route.stations);

            return pathIds.map(id => {
                const st = STATIONS.find(s => s.id === id);
                const coords = direction === 1 ? (st.cw || st) : (st.acw || st);
                return `${coords.lng},${coords.lat}`;
            }).join(';');
        };

        const fetchAll = async () => {
            try {
                if (journey.type === 'TRANSFER') {
                    const w1 = getWaypoints(start.id, journey.transferAt, journey.firstRouteId);
                    const w2 = getWaypoints(journey.transferAt, end.id, journey.secondRouteId);

                    const [res1, res2] = await Promise.all([
                        fetch(`https://router.project-osrm.org/route/v1/driving/${w1}?overview=full&geometries=geojson`),
                        fetch(`https://router.project-osrm.org/route/v1/driving/${w2}?overview=full&geometries=geojson`)
                    ]);

                    const d1 = await res1.json();
                    const d2 = await res2.json();

                    setPaths({
                        leg1: d1.routes?.[0]?.geometry?.coordinates.map(c => [c[1], c[0]]) || [],
                        leg2: d2.routes?.[0]?.geometry?.coordinates.map(c => [c[1], c[0]]) || []
                    });
                } else {
                    const w1 = getWaypoints(start.id, end.id, journey.routeId);
                    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${w1}?overview=full&geometries=geojson`);
                    const d = await res.json();
                    setPaths({
                        leg1: d.routes?.[0]?.geometry?.coordinates.map(c => [c[1], c[0]]) || [],
                        leg2: []
                    });
                }
            } catch (err) {
                console.error("Route Fetch Failed", err);
            }
        };

        fetchAll();
    }, [journey, start, end]);

    return (
        <>

            {/* Add this inside the fragment, before Leg 1 */}
            {paths.leg1.length > 0 && (
                <Polyline
                    positions={paths.leg1}
                    pathOptions={{ color: 'white', weight: 8, opacity: 0.5 }}
                />
            )}
            {/* LEG 1: Royal Indigo - Solid and Strong */}
            {paths.leg1.length > 0 && (
                <Polyline
                    positions={paths.leg1}
                    pathOptions={{
                        color: '#4338ca',
                        weight: 5,
                        opacity: isActive ? 0.9 : 0.3,
                        lineCap: 'round'
                    }}
                />
            )}

            {/* LEG 2: Vibrant Amber - Dashed to indicate the "Next" phase */}
            {paths.leg2.length > 0 && (
                <Polyline
                    positions={paths.leg2}
                    pathOptions={{
                        color: '#f59e0b',
                        weight: 5,
                        opacity: isActive ? 0.9 : 0.3,
                        dashArray: '8, 12',
                        lineCap: 'round'
                    }}
                />
            )}
        </>
    );
};
// --- MAIN DISPLAY ---

const MapDisplay = () => {
    const {
        buses,
        userStart,
        userEnd,
        selectedBus,
        showBuses,
        ROUTES,
        STATIONS,
        activeDirection,
        findOptimalPath // Extracted from context
    } = useBuses();

    const [isLocked, setIsLocked] = useState(true);
    const [currentPathPoints, setCurrentPathPoints] = useState([]);
    const userPosition = useGeolocation();

    // ADD THIS HERE: One calculation to rule them all
    const journey = useMemo(() => {
        // Remove !showBuses so it works during station selection too
        if (!userStart || !userEnd || typeof findOptimalPath !== 'function') return null;

        try {
            const path = findOptimalPath(userStart.id, userEnd.id, ROUTES);
            console.log("📍 Map Calculated Journey:", path); // CHECK YOUR BROWSER CONSOLE FOR THIS
            return path;
        } catch (err) {
            console.error("Routing Error:", err);
            return null;
        }
    }, [userStart?.id, userEnd?.id, ROUTES, findOptimalPath]);

    // 2. DELETE the activeDirection useMemo that was here. It's no longer needed!

    // 3. Keep filteredBuses but use the context's direction
    const filteredBuses = useMemo(() => {
        // 1. Always keep Live (GPS tracked) buses as priority
        const liveBuses = buses.filter(bus => bus.isLive);
        let routeMockBuses = [];

        if (showBuses && userStart && userEnd && journey) {
            routeMockBuses = buses.filter(bus => {
                if (bus.isLive) return false; // Handled above

                const route = ROUTES.find(r => r.id === bus.routeId);
                if (!route) return false;

                // --- CASE A: DIRECT JOURNEY ---
                if (journey.type === 'DIRECT') {
                    const isOnRoute = route.stations.includes(userStart.id) &&
                        route.stations.includes(userEnd.id);
                    // Only show buses going the user's direction (activeDirection)
                    return isOnRoute && bus.direction === activeDirection;
                }

                // --- CASE B: TRANSFER JOURNEY ---
                if (journey.type === 'TRANSFER') {
                    // Check if bus belongs to Leg 1
                    if (bus.routeId === journey.firstRouteId) {
                        const sIdx = route.stations.indexOf(userStart.id);
                        const hIdx = route.stations.indexOf(journey.transferAt);
                        const leg1Dir = hIdx > sIdx ? 1 : -1;
                        return bus.direction === leg1Dir;
                    }

                    // Check if bus belongs to Leg 2
                    if (bus.routeId === journey.secondRouteId) {
                        const hIdx = route.stations.indexOf(journey.transferAt);
                        const eIdx = route.stations.indexOf(userEnd.id);
                        const leg2Dir = eIdx > hIdx ? 1 : -1;
                        return bus.direction === leg2Dir;
                    }
                }

                return false;
            });
        }

        // Merge and remove duplicates by ID
        return [...new Map([...routeMockBuses, ...liveBuses].map(b => [b.id, b])).values()];
    }, [buses, userStart, userEnd, ROUTES, showBuses, activeDirection, journey]);

    return (
        <div className="h-full w-full relative bg-zinc-50">
            <MapContainer center={[27.7172, 85.3240]} zoom={13} className="h-full w-full" zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                <MapController isLocked={isLocked} routePath={currentPathPoints} activeDirection={activeDirection} />

                {userStart && userEnd && (
                    <StreetRoute
                        start={userStart}
                        end={userEnd}
                        isActive={showBuses}
                        onPathTrace={setCurrentPathPoints}
                        journey={journey} // <-- Force pass it here
                    />
                )}

                {showBuses && selectedBus && userStart && (
                    <LiveETALine
                        bus={selectedBus}
                        userStart={userStart}
                        activeDirection={activeDirection}
                        journey={journey}
                    />
                )}

                {/* Start Station */}
                {userStart && <Marker position={[activeDirection === 1 ? (userStart.cw?.lat || userStart.lat) : (userStart.acw?.lat || userStart.lat), activeDirection === 1 ? (userStart.cw?.lng || userStart.lng) : (userStart.acw?.lng || userStart.lng)]} icon={createStationIcon("#C05621", "start")} />}

                {/* --- ADD THIS: Transfer Hub Station --- */}
                {/* --- Transfer Hub Marker --- */}
                {/* --- Transfer Hub Marker --- */}
                {journey?.type === 'TRANSFER' && (() => {
                    const hub = STATIONS.find(s => s.id === journey.transferAt);
                    if (!hub) return null;

                    // Some stations use hub.cw.lat, others use hub.lat. This handles both:
                    const lat = hub.cw?.lat || hub.lat;
                    const lng = hub.cw?.lng || hub.lng;

                    return (
                        <Marker
                            position={[lat, lng]}
                            icon={createStationIcon("#fbbf24", "hub")}
                        />
                    );
                })()}

                {/* End Station */}
                {userEnd && <Marker position={[activeDirection === 1 ? (userEnd.cw?.lat || userEnd.lat) : (userEnd.acw?.lat || userEnd.lat), activeDirection === 1 ? (userEnd.cw?.lng || userEnd.lng) : (userEnd.acw?.lng || userEnd.lng)]} icon={createStationIcon("#3b82f6", "end")} />}

                {filteredBuses.map((bus) => {
                    const isSelected = selectedBus?.id === bus.id;

                    return (
                        <Marker
                            key={bus.id}
                            position={[bus.lat, bus.lng]}
                            eventHandlers={{
                                click: () => {
                                    setSelectedBus(bus);
                                    setIsLocked(true);
                                },
                            }}
                            icon={L.divIcon({
                                html: `
    <div class="custom-bus-icon ${isSelected ? 'selected' : ''}" 
         style="transform: rotate(${bus.heading}deg);">
        <div style="
            width: ${isSelected ? '34px' : '28px'}; 
            height: ${isSelected ? '34px' : '28px'}; 
            /* NEW COLOR LOGIC */
            background: ${bus.isLive
                                        ? '#10b981' // 1. Priority: Live is ALWAYS Emerald Green
                                        : journey?.type === 'TRANSFER'
                                            ? (bus.routeId === journey.firstRouteId ? '#C05621' : '#8b5cf6') // 2. Transfer colors
                                            : (isSelected ? '#3b82f6' : '#C05621') // 3. Standard Selection (Blue) or Mock (Orange)
                                    };
            border-radius: 8px; 
            border: 2px solid white; 
            
                display: flex; 
                align-items: center; 
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                position: relative;
                transition: all 0.3s ease;
            ">
                <div style="
                    position: absolute;
                    top: -6px;
                    width: 0; 
                    height: 0; 
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-bottom: 8px solid ${bus.isLive ? '#ef4444' : (isSelected ? '#10b981' : 'white')};
                "></div>
                
                <span style="color: white; font-size: ${bus.isLive ? '14px' : '10px'}; font-weight: 800;">
    ${bus.isLive ? '📡' : '🚌'} 
</span>

                ${bus.isLive ? `
                    <div style="
                        position: absolute;
                        top: -4px;
                        right: -4px;
                        width: 10px;
                        height: 10px;
                        background: #ef4444;
                        border-radius: 50%;
                        border: 2px solid white;
                    ">
                        <div class="animate-ping" style="
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            background: #ef4444;
                            border-radius: 50%;
                            opacity: 0.75;
                        "></div>
                    </div>
                ` : ''}
            </div>
            
            ${isSelected ? '<div class="pulse-ring"></div>' : ''}
        </div>
    `,
                                className: 'no-transition',
                                iconSize: [40, 40],
                                iconAnchor: [20, 20]
                            })}
                        />
                    );
                })}
            </MapContainer>

            {showBuses && (
                <button onClick={() => setIsLocked(!isLocked)} className="absolute bottom-8 right-8 z-[1001] bg-white text-zinc-900 px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3">
                    {isLocked ? <Maximize size={20} /> : <Target size={20} className="text-[#C05621]" />}
                    {isLocked ? "FREE VIEW" : "FOLLOW BUS"}
                </button>
            )}
        </div>
    );
};

export default MapDisplay;