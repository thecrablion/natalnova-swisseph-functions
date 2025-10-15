# NatalNova Swiss Ephemeris Functions

This repository contains the astrological calculation functions for NatalNova, using the Swiss Ephemeris library.

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

**Why AGPL?** This code uses the Swiss Ephemeris library, which is licensed under AGPL. According to Swiss Ephemeris licensing requirements, any software that uses their library must also be released under AGPL and make its source code publicly available.

## Function: calculateNatalChart

Calculates a complete natal chart including planetary positions, houses, and aspects.

### Input
```typescript
{
  year: number;        // Birth year (1900-2100)
  month: number;       // Birth month (1-12)
  day: number;         // Birth day (1-31)
  hour: number;        // Birth hour (0-23)
  minute: number;      // Birth minute (0-59)
  placeId: string;     // Google Places ID
}
```

### Output
```typescript
{
  chartInfo: {
    localDate: {...},
    location: {...}
  },
  planetaryPositions: {
    Sun: {...},
    Moon: {...},
    // ... other planets
  },
  houseCusps: [...],
  aspects: [...],
  houseSystem: "Placidus",
  zodiacType: "Tropical"
}
```

### Example Usage
```javascript
const functions = getFunctions();
const calculateChart = httpsCallable(functions, 'calculateNatalChart');

const result = await calculateChart({
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  minute: 30,
  placeId: 'ChIJOwg_06VPwokRYv534QaPC8g' // New York City
});

console.log(result.data);
```

## Development

### Prerequisites
- Node.js 20+
- Firebase CLI
- Google Maps API Key

### Setup
```bash
cd functions
npm install
```

### Configure Secrets
```bash
firebase functions:secrets:set
GOOGLE_MAPS_API_KEY

### Testing
```bash
npm test
npm run test:coverage
```

### Local Development
```bash
npm run serve
```

### Deployment
```bash
npm run build
firebase deploy --only functions
```

## Technical Details

### House System
- Default: Placidus
- Future support planned for: Koch, Whole Sign, Equal House

### Zodiac Type
- Tropical (Western astrology)

### Celestial Bodies Calculated
- Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- North Node (True & Mean)
- Ascendant, Midheaven
- Part of Fortune

### Aspects Detected
- **Major (9° orb, 12° for luminaries):** Conjunction, Opposition, Trine, Square
- **Medium (6° orb):** Sextile
- **Minor (3° orb):** Quincunx, Sesquiquadrate, Semisquare, Semisextile

### Performance Optimizations
- Ephemeris files cached in `/tmp` (persistent across cold starts in Gen 2)
- Function memory: 512MB
- Timeout: 60 seconds
- Average execution time: 2-3 seconds

## About Swiss Ephemeris

Swiss Ephemeris is the high-precision ephemeris developed by Astrodienst, based upon NASA's JPL DE406 ephemeris.

**Time Range:** 13000 BC to AD 17000

For more information: https://www.astro.com/swisseph/

## Contributing

Contributions are welcome! Please ensure:
1. You agree to license your contributions under AGPL-3.0
2. All changes maintain AGPL compliance
3. Tests are included for new functionality
4. Code follows existing style conventions

## Testing

Run the test suite:
```bash
npm test
```

Current coverage:
- Statements: 85%+
- Branches: 75%+
- Functions: 80%+
- Lines: 85%+

## Error Handling

The function throws `HttpsError` with the following codes:

- `invalid-argument` - Missing or invalid birth data
- `not-found` - Location not found for place ID
- `internal` - Calculation errors, API errors, or ephemeris loading failures

## Contact

For questions about this implementation, please open an issue on GitHub.

For Swiss Ephemeris questions, refer to: https://www.astro.com/swisseph/