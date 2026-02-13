# LoadEx Firebase Cloud Functions

## Function: `calculateFare`

Deployable HTTP function for fare calculation with:

- Pricing rules by `vehicleType`
- Slab-based long distance pricing
- Surge multiplier support
- Full fare breakdown response

### Request

`POST /calculateFare`

```json
{
  "vehicleType": "mini_truck",
  "distanceKm": 132,
  "surgeMultiplier": 1.25
}
```

### Pricing Rule Document Shape (`pricing_rules/{vehicleType}`)

```json
{
  "baseFare": 200,
  "platformFee": 25,
  "perKmRate": 18,
  "surgeMultiplier": 1,
  "currency": "INR",
  "distanceSlabs": [
    { "upToKm": 50, "perKmRate": 18 },
    { "upToKm": 150, "perKmRate": 16 },
    { "upToKm": null, "perKmRate": 14 }
  ]
}
```

### Response (example)

```json
{
  "success": true,
  "data": {
    "vehicleType": "mini_truck",
    "currency": "INR",
    "pricingRuleRef": "mini_truck",
    "baseFare": 200,
    "platformFee": 25,
    "distanceKm": 132,
    "slabDistanceFare": 2252,
    "slabBreakdown": [
      { "fromKm": 0, "toKm": 50, "km": 50, "perKmRate": 18, "fare": 900 },
      { "fromKm": 50, "toKm": 150, "km": 82, "perKmRate": 16, "fare": 1312 }
    ],
    "subTotalBeforeSurge": 2477,
    "appliedSurgeMultiplier": 1.25,
    "surgeAmount": 619.25,
    "totalFare": 3096.25
  }
}
```

## Deploy

```bash
cd functions
npm install
npm run deploy
```
