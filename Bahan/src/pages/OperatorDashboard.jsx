import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { ref, onValue, update } from "firebase/database";
import OperatorMap from '../components/OperatorMap';
import FleetSidebar from '../components/dashboard/FleetSidebar';
import AnalyticsCard from '../components/dashboard/AnalyticsCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import {
    calculateBusinessMetrics,
    generateRevenueData,
    calculateFleetHealth
} from '../utils/analyticsEngine';

const OperatorDashboard = () => {
    const [liveBuses, setLiveBuses] = useState({});
    const [selectedBusId, setSelectedBusId] = useState(null);
    const [alerts, setAlerts] = useState([]);

    // 1. Define what data we are looking at
    const focusedData = (selectedBusId && liveBuses[selectedBusId])
        ? { [selectedBusId]: liveBuses[selectedBusId] }
        : liveBuses;

    // 2. Calculate metrics and health based on that selection
    const metrics = calculateBusinessMetrics(focusedData);
    const health = calculateFleetHealth(focusedData);

    // 3. REVENUE CHART: Now follows the focused metrics
    // When 1 bus is selected, it shows only that bus's projected earnings
    const revenueData = useMemo(() =>
        generateRevenueData(metrics.totalBuses),
        [metrics.totalBuses] // This ensures it recalculates when you switch views
    );

    useEffect(() => {
        const liveBusesRef = ref(db, 'live_buses');
        const unsubscribe = onValue(liveBusesRef, (snapshot) => {
            const data = snapshot.val() || {};
            setLiveBuses(data);

            const newAlerts = Object.entries(data)
                .filter(([_, bus]) => (bus.speed || 0) === 0)
                .map(([id]) => ({ id: `alert-${id}`, msg: `Vehicle ${id} is stationary.` }));
            setAlerts(newAlerts);
        });
        return () => unsubscribe();
    }, []);

    const startSimulation = () => {
        Object.entries(liveBuses).forEach(([id, bus]) => {
            update(ref(db, `live_buses/${id}`), {
                lat: bus.lat + (Math.random() - 0.5) * 0.001,
                lng: bus.lng + (Math.random() - 0.5) * 0.001,
                speed: Math.floor(Math.random() * 45) + 10,
                heading: Math.random() * 360,
                lastUpdated: Date.now()
            });
        });
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] text-slate-200 flex font-sans overflow-x-hidden">

            {/* SIDEBAR */}
            <aside className="w-80 shrink-0 border-r border-white/5 bg-zinc-950">
                <div className="sticky top-0 h-screen flex flex-col">
                    <FleetSidebar
                        liveBuses={liveBuses}
                        selectedBusId={selectedBusId}
                        setSelectedBusId={setSelectedBusId}
                        onSimulate={startSimulation}
                    />
                </div>
            </aside>

            {/* MAIN VIEW */}
            <main className="flex-1 p-8 space-y-12">

                {/* LIVE INCIDENT TICKER */}
                {alerts.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full flex items-center gap-3 animate-in fade-in slide-in-from-top duration-500">
                        <span className="flex-shrink-0 bg-red-500 text-[8px] font-black px-2 py-0.5 rounded text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">SERVICE ALERTS</span>
                        <marquee className="text-xs font-bold text-red-400">
                            {alerts.map(a => `• ${a.msg} `).join('   ')}
                        </marquee>
                    </div>
                )}

                {/* SECTION 1: LIVE MAP */}
                <section>
                    <div className="flex justify-between items-end mb-2 ml-2">
                        <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Live Fleet Operations</h2>
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full animate-pulse">RADAR ACTIVE</span>
                    </div>
                    <div className="h-[350px] w-full bg-zinc-900 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl">
                        <OperatorMap liveBuses={liveBuses} selectedBusId={selectedBusId} />
                    </div>
                </section>

                {/* SECTION 2: KPIs */}
                {/* SECTION 2: KPIs */}
                <section>
                    <div className="flex justify-between items-end mb-2 ml-2">
                        <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                            {selectedBusId ? `Analyzing Unit: ${selectedBusId}` : "Global Operational Statistics"}
                        </h2>

                        {selectedBusId && (
                            <button
                                onClick={() => setSelectedBusId(null)}
                                className="text-[9px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10"
                            >
                                ← Back to Fleet View
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        <AnalyticsCard
                            label={selectedBusId ? "Unit Status" : "Total Fleet"}
                            value={selectedBusId ? "Active" : metrics.totalBuses}
                            unit={selectedBusId ? "GPS" : "Units"}
                        />
                        <AnalyticsCard label="Avg Efficiency" value={metrics.efficiency} unit="%" color="text-orange-500" />
                        <AnalyticsCard label="Live Riders" value={metrics.totalPassengers} unit="Users" />
                        <AnalyticsCard label="Revenue Risk" value={metrics.revenueRisk} unit="Level" color={metrics.revenueRisk === "Low" ? "text-emerald-500" : "text-red-500"} />
                    </div>
                </section>

                {/* SECTION 3: REVENUE */}
                {/* SECTION 3: REVENUE */}
                <section className="pb-16">
                    <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4 ml-2">
                        {selectedBusId ? `Unit ${selectedBusId} Earnings Projection` : "Fleet Revenue Analytics"}
                    </h2>
                    <div className="bg-zinc-950 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <RevenueChart data={revenueData} />
                    </div>
                </section>

                {/* SECTION 4: RESOURCE & HEALTH (Merged & Logic-Linked) */}
                <section className="grid grid-cols-2 gap-8 pb-20">

                    {/* Fuel Card - Linked to health.fuelWaste */}
                    <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Resource Optimization</h3>
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-3xl font-black italic text-white">{health.fuelWaste}L</p>
                                <p className="text-[10px] font-bold text-zinc-600 uppercase">Estimated Fuel Waste (Idling)</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-emerald-500">-12%</p>
                                <p className="text-[10px] font-bold text-zinc-600 uppercase">vs Last Week</p>
                            </div>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-orange-500 h-full w-[45%] animate-pulse"></div>
                        </div>
                    </div>

                    {/* Maintenance Card - Linked to health alerts/score */}
                    <div className="bg-zinc-950 border border-white/5 p-8 rounded-[2.5rem]">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Maintenance Radar</h3>
                        <div className="flex gap-6">
                            <div className="flex-1 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 text-center">
                                <p className="text-[9px] font-black text-zinc-500 uppercase mb-2">Service Due</p>
                                <p className="text-2xl font-black text-white">{health.maintenanceAlerts}</p>
                                <p className="text-[8px] font-bold text-orange-500 mt-1 uppercase">Units</p>
                            </div>
                            <div className="flex-1 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 text-center">
                                <p className="text-[9px] font-black text-zinc-500 uppercase mb-2">Fleet Health</p>
                                <p className="text-2xl font-black text-white">{health.fleetHealthScore}%</p>
                                <p className="text-[8px] font-bold text-emerald-500 mt-1 uppercase">Optimal</p>
                            </div>
                        </div>
                    </div>

                </section>
            </main>
        </div>
    );
};

export default OperatorDashboard;