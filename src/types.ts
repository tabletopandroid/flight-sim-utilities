export interface ModelEntry {
  name: string;
  id: string;
  offset?: number;
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
  displayName: string;
  parentGroupID: number;
  tents?: boolean; // optional, if true will add a tent object at the end of each row
  tentDensity?: number; // probability (0-1) of placing a tent, default 0.2 (20%)
}
