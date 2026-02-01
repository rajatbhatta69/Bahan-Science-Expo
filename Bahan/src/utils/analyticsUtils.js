// Add these to a new file: src/utils/analyticsUtils.js

/**
 * Calculates the "Revenue Efficiency" based on bus capacity vs current load
 * (We'll use mock data for the load until the passenger app is ready)
 */
export const calculateEfficiency = (currentLoad, capacity = 40) => {
    return Math.round((currentLoad / capacity) * 100);
};

/**
 * Alerts if a bus is "Stationary" for too long at a non-station location.
 * Helps detect unauthorized stops or breakdowns.
 */
export const checkIdleAnomaly = (speed, isAtStation) => {
    if (speed === 0 && !isAtStation) return "Suspicious Idle";
    return "Normal";
};