export interface CrowdEntry {
  name: string; // e.g. "Crowd_Standing
  id: string; // GUID string
  action: string; // e.g. "Standing", "Sitting", "Walking"
  count: number; // number of people in this crowd entry
  library: string; // e.g. "internal", "third-party"
  package: string; // e.g. "asobo-modellib-assets"
}

export interface ModelEntry {
  name: string; // e.g. "ESD_AC_DHC2_Floats_Static_Microsoft"
  id: string; // GUID string
  offset?: number; // in degrees, optional heading offset to apply to this model (e.g. for tail-in models)
  wingspan?: number; // in meters
  type: string; // e.g. "single-prop", "turbo-prop", "jet"
  library: string; // e.g. "internal", "third-party"
  package: string; // e.g. "esd-modellib-eolib"
}

export interface RowConfig {
  startLat: number;
  startLon: number;
  heading: number;
  columnSpacing: number; // meters between aircraft in the same row (column)
  rowSpacing?: number; // meters between rows (defaults to columnSpacing if not provided)
  count: number;
  columnLength?: number; // meters, optional alternative to count (overrides count if provided)
  rowLength?: number; // meters, optional alternative to columnCount (overrides columnCount if provided)
  columnCount: number;
  columnDirection: number;
  orientation: "nose-to-nose" | "tail-to-tail";
  density?: "sparse" | "medium" | "dense";
  models: ModelEntry[];
  aircraftTypes: string[]; // filter to only include models of these types (e.g. "single-prop", "turbo-prop")
  library: string[]; // filter to only include models from this library (e.g. "internal", "third-party")
  parentGroupID: number;
  thirdPartyGroupID?: number; // parentGroupID to use for models whose library is "third-party" (e.g. the "totof" folder), defaults to parentGroupID
  tents?: boolean; // optional, if true will add a tent object at the end of each row
  tentDensity?: number; // probability (0-1) of placing a tent, default 0.2 (20%)
  crowds: boolean; // if true will add a crowd object at the end of each row
  crowdDensity?: number; // probability (0-1) of placing a crowd, default 0.2 (20%)
  crowdCount?: number; // number of people in each crowd (if crowds enabled)
}
