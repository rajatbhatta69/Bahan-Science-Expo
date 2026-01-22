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

const LiveETALine = ({ bus, userStart, activeDirection }) => {
    const tetherPath = useMemo(() => {
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
const StreetRoute = ({ start, end, isActive, onPathTrace }) => {
    const [path, setPath] = useState([]);
    const { STATIONS, ROUTES } = useBuses();

    useEffect(() => {
        if (start && end) {
            const route = ROUTES.find(r => r.stations.includes(start.id) && r.stations.includes(end.id));
            if (!route) return;

            const sIdx = route.stations.indexOf(start.id);
            const eIdx = route.stations.indexOf(end.id);

            // GATEKEEPER: Select correct pathing logic
            const { direction, pathIds } = route.isCircular
                ? handleCircularPath(sIdx, eIdx, route.stations)
                : handleLinearPath(sIdx, eIdx, route.stations);

            const waypoints = pathIds.map(id => {
                const st = STATIONS.find(s => s.id === id);
                const coords = direction === 1 ? (st.cw || st) : (st.acw || st);
                return `${coords.lng},${coords.lat}`;
            }).join(';');

            fetch(`https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`)
                .then(res => res.json())
                .then(data => {
                    if (data.routes?.[0]?.geometry?.coordinates) {
                        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                        setPath(coords);
                        if (onPathTrace) onPathTrace(coords);
                    }
                }).catch(err => console.error(err));
        }
    }, [start, end, ROUTES, STATIONS]);

    return path.length > 1 ? <Polyline positions={path} pathOptions={{ color: '#3b82f6', weight: isActive ? 6 : 4, opacity: isActive ? 1 : 0.4 }} /> : null;
};

// --- MAIN DISPLAY ---

const MapDisplay = () => {
    // 1. Destructure activeDirection from Context
    const {
        buses,
        userStart,
        userEnd,
        selectedBus,
        showBuses,
        ROUTES,
        activeDirection
    } = useBuses();

    const [isLocked, setIsLocked] = useState(true);
    const [currentPathPoints, setCurrentPathPoints] = useState([]);
    const userPosition = useGeolocation();

    // 2. DELETE the activeDirection useMemo that was here. It's no longer needed!

    // 3. Keep filteredBuses but use the context's direction
    const filteredBuses = useMemo(() => {
        // 1. GLOBAL LIVE LAYER: Always find and show live buses.
        // These move freely and don't care about the search or the direction.
        const liveBuses = buses.filter(bus => bus.isLive);

        // 2. SEARCH LAYER: Only look for mock buses if a search is active.
        let routeMockBuses = [];

        if (showBuses && userStart && userEnd) {
            routeMockBuses = buses.filter(bus => {
                // Only consider mock buses here (don't duplicate the live ones)
                if (bus.isLive) return false;

                const route = ROUTES.find(r => r.id === bus.routeId);
                const isOnRoute = route?.stations.includes(userStart.id) &&
                    route?.stations.includes(userEnd.id);

                // Mock buses must follow the direction of the search
                return isOnRoute && bus.direction === activeDirection;
            });
        }

        // 3. COMBINE: Always return all live buses + any relevant mock buses
        // We use a Map to merge them by ID just in case a live bus shares a mock ID
        const combined = [...new Map([...routeMockBuses, ...liveBuses].map(b => [b.id, b])).values()];

        return combined;
    }, [buses, userStart, userEnd, ROUTES, showBuses, activeDirection]);
    // ... rest of your component logic

    return (
        <div className="h-full w-full relative bg-zinc-50">
            <MapContainer center={[27.7172, 85.3240]} zoom={13} className="h-full w-full" zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                <MapController isLocked={isLocked} routePath={currentPathPoints} activeDirection={activeDirection} />

                {userStart && userEnd && <StreetRoute start={userStart} end={userEnd} isActive={showBuses} onPathTrace={setCurrentPathPoints} />}

                {showBuses && selectedBus && userStart && (
                    <LiveETALine
                        bus={selectedBus}
                        userStart={userStart}
                        activeDirection={activeDirection}
                    />
                )}

                {userStart && <Marker position={[activeDirection === 1 ? (userStart.cw?.lat || userStart.lat) : (userStart.acw?.lat || userStart.lat), activeDirection === 1 ? (userStart.cw?.lng || userStart.lng) : (userStart.acw?.lng || userStart.lng)]} icon={createStationIcon("#C05621", "start")} />}
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
        <div class="custom-bus-icon ${isSelected ? 'selected' : ''} ${bus.isLive ? 'is-live' : ''}" 
             style="transform: rotate(${bus.heading}deg);">
            <div style="
                width: ${isSelected || bus.isLive ? '32px' : '26px'}; 
                height: ${isSelected || bus.isLive ? '32px' : '26px'}; 
                /* Live bus gets a bright Red, Selected gets Green, others get Orange */
                background: ${bus.isLive ? '#ef4444' : (isSelected ? '#10b981' : (bus.direction === 1 ? '#C05621' : '#f97316'))}; 
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
                
                <span style="color: white; font-size: ${bus.isLive ? '12px' : '10px'}; font-weight: 800;">
                    ${bus.isLive ? '⚡' : '🚌'}
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