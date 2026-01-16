import React from 'react';
import { useBuses } from '../context/BusContext';
import logo from '../assets/Circle Logo Dark.png'; // Make sure path is correct

const Sidebar = () => {
    const { buses } = useBuses();

    return (
        <div className="w-80 h-screen bg-[#0a0a0a] text-white flex flex-col border-r border-zinc-800 shadow-2xl">
            {/* Branded Header */}
            {/* Branded Header - Enhanced Visibility */}
            <div className="p-10 flex flex-col items-center border-b border-zinc-900 bg-gradient-to-b from-[#0f0f0f] to-transparent">
                <div className="relative group">
                    {/* Outer Glow Effect */}
                    <div className="absolute -inset-1 bg-[#C05621] rounded-full opacity-20 group-hover:opacity-40 blur transition duration-1000"></div>

                    <img
                        src={logo}
                        alt="Bahan Logo"
                        className="relative w-36 h-36 object-contain drop-shadow-[0_0_20px_rgba(192,86,33,0.4)]"
                    />
                </div>

                <h1 className="text-3xl font-black tracking-[0.3em] text-white mt-6 mb-1">
                    BAHAN
                </h1>

                {/* Nepali Tagline from your logo */}
                <p className="text-[9px] text-zinc-500 font-medium text-center leading-relaxed">
                    सवारीको जानकारी, हरेक पल हातमा
                </p>

                <div className="mt-4 px-3 py-1 bg-[#C05621]/10 border border-[#C05621]/30 rounded-full">
                    <p className="text-[10px] text-[#C05621] font-bold uppercase tracking-[0.2em]">
                        Live Fleet Monitor
                    </p>
                </div>
            </div>

            {/* Bus Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {buses.map((bus) => (
                    <div
                        key={bus.id}
                        className="group p-5 bg-[#141414] rounded-2xl border border-zinc-800 hover:border-[#C05621] transition-all duration-500 cursor-pointer relative overflow-hidden"
                    >
                        {/* Background Glow Effect on Hover */}
                        <div className="absolute inset-0 bg-[#C05621] opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <h3 className="font-bold text-lg text-zinc-100 group-hover:text-[#C05621] transition-colors">
                                    {bus.name}
                                </h3>
                                <p className="text-[10px] text-zinc-500 font-mono tracking-tighter">REF: BHN-{bus.id}</p>
                            </div>
                            <span className={`h-2 w-2 rounded-full mt-2 ${bus.status === 'On Time' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-orange-600 shadow-[0_0_10px_#ea580c]'
                                }`}></span>
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="flex-1">
                                <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">Estimated Arrival</p>
                                <p className="text-xl font-light text-zinc-200">{bus.eta}</p>
                            </div>
                            <div className="h-8 w-px bg-zinc-800"></div>
                            <div className="flex-1 text-right">
                                <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">Status</p>
                                <p className={`text-sm font-bold ${bus.status === 'On Time' ? 'text-emerald-400' : 'text-orange-500'}`}>
                                    {bus.status.toUpperCase()}
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