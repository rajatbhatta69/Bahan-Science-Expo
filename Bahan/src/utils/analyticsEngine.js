export const calculateBusinessMetrics = (liveBuses) => {
    const busEntries = Object.values(liveBuses);
    const totalBuses = busEntries.length;

    // Logic: Avg speed vs a target of 25km/h for efficiency
    const avgSpeed = busEntries.reduce((acc, bus) => acc + (bus.speed || 0), 0) / (totalBuses || 1);
    const efficiency = totalBuses > 0 ? Math.min(Math.round((avgSpeed / 25) * 100), 100) : 0;

    // Logic: If more than 20% of fleet is at 0 speed, risk is High
    const delayedBuses = busEntries.filter(bus => (bus.speed || 0) < 5).length;
    let revenueRisk = "Low";
    if (delayedBuses > totalBuses * 0.2) revenueRisk = "High";
    else if (delayedBuses > 0) revenueRisk = "Med";

    return {
        totalBuses,
        efficiency,
        totalPassengers: totalBuses * 42, // Dummy multiplier for demo
        revenueRisk
    };
};

export const generateRevenueData = (totalBuses) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseRevenue = totalBuses * 1200; // Estimated NPR per bus per day

    return days.map(day => ({
        name: day,
        revenue: Math.floor(baseRevenue + (Math.random() * 2000 - 1000)),
        cost: Math.floor((baseRevenue * 0.4) + (Math.random() * 500)) // 40% operating cost
    }));
};

export const calculateFleetHealth = (liveBuses) => {
    const busIds = Object.keys(liveBuses);
    if (busIds.length === 0) return { avgFuel: 0, criticalMaintenance: 0 };

    // Simulate fuel waste based on buses with 0 speed
    const idlingBuses = Object.values(liveBuses).filter(b => (b.speed || 0) < 5).length;
    const fuelWaste = idlingBuses * 0.8; // Assume 0.8L wasted per idling bus

    return {
        fuelWaste: fuelWaste.toFixed(1),
        maintenanceAlerts: Math.floor(busIds.length * 0.2), // 20% of fleet usually needs checkup
        fleetHealthScore: 100 - (idlingBuses * 5)
    };
};