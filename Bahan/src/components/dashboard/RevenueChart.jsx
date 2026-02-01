import React from 'react';

const RevenueChart = ({ data }) => {
    const maxVal = Math.max(...data.map(d => d.revenue));

    return (
        <div className="bg-zinc-950/50 border border-white/5 backdrop-blur-md p-6 rounded-[2rem] h-64 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Revenue Analytics</h3>
                    <p className="text-xl font-black italic text-white tracking-tighter">Weekly Projection</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">Costs</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-end justify-between gap-2 px-2">
                {data.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full flex items-end gap-1 h-32 relative">
                            {/* Cost Bar */}
                            <div 
                                className="flex-1 bg-zinc-800 rounded-t-sm transition-all duration-500"
                                style={{ height: `${(day.cost / maxVal) * 100}%` }}
                            ></div>
                            {/* Revenue Bar */}
                            <div 
                                className="flex-1 bg-orange-500 rounded-t-sm transition-all duration-500 group-hover:bg-orange-400"
                                style={{ height: `${(day.revenue / maxVal) * 100}%` }}
                            ></div>
                            
                            {/* Tooltip on hover */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                NPR {day.revenue.toLocaleString()}
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase">{day.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RevenueChart;