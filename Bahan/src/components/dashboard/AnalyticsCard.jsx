import React from 'react';

const AnalyticsCard = ({ label, value, unit, color = "text-white" }) => (
    <div className="bg-zinc-950 border border-white/5 p-5 rounded-[2rem]">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black tracking-tighter ${color}`}>{value}</span>
            <span className="text-[10px] font-bold text-zinc-600 uppercase">{unit}</span>
        </div>
    </div>
);

export default AnalyticsCard;