import { getBearing, calculateDistance } from '../utils/geoUtils';

/**
 * Calculates the next index and direction for a bus
 */
export const moveBus = (bus, ROUTES) => {
    if (!bus.detailedPath || bus.detailedPath.length === 0) return bus;

    const route = ROUTES.find(r => r.id === bus.routeId);
    const totalPoints = bus.detailedPath.length;
    
    // Speed control: 3 points per tick
    let nextIdx = bus.pathIndex + (3 * bus.direction);
    let nextDir = bus.direction;

    if (route.isCircular) {
        // Wrap around logic for Ring Road
        nextIdx = (nextIdx + totalPoints) % totalPoints;
    } else {
        // Pendulum logic for Linear routes
        if (nextIdx >= totalPoints - 1) {
            nextIdx = totalPoints - 1;
            nextDir = -1;
        } else if (nextIdx <= 0) {
            nextIdx = 0;
            nextDir = 1;
        }
    }

    const currentPos = bus.detailedPath[bus.pathIndex];
    const nextPos = bus.detailedPath[nextIdx];

    return {
        ...bus,
        pathIndex: nextIdx,
        direction: nextDir,
        lat: nextPos[0],
        lng: nextPos[1],
        heading: getBearing(currentPos[0], currentPos[1], nextPos[0], nextPos[1])
    };
};