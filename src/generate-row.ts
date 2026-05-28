import fs from "fs";
import path from "path";
import aircraftModels from "../assets/aircraft-models.json";

interface ModelEntry {
  name: string;
  id: string;
}

interface RowConfig {
  startLat: number;
  startLon: number;
  heading: number;
  spacingMeters: number;
  count: number;
  rowDirection: number;
  models: ModelEntry[];
  displayName: string;
  parentGroupID: number;
}

interface Coord {
  lat: number;
  lon: number;
}

const config: RowConfig = {
  // Starting position
  startLat: 43.9905980598997,
  startLon: -88.56377168551538,

  // Aircraft heading (degrees, 0 = north, 90 = east)
  heading: -0.000014,

  // Spacing between aircraft in meters
  spacingMeters: 12.0,

  // Number of aircraft to place
  count: 9,

  // Direction the row extends (degrees)
  // 0 = row runs north, 90 = row runs east
  rowDirection: 180.0,

  // Models to place — one is chosen at random for each object
  models: aircraftModels,

  // Display name prefix
  displayName: "North 40 Aircraft",

  // Group ID (match your existing parentGroupID scheme)
  parentGroupID: 3,
};

const EARTH_RADIUS = 6371000;

function offsetCoord(
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

function generateRow(cfg: RowConfig): string {
  const lines: string[] = [];

  for (let i = 0; i < cfg.count; i++) {
    const pos = offsetCoord(
      cfg.startLat,
      cfg.startLon,
      cfg.spacingMeters * i,
      cfg.rowDirection,
    );

    const model = cfg.models[Math.floor(Math.random() * cfg.models.length)];

    lines.push(`\t<!--SceneryObject name: ${model.name} ${i + 1}-->`);
    lines.push(
      `\t<SceneryObject displayName="${cfg.displayName} ${i + 1}" ` +
        `parentGroupID="${cfg.parentGroupID}" groupIndex="${i + 1}" ` +
        `lat="${pos.lat.toFixed(15)}" lon="${pos.lon.toFixed(15)}" ` +
        `alt="0.00000000000000" pitch="0.000000" bank="0.000000" ` +
        `heading="${cfg.heading.toFixed(6)}" ` +
        `imageComplexity="VERY_SPARSE" altitudeIsAgl="TRUE" ` +
        `snapToGround="TRUE" snapToNormal="FALSE">`,
    );
    lines.push(`\t\t<UseInstancing/>`);
    lines.push(`\t\t<LibraryObject name="${model.id}" scale="1.000000"/>`);
    lines.push(`\t</SceneryObject>`);
  }

  return lines.join("\n");
}

const outDir = path.resolve(__dirname, "../dist");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "output.xml"), generateRow(config), "utf8");
console.log("Written to dist/output.xml");
