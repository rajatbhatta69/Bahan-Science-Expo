import React from 'react';


const AlertOverlay = ({ alerts }) => (
    <div className="absolute top-4 right-4 w-64 space-y-2 z-[1000] pointer-events-none">
        {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} 
                 className="bg-black/60 border-l-4 border-red-500 backdrop-blur-md p-3 rounded-r-xl shadow-xl animate-in slide-in-from-right pointer-events-auto">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Live Incident</p>
                </div>
                <p className="text-[10px] font-medium text-zinc-300 leading-tight">{alert.msg}</p>
            </div>
        ))}
    </div>
);

export default AlertOverlay;