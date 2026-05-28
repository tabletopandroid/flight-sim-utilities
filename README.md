# Flight Simulator Scenery Utility Scripts

TypeScript scripts that automate repetitive scenery-authoring tasks for Microsoft Flight Simulator (MSFS 2024). Each script generates XML ready to paste into a `.xml` scenery file.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

```powershell
npm install
```

## Scripts

### generate-row

Generates a row of evenly-spaced `<SceneryObject>` entries along a configurable bearing.

```powershell
npm run generate-row
```

Output is written to `dist/output.xml`. Paste the contents into your target scenery file.

See [docs/generate-row.md](docs/generate-row.md) for full configuration reference.

## Project Structure

```
assets/          Static data (aircraft model names + library GUIDs)
docs/            Per-script usage documentation
src/             TypeScript source scripts
dist/            Generated output (git-ignored)
```

## Adding a New Script

1. Create `src/<script-name>.ts`
2. Add an npm script to `package.json`: `"<script-name>": "ts-node src/<script-name>.ts"`
3. Add a usage doc at `docs/<script-name>.md`
