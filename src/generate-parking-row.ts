import fs from "fs";
import path from "path";
import aircraftModels from "../assets/aircraft-models.json";
import { offsetCoord } from "./utils";
import { ModelEntry, RowConfig } from "./types";
import { placeTent } from "./tent";
import { placeCrowd } from "./crowd";

const config: RowConfig = {
  // Starting position
  startLat: 43.995609048,
  startLon: -88.554624809,

  // Aircraft heading (degrees, 0 = north, 90 = east)
  heading: -0.000014,

  // Spacing between aircraft in the same column (meters)
  columnSpacing: 2,

  // Spacing between rows (meters). Defaults to columnSpacing if not specified.
  rowSpacing: 26.0,

  // Number of aircraft to place
  count: 9,

  // Length of each column in meters (optional, overrides count)
  columnLength: 300.0,

  // Length of all rows in meters (optional, overrides columnCount)
  rowLength: 1500, // 60, 1000

  // Group ID (match your existing parentGroupID scheme)
  parentGroupID: 5,

  // Group ID for third-party models — the "DEPENDENCIES/totof" folder
  thirdPartyGroupID: 35,

  // Density of placement (optional, adjusts spacing)
  density: "dense",

  // Number of columns to place (if >1, columns will be spaced by rowSpacing perpendicular to columnDirection)
  columnCount: 2,

  // Direction each column extends (degrees)
  // 0 = column runs north, 90 = column runs east
  columnDirection: 180.0,

  // Orientation of aircraft in row (nose-to-nose or tail-to-tail)
  orientation: "tail-to-tail",

  // Models to place — one is chosen at random for each object
  models: aircraftModels,

  aircraftTypes: ["single-prop", "turbo-prop"], // filter to only include models of these types (e.g. "single-prop", "turbo-prop", "jet")

  library: ["internal", "third-party"], // filter to only include models from this library (e.g. "internal", "third-party")

  // Enable tent placement
  tents: true,

  // Probability of placing a tent near each aircraft (0-1, default 0.2)
  tentDensity: 0.6,

  // Enable crowd placement
  crowds: true,

  // Probability of placing a crowd near each aircraft (0-1, default 0.2)
  crowdDensity: 0.5,

  crowdCount: 3, // Number of people in each crowd (if crowds enabled)
};

let reportTotalRows = 0;

function generateParkingRow(cfg: RowConfig): string {
  const lines: string[] = [];

  const densityProbabilities: Record<"sparse" | "medium" | "dense", number> = {
    sparse: 0.4,
    medium: 0.65,
    dense: 0.9,
  };
  const densityProbability = cfg.density
    ? densityProbabilities[cfg.density]
    : 1.0;

  // Apply tail-to-tail spacing reduction (tighter packing) — the lateral stagger
  // below lets neighboring tails nest past each other, so the column can run tighter
  const tailToTailSpacingMultiplier =
    cfg.orientation === "tail-to-tail" ? 0.2 : 1.0;

  const effectiveColumnSpacing =
    cfg.columnSpacing * tailToTailSpacingMultiplier;
  const effectiveRowSpacing = cfg.rowSpacing ?? cfg.columnSpacing;

  // Filter models to only those matching the configured aircraft types and library
  const eligibleModels = cfg.models.filter(
    (model) =>
      cfg.aircraftTypes.includes(model.type ?? "") &&
      cfg.library.includes(model.library ?? ""),
  );

  if (eligibleModels.length === 0) {
    throw new Error(
      `No models match aircraftTypes ${JSON.stringify(cfg.aircraftTypes)} and library ${JSON.stringify(cfg.library)}`,
    );
  }

  // Calculate columnCount from rowLength if provided, otherwise use cfg.columnCount
  const columnCount = cfg.rowLength
    ? Math.floor(cfg.rowLength / effectiveRowSpacing)
    : cfg.columnCount;

  reportTotalRows += columnCount;

  for (let x = 0; x < columnCount; x++) {
    const columnStart = offsetCoord(
      cfg.startLat,
      cfg.startLon,
      effectiveRowSpacing * x,
      (cfg.columnDirection + 90) % 360,
    );
    lines.push(`\t<!-- Generated Column ${x + 1} -->`);

    // Build the column slot-by-slot rather than pre-sizing it: wingspan-aware gaps
    // (see below) mean the number of aircraft that fit in columnLength isn't known
    // up front. Models are still chosen for every slot before placement (rather than
    // per-placement) so spacing stays consistent even for slots the density roll skips.
    const columnModels: ModelEntry[] = [];
    const slotOffsets: number[] = [];
    let cumulativeOffset = 0;
    while (true) {
      if (cfg.columnLength === undefined && columnModels.length >= cfg.count) {
        break;
      }

      const candidate =
        eligibleModels[Math.floor(Math.random() * eligibleModels.length)];
      const previous = columnModels[columnModels.length - 1];

      // columnSpacing is treated as the wingtip clearance gap, widened by the
      // average of the two neighboring aircrafts' wingspans so larger models
      // don't overlap their neighbors.
      const offset = previous
        ? cumulativeOffset +
          effectiveColumnSpacing +
          ((previous.wingspan ?? 0) + (candidate.wingspan ?? 0)) / 2
        : 0;

      if (cfg.columnLength !== undefined && offset > cfg.columnLength) break;

      columnModels.push(candidate);
      slotOffsets.push(offset);
      cumulativeOffset = offset;
    }
    const aircraftCount = columnModels.length;

    for (let i = 0; i < aircraftCount; i++) {
      if (Math.random() > densityProbability) continue;

      let pos = offsetCoord(
        columnStart.lat,
        columnStart.lon,
        slotOffsets[i],
        cfg.columnDirection,
      );

      // For tail-to-tail, stagger alternating aircraft to opposite sides of the
      // column line so neighboring tails nest past each other instead of colliding —
      // this is what lets the column run tighter than a straight line would allow.
      if (cfg.orientation === "tail-to-tail") {
        const staggerSide = i % 2 === 0 ? -90 : 90;
        const staggerDirection = (cfg.columnDirection + staggerSide) % 360;
        pos = offsetCoord(pos.lat, pos.lon, 2.5, staggerDirection);
      }

      const model = columnModels[i];

      // Third-party models live in their own scenery group (e.g. the "totof" folder)
      const groupID =
        model.library === "third-party"
          ? (cfg.thirdPartyGroupID ?? cfg.parentGroupID)
          : cfg.parentGroupID;

      // calculate adjustment to intended heading
      let offsetHeading = model.offset
        ? cfg.heading - model.offset
        : cfg.heading;

      // Apply orientation: tail-to-tail means alternating headings
      if (cfg.orientation === "tail-to-tail" && i % 2 === 1) {
        offsetHeading = (offsetHeading + 180) % 360;
      }

      lines.push(
        `\t<!-- Generated SceneryObject name: ${model.name} ${i + 1} - Row ${x + 1} -->`,
      );
      lines.push(
        `\t<SceneryObject displayName="${model.name} ${i + 1} - Row ${x + 1}" ` +
          `parentGroupID="${groupID}" groupIndex="${i + 1}" ` +
          `lat="${pos.lat.toFixed(15)}" lon="${pos.lon.toFixed(15)}" ` +
          `alt="0.00000000000000" pitch="0.000000" bank="0.000000" ` +
          `heading="${offsetHeading.toFixed(6)}" ` +
          `imageComplexity="VERY_SPARSE" altitudeIsAgl="TRUE" ` +
          `snapToGround="TRUE" snapToNormal="FALSE">`,
      );
      lines.push(`\t\t<UseInstancing/>`);
      lines.push(`\t\t<LibraryObject name="${model.id}" scale="1.000000"/>`);
      lines.push(`\t</SceneryObject>`);

      // Randomly place tents if enabled
      if (cfg.tents && Math.random() < (cfg.tentDensity ?? 0.2)) {
        // Random side: left (-90) or right (+90) perpendicular to column direction
        const sideOffset = Math.random() < 0.5 ? -90 : 90;
        const sideDirection = (cfg.columnDirection + sideOffset) % 360;

        // Offset toward tail (opposite of column direction) by ~8 meters
        const tailOffset = (cfg.columnDirection + 180) % 360;

        const tentPos = offsetCoord(
          pos.lat,
          pos.lon,
          4.0, // distance toward tail
          tailOffset,
        );

        // Further offset left/right by ~10 meters
        const finalTentPos = offsetCoord(
          tentPos.lat,
          tentPos.lon,
          4.0, // distance to side
          sideDirection,
        );

        lines.push(
          placeTent(
            finalTentPos.lat,
            finalTentPos.lon,
            Math.random() * 360,
            i + 1,
            cfg,
          ),
        );
      }

      // Randomly place a crowd if enabled
      if (cfg.crowds && Math.random() < (cfg.crowdDensity ?? 0.2)) {
        // Position relative to the aircraft's actual rendered heading (not the
        // column direction) so "left"/"right"/"middle" are relative to the plane
        // itself: left of the fuselage, right of the fuselage, or out front of the nose.
        const placement = ["left", "right", "middle"][
          Math.floor(Math.random() * 3)
        ];
        const crowdBearing =
          placement === "left"
            ? (offsetHeading + 270) % 360
            : placement === "right"
              ? (offsetHeading + 90) % 360
              : offsetHeading;

        // Clear the wingspan footprint first, then stand 1m beyond it
        const crowdDistance = (model.wingspan ?? 0) / 2 + 1.0;

        const crowdPos = offsetCoord(
          pos.lat,
          pos.lon,
          crowdDistance,
          crowdBearing,
        );

        lines.push(
          placeCrowd(
            crowdPos.lat,
            crowdPos.lon,
            Math.random() * 360,
            i + 1,
            "standing",
            cfg,
          ),
        );
      }
    }
    lines.push("\n");
  }
  return lines.join("\n");
}

const outDir = path.resolve(__dirname, "../dist");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "output.xml"),
  generateParkingRow(config),
  "utf8",
);
console.log(`Written ${reportTotalRows} rows to dist/output.xml`);
