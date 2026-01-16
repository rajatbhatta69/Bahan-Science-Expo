import React from 'react';
import { useBuses } from '../context/BusContext';
import Logo_Dark from '../assets/Logo_Dark.png'; // Make sure path is correct

const Sidebar = () => {
    const { buses } = useBuses();

    return (
        <div className="w-80 h-screen bg-[#0a0a0a] text-white flex flex-col border-r border-zinc-800 shadow-2xl">
            <div className="p-8 flex justify-center border-b border-zinc-900 bg-[#0a0a0a]">
                <a
                    href="/"
                    onClick={() => window.location.reload()}
                    className="transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                    <img
                        src={Logo_Dark} // Ensure this is imported correctly at the top
                        alt="Bahan Logo"
                        className="w-40 h-auto object-contain filter drop-shadow-[0_0_15px_rgba(192,86,33,0.2)]"
                    />
                </a>
            </div>

            {/* Bus Cards */}
            {/* BUS LIST SECTION */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {buses.map((bus) => (
                    <div key={bus.id} className="p-5 bg-[#141414] rounded-2xl border border-zinc-800 hover:border-[#C05621] transition-all duration-300 shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-xl text-zinc-100">{bus.name}</h3>
                                <p className="text-[10px] text-zinc-500 font-mono">REF: BHN-{bus.id}</p>
                            </div>
                            <span className={`h-2.5 w-2.5 rounded-full mt-2 animate-pulse ${bus.status === 'On Time' ? 'bg-emerald-500' : 'bg-orange-600'
                                }`}></span>
                        </div>

                        {/* LIVE COORDINATES - This is the new part */}
                        <div className="mb-6 p-3 bg-black/40 rounded-xl border border-zinc-900 flex justify-between font-mono">
                            <div>
                                <p className="text-[9px] text-zinc-600 uppercase font-black">Latitude</p>
                                <p className="text-xs text-orange-500/80">{bus.lat.toFixed(5)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-zinc-600 uppercase font-black">Longitude</p>
                                <p className="text-xs text-orange-500/80">{bus.lng.toFixed(5)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-black">EST. Arrival</p>
                                <p className="text-lg font-light text-zinc-200">{bus.eta}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-500 uppercase font-black">Status</p>
                                <p className={`text-sm font-bold ${bus.status === 'On Time' ? 'text-emerald-400' : 'text-orange-500'}`}>
                                    {bus.status}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#050505] border-t border-zinc-900 text-center">
                <p className="text-[9px] text-zinc-600 font-medium">सवारीको जानकारी, हरेक पल हातमा</p>
            </div>
        </div>
    );
};

export default Sidebar;