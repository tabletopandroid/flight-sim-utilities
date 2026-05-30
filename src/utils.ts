interface Coord {
  lat: number;
  lon: number;
}

export const EARTH_RADIUS = 6371000;

export function offsetCoord(
  lat: number,
  lon: number,
  distanceMeters: number,
  bearingDegrees: number,
): Coord {
  const bearing = (bearingDegrees * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const d = distanceMeters / EARTH_RADIUS;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(d) +
      Math.cos(latRad) * Math.sin(d) * Math.cos(bearing),
  );

  const newLonRad =
    lonRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(latRad),
      Math.cos(d) - Math.sin(latRad) * Math.sin(newLatRad),
    );

  return {
    lat: (newLatRad * 180) / Math.PI,
    lon: (newLonRad * 180) / Math.PI,
  };
}
