# Atlas-Medieval

A medieval grand strategy simulation project focused on transit, movement, and political geography.

## Transit Spine Generator

This repository includes a standalone Node.js script that generates a validated medieval transit graph and writes it to `data/globalTransitSpine.json`.

### Run it

```bash
node scripts/generateTransitSpine.js
```

### Output

The script will generate:

- `data/globalTransitSpine.json`

### Generated graph structure

Each node follows this shape:

```json
{
  "nodeId": "barony_winchester",
  "name": "Winchester",
  "tier": "county",
  "region": "wessex",
  "coordinates": [320, 450],
  "terrain": "plains",
  "baseAttritionRate": 0.08,
  "connections": [
    {
      "targetNodeId": "barony_salisbury",
      "transitType": "roman_road",
      "distanceWeeks": 1.5,
      "riskModifier": 0.8,
      "seasonalWeights": {
        "spring": 1.1,
        "summer": 1.0,
        "autumn": 0.95,
        "winter": 1.3
      }
    }
  ]
}
```

### Validation behavior

Before writing the file, the generator checks:

- all reciprocal edges exist for bidirectional routes
- no node is orphaned
- all `targetNodeId` references resolve to valid nodes
- node and edge schema constraints are respected

If validation fails, the script exits with an explicit error identifying the broken node or connection.
