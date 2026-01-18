import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useBuses } from '../context/BusContext';
import { Maximize, Target } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- HELPER: CUSTOM ICONS ---
const createStationIcon = (color, type) => {
    const iconHtml = type === 'start'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`;

    return L.divIcon({
        html: `<div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); display: flex; justify-content: center; align-items: center;">
                ${iconHtml}
               </div>`,
        className: 'no-transition', // Matches the CSS we added to kill flying
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });
};

// 1. SMART CAMERA CONTROLLER
const MapController = ({ isLocked, routePath }) => {
    const map = useMap();
    const { selectedBus, userStart, userEnd, showBuses } = useBuses();

    useEffect(() => {
        if (showBuses && selectedBus && isLocked) {
            // Close-up GPS Follow Mode
            map.setView([selectedBus.lat, selectedBus.lng], 16, { animate: true });
        } else if (userStart && userEnd) {
            // Overview Mode: Calculate bounds based on the actual road coordinates
            const boundsPoints = (routePath && routePath.length > 0)
                ? [...routePath, [userStart.lat, userStart.lng], [userEnd.lat, userEnd.lng]]
                : [[userStart.lat, userStart.lng], [userEnd.lat, userEnd.lng]];

            const bounds = L.latLngBounds(boundsPoints);
            map.fitBounds(bounds, { padding: [80, 80], animate: true });
        }
    }, [selectedBus, userStart, userEnd, showBuses, isLocked, map, routePath]);

    return null;
};

// 2. LIVE ETA LINE (The "Magnetic" Tether)
// 2. LIVE ETA LINE (The "Fixed-Rail" Slice)
// 2. LIVE ETA LINE (The "Fixed-Rail" Slice)
// 2. LIVE ETA LINE (The "Magnetic" Tether)
const LiveETALine = ({ bus, userStart }) => {
    const { getLiveTetherPath } = useBuses();
    const etaPath = getLiveTetherPath(bus, userStart);

    // FIXED MATH: Divide by 1000 to turn meters into KM
    const distanceInKm = (bus.remainingDistance || 0) / 1000;
    const etaMinutes = Math.max(1, Math.round(distanceInKm / 0.33));

    if (!etaPath || etaPath.length < 2) return null;

    return (
        <>
            <Polyline
                key={`line-live-${bus.id}-${bus.pathIndex}`} 
                positions={etaPath}
                pathOptions={{
                    color: '#10b981',
                    weight: 3,
                    dashArray: '8, 8',
                    lineCap: 'round',
                    opacity: 0.6
                }}
            />
            <Marker
                key={`label-${bus.id}-${bus.pathIndex}`}
                position={etaPath[Math.floor(etaPath.length / 2)]}
                icon={L.divIcon({
                    html: `
                        <div style="
                            background: #059669; 
                            color: white; 
                            padding: 4px 12px; 
                            border-radius: 99px; 
                            font-size: 11px; 
                            font-weight: 900; 
                            white-space: nowrap; 
                            border: 2px solid white; 
                            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            ${etaMinutes} MIN
                        </div>
                    `,
                    className: 'custom-eta-pill',
                    iconSize: [70, 28], 
                    iconAnchor: [35, 14]
                })}
            />
        </>
    );
};

// 3. WAKE-UP ROUTE (Light Blue Dashed -> Dark Blue Solid)
const StreetRoute = ({ start, end, isActive, onPathTrace }) => {
    const [path, setPath] = useState([]);
    const { getRoutePath, STATIONS, ROUTES } = useBuses();

    useEffect(() => {
        if (start && end) {
            const route = ROUTES.find(r => r.stations.includes(start.id) && r.stations.includes(end.id));
            if (!route) return;

            const pathIds = getRoutePath(start.id, end.id, route.id);
            const waypoints = pathIds.map(id => {
                const st = STATIONS.find(s => s.id === id);
                return `${st.lng},${st.lat}`;
            }).join(';');

            fetch(`https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`)
                .then(res => res.json())
                .then(data => {
                    if (data.routes && data.routes[0]) {
                        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                        setPath(coords);
                        if (onPathTrace) onPathTrace(coords);
                    }
                });
        }
    }, [start, end, getRoutePath, STATIONS, ROUTES, onPathTrace]);

    return path.length > 0 ? (
        <Polyline
            positions={path}
            pathOptions={{
                color: isActive ? '#1e40af' : '#3b82f6',
                weight: isActive ? 6 : 3,
                opacity: isActive ? 0.9 : 0.3,
                dashArray: isActive ? null : '10, 10' // Dashed when inactive, solid when active
            }}
        />
    ) : null;
};

// 4. STATIC MARKER (No Flying)
const StaticMarker = ({ position, color, type }) => {
    const icon = useMemo(() => createStationIcon(color, type), [color, type]);
    // The key ensures the marker is re-created instantly if the station changes
    return <Marker key={`${position[0]}-${position[1]}`} position={position} icon={icon} interactive={false} />;
};

// 5. SMOOTH BUS MARKER
const SmoothBusMarker = ({ bus, isSelected }) => {
    const markerRef = useRef(null);
    const { setSelectedBus } = useBuses();

    useEffect(() => {
        if (markerRef.current) {
            const marker = markerRef.current;
            const element = marker.getElement();

            if (element) {
                const needle = element.querySelector('.bus-arrow-needle');
                if (needle) needle.style.transform = `rotate(${bus.heading || 0}deg)`;
            }
            marker.setLatLng([bus.lat, bus.lng]);
        }
    }, [bus.lat, bus.lng, bus.heading]);

    const color = bus.status === 'On Time' ? '#10b981' : '#C05621';
    const busIcon = L.divIcon({
        html: `<div class="bus-container" style="position: relative; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;">
                    <div style="width: ${isSelected ? '28px' : '22px'}; height: ${isSelected ? '28px' : '22px'}; background-color: ${color}; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); z-index: 2; transition: all 0.3s ease;"></div>
                    <div class="bus-arrow-needle" style="position: absolute; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 16px solid ${color}; top: -2px; transform-origin: 50% 22px; z-index: 1;"></div>
                </div>`,
        className: 'custom-bus-icon', // Matches the 8s linear transition in CSS
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });

    return <Marker position={[bus.lat, bus.lng]} icon={busIcon} ref={markerRef} eventHandlers={{ click: () => setSelectedBus(bus) }} />;
};

// --- MAIN DISPLAY COMPONENT ---
const MapDisplay = () => {
    const { buses, userStart, userEnd, selectedBus, showBuses, ROUTES, getLiveTetherPath } = useBuses();
    const [isLocked, setIsLocked] = useState(true);
    const [currentPathPoints, setCurrentPathPoints] = useState([]);

    const filteredBuses = useMemo(() => {
        if (!showBuses || !userStart || !userEnd) return [];
        return buses.filter(bus => {
            const route = ROUTES.find(r => r.id === bus.routeId);
            return route?.stations.includes(userStart.id) && route?.stations.includes(userEnd.id);
        });
    }, [buses, userStart, userEnd, ROUTES, showBuses]);

    return (
        <div className="h-full w-full relative">
            <MapContainer center={[27.7172, 85.3240]} zoom={13} className="h-full w-full" zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                <MapController isLocked={isLocked} routePath={currentPathPoints} />

                {userStart && userEnd && (
                    <StreetRoute
                        start={userStart}
                        end={userEnd}
                        isActive={showBuses}
                        onPathTrace={setCurrentPathPoints}
                    />
                )}

                {showBuses && selectedBus && userStart && (
                    <LiveETALine
                        bus={buses.find(b => b.id === selectedBus.id) || selectedBus}
                        userStart={userStart}
                    />
                )}

                {userStart && (
                    <StaticMarker position={[userStart.lat, userStart.lng]} color="#C05621" type="start" />
                )}
                {userEnd && (
                    <StaticMarker position={[userEnd.lat, userEnd.lng]} color="#3b82f6" type="end" />
                )}

                {filteredBuses.map((bus) => (
                    <SmoothBusMarker key={bus.id} bus={bus} isSelected={selectedBus?.id === bus.id} />
                ))}
            </MapContainer>

            {showBuses && (
                <button
                    onClick={() => setIsLocked(!isLocked)}
                    className="absolute bottom-8 right-8 z-1000 bg-white text-zinc-900 px-6 py-3 rounded-2xl shadow-2xl border border-zinc-200 font-bold flex items-center gap-3 hover:bg-zinc-50 active:scale-95 transition-all"
                >
                    {isLocked ? <Maximize size={20} /> : <Target size={20} className="text-[#C05621]" />}
                    {isLocked ? "VIEW OVERVIEW" : "TRACK BUS"}
                </button>
            )}
        </div>
    );
};

export default MapDisplay;