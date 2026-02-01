import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { STATIONS, ROUTES } from '../data/transportData';
import 'leaflet/dist/leaflet.css';

// --- INTERNAL CONTROLLER ---
const MapController = ({ selectedBus }) => {
    const map = useMap();
    useEffect(() => {
        if (selectedBus) {
            map.flyTo([selectedBus.lat, selectedBus.lng], 16, { animate: true });
        }
    }, [selectedBus]);
    return null;
};

const OperatorMap = ({ liveBuses, selectedBusId }) => {
    const busesArray = Object.entries(liveBuses).map(([id, data]) => ({ id, ...data }));
    const activeBus = liveBuses[selectedBusId];

    // Reuse your custom icon logic but styled for 'Pro' look
    const createOperatorBusIcon = (heading, isSelected, id) => {
        return L.divIcon({
            html: `
                <div class="operator-icon" style="transform: rotate(${heading}deg); transition: all 0.5s linear;">
                    <div style="
                        width: ${isSelected ? '32px' : '24px'}; 
                        height: ${isSelected ? '32px' : '24px'}; 
                        background: ${isSelected ? '#f97316' : '#10b981'};
                        border: 2px solid white;
                        border-radius: 6px;
                        box-shadow: 0 0 15px ${isSelected ? 'rgba(249,115,22,0.5)' : 'rgba(16,185,129,0.3)'};
                        display: flex; align-items: center; justify-content: center;
                    ">
                        <span style="font-size: 12px;">🚌</span>
                    </div>
                </div>
            `,
            className: 'no-transition',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
    };

    return (
        <MapContainer
            center={[27.7172, 85.3240]}
            zoom={13}
            className="h-full w-full bg-[#111]"
            zoomControl={false}
            attributionControl={false}
        >
            {/* DARK MODE TILES: CartoDB Dark Matter */}
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap"
            />

            <MapController selectedBus={activeBus} />

            {/* Render Route Outlines (Ghostly lines for context) */}
            {ROUTES.map(route => {
                const routeCoords = route.stations.map(sId => {
                    const s = STATIONS.find(st => st.id === sId);
                    return s ? [s.cw?.lat || s.lat, s.cw?.lng || s.lng] : null;
                }).filter(Boolean);
                
                return (
                    <Polyline 
                        key={route.id}
                        positions={routeCoords} 
                        pathOptions={{ color: 'white', weight: 1, opacity: 0.1 }} 
                    />
                );
            })}

            {/* LIVE BUSES */}
            {busesArray.map((bus) => (
                <Marker
                    key={bus.id}
                    position={[bus.lat, bus.lng]}
                    icon={createOperatorBusIcon(bus.heading, selectedBusId === bus.id, bus.id)}
                />
            ))}
        </MapContainer>
    );
};

export default OperatorMap;