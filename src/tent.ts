import simAssets from "../assets/sim-assets.json";
import { RowConfig } from "./types";

export function placeTent(
  lat: number,
  lon: number,
  heading: number,
  index: number,
  cfg: RowConfig,
): string {
  const tentModel = simAssets.find((asset) => asset.type === "tent");
  if (!tentModel) {
    throw new Error("Tent model not found in sim assets");
  }

  return (
    `\t<!--SceneryObject name: Generic Tent ${index}-->` +
    "\n" +
    `\t<SceneryObject displayName="${tentModel.name} ${index}" ` +
    `parentGroupID="${cfg.parentGroupID}" groupIndex="${index}" ` +
    `lat="${lat.toFixed(15)}" lon="${lon.toFixed(15)}" ` +
    `alt="0.00000000000000" pitch="0.000000" bank="0.000000" ` +
    `heading="${heading.toFixed(6)}" ` +
    `imageComplexity="VERY_SPARSE" altitudeIsAgl="TRUE" ` +
    `snapToGround="TRUE" snapToNormal="FALSE">` +
    "\n" +
    `\t\t<UseInstancing/>` +
    "\n" +
    `\t\t<LibraryObject name="${tentModel.id}" scale="1.000000"/>` +
    "\n" +
    `\t</SceneryObject>`
  );
}
