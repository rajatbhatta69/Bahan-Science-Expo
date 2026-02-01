/**
 * RULES FOR THE BAHAN ECOSYSTEM
 */

const RANKS = [
    { name: "Rookie Scout", minPoints: 0, color: "#94a3b8" },    // Gray
    { name: "Elite Scout", minPoints: 200, color: "#f97316" },   // Orange
    { name: "Master Navigator", minPoints: 500, color: "#8b5cf6" }, // Purple
    { name: "Legendary Sentinel", minPoints: 1000, color: "#ef4444" } // Red
];

export const gamificationEngine = {
    // 1. Calculate the User's Rank based on points
    getRank: (points) => {
        return RANKS.slice().reverse().find(r => points >= r.minPoints) || RANKS[0];
    },

    // 2. Calculate "Environmental Impact"
    // Concept: Every traffic report helps optimize routes, saving ~0.2L of fuel
    calculateImpact: (totalReports) => {
        const fuelSaved = totalReports * 0.2; 
        const co2Offset = fuelSaved * 2.3; // 2.3kg of CO2 per liter of diesel
        return {
            fuel: fuelSaved.toFixed(1),
            co2: co2Offset.toFixed(1)
        };
    },

    // 3. Point Multipliers (For the Pitch Story)
    // Concept: Reporting during rush hour gives double points
    getPointValue: (baseValue) => {
        const hour = new Date().getHours();
        const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 16 && hour <= 19);
        return isRushHour ? baseValue * 2 : baseValue;
    }
};