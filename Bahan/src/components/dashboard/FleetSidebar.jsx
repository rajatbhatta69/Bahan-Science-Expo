import React from 'react';

const FleetSidebar = ({ liveBuses, selectedBusId, setSelectedBusId, onSimulate }) => (
    <aside className="w-80 border-r border-white/5 bg-zinc-950 flex flex-col">
        <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">Bahan <span className="text-orange-500">Pro</span></h1>
                </div>
                <button onClick={onSimulate} className="text-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 rounded-full transition-all active:scale-95">
                    SIMULATE
                </button>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Management Console</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2">Active Vehicles</h3>
            {Object.entries(liveBuses).map(([id, bus]) => {
                const isSelected = selectedBusId === id;
                const status = bus.speed > 5 ? 'Moving' : 'Delayed';
                return (
                    <div key={id} onClick={() => setSelectedBusId(id)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all border ${isSelected ? 'bg-orange-500/10 border-orange-500' : 'bg-zinc-900 border-white/5 hover:border-white/20'}`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="font-bold text-sm text-white">{id}</span>
                                <p className="text-[9px] text-zinc-500 font-mono uppercase">Route: {bus.routeId || 'N/A'}</p>
                            </div>
                            <div className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${status === 'Moving' ? 'border-emerald-500/50 text-emerald-500' : 'border-amber-500/50 text-amber-500'}`}>
                                {status}
                            </div>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                            <p className="text-xl font-black italic text-white">{bus.speed || 0} <span className="text-[10px] not-italic text-zinc-600 font-sans">KM/H</span></p>
                            <div className="flex gap-0.5 h-6 items-end pb-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`w-0.5 rounded-full ${isSelected ? 'bg-orange-500' : 'bg-zinc-700'}`} style={{ height: `${Math.random() * 100}%` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </aside>
);

export default FleetSidebar;