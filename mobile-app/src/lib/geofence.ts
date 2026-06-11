const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export type Coordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Haversine formula — returns distance in meters between two GPS coordinates.
 */
export function calculateDistance(
  pointA: Coordinates,
  pointB: Coordinates,
): number {
  const lat1 = toRadians(pointA.latitude);
  const lat2 = toRadians(pointB.latitude);
  const deltaLat = toRadians(pointB.latitude - pointA.latitude);
  const deltaLng = toRadians(pointB.longitude - pointA.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export function isWithinRadius(
  userLocation: Coordinates,
  officeLocation: Coordinates,
  radiusMeters: number,
): boolean {
  return calculateDistance(userLocation, officeLocation) <= radiusMeters;
}

export function findNearestOfficeWithinRadius(
  userLocation: Coordinates,
  offices: Array<Coordinates & { radius_meters: number; id: string }>,
): { officeId: string; distance: number } | null {
  let nearest: { officeId: string; distance: number } | null = null;

  for (const office of offices) {
    const distance = calculateDistance(userLocation, {
      latitude: office.latitude,
      longitude: office.longitude,
    });

    if (distance <= office.radius_meters) {
      if (!nearest || distance < nearest.distance) {
        nearest = { officeId: office.id, distance };
      }
    }
  }

  return nearest;
}
