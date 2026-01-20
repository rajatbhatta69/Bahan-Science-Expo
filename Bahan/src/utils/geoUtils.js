/**
 * Calculates the great-circle distance between two points (Haversine formula).
 * Returns distance in Kilometers.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Calculates the bearing (angle) between two coordinates.
 * Used to rotate the bus icon so it points in the direction of travel.
 */
export const getBearing = (startLat, startLng, endLat, endLng) => {
    if (!startLat || !startLng || !endLat || !endLng) return 0;

    const startLatRad = startLat * (Math.PI / 180);
    const startLngRad = startLng * (Math.PI / 180);
    const endLatRad = endLat * (Math.PI / 180);
    const endLngRad = endLng * (Math.PI / 180);

    const y = Math.sin(endLngRad - startLngRad) * Math.cos(endLatRad);
    const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
        Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(endLngRad - startLngRad);

    const brng = Math.atan2(y, x);
    return ((brng * 180) / Math.PI + 360) % 360;
};