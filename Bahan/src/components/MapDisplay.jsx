import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useBuses } from '../context/BusContext';
import 'leaflet/dist/leaflet.css';

// --- THE LEAFLET ICON FIX ---
// This stops the markers from being invisible or broken
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapDisplay = () => {
    const { buses } = useBuses();

    const ktmCenter = [27.7172, 85.3240];

    const createCustomMarker = (status) => {
        const color = status === 'On Time' ? '#10b981' : '#C05621'; // Emerald vs Branded Orange

        return L.divIcon({
            html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full opacity-40 animate-ping" style="background-color: ${color}"></div>
        <div class="relative w-4 h-4 rounded-full border-2 border-white shadow-lg" style="background-color: ${color}"></div>
      </div>
    `,
            className: 'custom-bus-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16], // Centers the icon perfectly on the coordinate
        });
    };

    return (
        <div className="h-full w-full z-0">
            <MapContainer
                center={ktmCenter}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                {/* DARK THEME TILES (CartoDB Dark Matter) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

                // Alternative Links for the map: https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png, https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png, https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png,

                />

                {/* THE MARKER LOOP: Rendering buses from Context */}
                {buses.map((bus) => (
                    <Marker
                        key={bus.id}
                        position={[bus.lat, bus.lng]}
                        icon={createCustomMarker(bus.status)} // Use the new function here
                    >
                        <Popup>
                            <div className="p-1 font-sans">
                                <h3 className="font-bold text-[#0a0a0a] border-b pb-1 mb-1">{bus.name}</h3>
                                <p className="text-[10px] text-zinc-500 uppercase font-black">Current Status</p>
                                <p className={`text-sm font-bold ${bus.status === 'On Time' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                    {bus.status}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapDisplay;