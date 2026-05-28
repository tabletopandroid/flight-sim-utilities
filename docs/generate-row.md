# Generate Row Script

Generates a row of evenly-spaced MSFS scenery objects along a configurable bearing, outputting XML ready to paste into a `.xml` scenery file.

## Usage

```powershell
npm run generate-row
```

Edit the `config` object at the top of [generate-row.ts](../src/generate-row.ts) before running. Output is written to `dist/output.xml` — open that file and paste its contents into your target `.xml` scenery file.

## Configuration Parameters

| Parameter | Type | Description |
|---|---|---|
| `startLat` | `number` | Starting latitude in decimal degrees |
| `startLon` | `number` | Starting longitude in decimal degrees |
| `heading` | `number` | The heading each placed object faces, in degrees (0 = north, 90 = east) |
| `spacingMeters` | `number` | Distance between objects in meters |
| `count` | `number` | Number of objects to place |
| `rowDirection` | `number` | Bearing along which the row extends, in degrees (0 = row runs north, 90 = row runs east) |
| `models` | `ModelEntry[]` | Array of `{ name, id }` sourced from `assets/aircraft-models.json`; one is chosen at random per object |
| `displayName` | `string` | Display name prefix; each object is suffixed with its 1-based index e.g. `Warbird 1` |
| `parentGroupID` | `number` | Group ID matching the `parentGroupID` scheme used in the target scenery file |

## Sample XML Output

```xml
<!--SceneryObject name: Warbird 1-->
<SceneryObject displayName="Warbird 1" parentGroupID="20" groupIndex="1" lat="43.988000000000000" lon="-88.561000000000000" alt="0.00000000000000" pitch="0.000000" bank="0.000000" heading="90.000000" imageComplexity="VERY_SPARSE" altitudeIsAgl="TRUE" snapToGround="TRUE" snapToNormal="FALSE">
    <UseInstancing/>
    <LibraryObject name="{YOUR-GUID-HERE}" scale="1.000000"/>
</SceneryObject>
```

## Notes

- `alt` is always `0` and `altitudeIsAgl` is always `TRUE` so objects snap to terrain height.
- `snapToGround="TRUE"` keeps objects flush with the ground surface.
- Coordinates are computed using the haversine formula on a spherical Earth model (radius 6 371 000 m).
