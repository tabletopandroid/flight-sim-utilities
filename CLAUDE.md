# Flight Simulator Scenery Utility Scripts

TypeScript scripts that automate repetitive scenery-authoring tasks for Microsoft Flight Simulator (MSFS 2024). Output is XML that gets pasted directly into `.xml` scenery files.

## Stack

- **Runtime:** Node.js with `ts-node` (no compile step needed)
- **Language:** TypeScript (strict mode, ES2020 target)
- **Assets:** JSON data files in `assets/`
- **Docs:** Per-script markdown in `docs/`

## Running Scripts

```powershell
npm run generate-row
# or directly:
npx ts-node src/generate-row.ts
```

Output is printed to stdout — copy it and paste into the target `.xml` scenery file.

## Project Structure

```
assets/          Static data (aircraft model names + GUIDs)
docs/            Per-script usage documentation
src/             TypeScript source scripts
tsconfig.json    TypeScript config
```

## Scripts

### `generate-row` ([src/generate-row.ts](src/generate-row.ts))

Generates a row of evenly-spaced MSFS `<SceneryObject>` XML entries along a configurable bearing.

Edit the `config` object at the top of the file before running. Key parameters:

| Parameter | Description |
|---|---|
| `startLat` / `startLon` | Starting position in decimal degrees |
| `heading` | Facing direction of placed objects (degrees) |
| `spacingMeters` | Distance between objects |
| `count` | How many objects to place |
| `rowDirection` | Bearing along which the row extends |
| `models` | Array of `{ name, id }` — one is chosen randomly per object |
| `displayName` | Name prefix (suffixed with 1-based index) |
| `parentGroupID` | Group ID matching the target scenery file |

Coordinates are computed with the haversine formula. Objects always snap to ground (`altitudeIsAgl="TRUE"`, `snapToGround="TRUE"`).

## Assets

**`assets/aircraft-models.json`** — list of static aircraft library objects with their MSFS GUID `name` fields. Add new models here; `generate-row` picks from this list randomly.

## Adding a New Script

1. Create `src/<script-name>.ts`
2. Add an npm script to `package.json`: `"<script-name>": "ts-node src/<script-name>.ts"`
3. Add a usage doc at `docs/<script-name>.md`
