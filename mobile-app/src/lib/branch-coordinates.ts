export type ParsedBranchCoordinates = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
};

export function parseBranchCoordinates(input: {
  latitude: unknown;
  longitude: unknown;
  radiusMeters?: unknown;
}): ParsedBranchCoordinates | null {
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  const radiusMeters = Number(input.radiusMeters ?? 100);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  if (latitude === 0 && longitude === 0) {
    return null;
  }

  return {
    latitude,
    longitude,
    radiusMeters: Number.isFinite(radiusMeters) && radiusMeters > 0 ? radiusMeters : 100,
  };
}
