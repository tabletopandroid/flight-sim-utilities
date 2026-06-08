import simCrowdAssets from "../assets/sim-crowd.json";
import { RowConfig } from "./types";

export function placeCrowd(
  lat: number,
  lon: number,
  heading: number,
  index: number,
  action: string,
  cfg: RowConfig,
): string {
  // crowdCount caps how many people a selected crowd model may depict, narrowing
  // which assets are randomly cycled through (e.g. crowdCount of 3 only picks
  // among crowds of 3 people or fewer).
  const maxCrowdSize = cfg.crowdCount ?? 3;

  const eligibleCrowds = simCrowdAssets.filter(
    (asset) => asset.action === action && asset.count <= maxCrowdSize,
  );

  if (eligibleCrowds.length === 0) {
    throw new Error(`Crowd model not found for action: ${action}`);
  }

  const crowdAsset =
    eligibleCrowds[Math.floor(Math.random() * eligibleCrowds.length)];

  return (
    `\t<!--Generated SceneryObject name: ${crowdAsset.name} ${index}-->` +
    "\n" +
    `\t<SceneryObject displayName="${crowdAsset.name} ${index}" ` +
    `parentGroupID="${cfg.parentGroupID}" groupIndex="${index}" ` +
    `lat="${lat.toFixed(15)}" lon="${lon.toFixed(15)}" ` +
    `alt="0.00000000000000" pitch="0.000000" bank="0.000000" ` +
    `heading="${heading.toFixed(6)}" ` +
    `imageComplexity="VERY_SPARSE" altitudeIsAgl="TRUE" ` +
    `snapToGround="TRUE" snapToNormal="FALSE">` +
    "\n" +
    `\t\t<UseInstancing/>` +
    "\n" +
    `\t\t<LibraryObject name="${crowdAsset.id}" scale="1.000000"/>` +
    "\n" +
    `\t</SceneryObject>`
  );
}
