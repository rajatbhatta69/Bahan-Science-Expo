import { calculateDistance } from '../utils/geoUtils';

/**
 * Slices the bus's road path for the "Tether" line.
 */
/**
 * Slices the bus's road path for the "Tether" line.
 */
export const getLiveTetherPath = (bus, userStart) => {
    if (!bus || !bus.detailedPath || bus.detailedPath.length === 0 || !userStart) return [];

    const path = bus.detailedPath;
    const busIdx = bus.pathIndex;
    const total = path.length;

    // 1. Find the point on the detailed road closest to the user's station
    let minDistance = Infinity;
    let userPointIndex = -1;

    // We only search for the user station within a reasonable range 
    // to prevent the line from "wrapping" all the way around the ring road
    for (let i = 0; i < total; i++) {
        const dist = calculateDistance(path[i][0], path[i][1], userStart.lat, userStart.lng);
        if (dist < minDistance) {
            minDistance = dist;
            userPointIndex = i;
        }
    }

    if (userPointIndex === -1) return [];

    let tetherPoints = [];
    const dir = bus.direction || 1;

    // 2. Build path from Bus to User ONLY
    if (dir === 1) {
        // Clockwise: Calculate how many steps until we hit the station
        const steps = (userPointIndex - busIdx + total) % total;

        // LIMIT: If the station is more than 60% of the route away, 
        // it's probably behind us in a circular route.
        if (steps > total * 0.6) return [];

        for (let i = 0; i <= steps; i++) {
            tetherPoints.push(path[(busIdx + i) % total]);
        }
    } else {
        // Anti-Clockwise: Calculate how many steps backward
        const steps = (busIdx - userPointIndex + total) % total;

        if (steps > total * 0.6) return [];

        for (let i = 0; i <= steps; i++) {
            tetherPoints.push(path[(busIdx - i + total) % total]);
        }
    }

    // 3. FINAL TOUCH: Force the last point to be EXACTLY the station coordinates
    // This prevents the "dash" from overshooting by a few meters
    if (tetherPoints.length > 0) {
        tetherPoints[tetherPoints.length - 1] = [userStart.lat, userStart.lng];
    }

    return tetherPoints;
};
/**
 * Returns the array of station IDs between start and end.
 */
export const getRoutePath = (startId, endId, routeId, ROUTES, STATIONS) => {
    const route = ROUTES.find(r => r.id === routeId);
    if (!route || !startId || !endId) return [];

    const startIndex = route.stations.indexOf(startId);
    const endIndex = route.stations.indexOf(endId);
    if (startIndex === -1 || endIndex === -1) return [];

    const total = route.stations.length;

    // Internal helper to calculate path distance
    const getPathWithDistance = (direction) => {
        let path = [];
        let distance = 0;
        let curr = startIndex;
        while (curr !== endIndex) {
            path.push(route.stations[curr]);
            let next = direction === 'CW' ? (curr + 1) % total : (curr - 1 + total) % total;
            const s1 = STATIONS.find(s => s.id === route.stations[curr]);
            const s2 = STATIONS.find(s => s.id === route.stations[next]);

            // USING THE IMPORTED UTILITY HERE
            distance += calculateDistance(s1.lat, s1.lng, s2.lat, s2.lng);
            curr = next;
        }
        path.push(route.stations[endIndex]);
        return { path, distance };
    };

    if (!route.isCircular) {
        return startIndex <= endIndex
            ? route.stations.slice(startIndex, endIndex + 1)
            : route.stations.slice(endIndex, startIndex + 1).reverse();
    }

    const clockwise = getPathWithDistance('CW');
    const antiClockwise = getPathWithDistance('ACW');
    return clockwise.distance <= antiClockwise.distance ? clockwise.path : antiClockwise.path;
};

/**
 * Internal helper to find a transfer point between two stations
 * that are not on the same route.
 */
const handleNoDirectBus = (startId, endId, ROUTES) => {
    const startRoutes = ROUTES.filter(r => r.stations.includes(startId));
    const endRoutes = ROUTES.filter(r => r.stations.includes(endId));

    for (const r1 of startRoutes) {
        for (const r2 of endRoutes) {
            // Find a common station (The Hub)
            const hubId = r1.stations.find(sId => r2.stations.includes(sId));

            if (hubId) {
                return {
                    type: 'TRANSFER',
                    firstRouteId: r1.id,
                    secondRouteId: r2.id,
                    transferAt: hubId,
                    firstLeg: [startId, hubId],
                    secondLeg: [hubId, endId]
                };
            }
        }
    }
    return null; // Truly no path found
};

/**
 * The main entry point for the UI to find a journey.
 */
export const findOptimalPath = (startId, endId, ROUTES) => {
    if (!startId || !endId) return null;

    // 1. Check if a direct route exists
    const directRoute = ROUTES.find(r => 
        r.stations.includes(startId) && r.stations.includes(endId)
    );

    if (directRoute) {
        return {
            type: 'DIRECT',
            routeId: directRoute.id,
            path: [startId, endId]
        };
    }

    // 2. If no direct, handle the switch
    return handleNoDirectBus(startId, endId, ROUTES);
};