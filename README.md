# NatalNova Swiss Ephemeris Functions

This repository contains the astrological calculation functions for NatalNova, using the Swiss Ephemeris library.

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

**Why AGPL?** This code uses the Swiss Ephemeris library, which is licensed under AGPL. According to Swiss Ephemeris licensing requirements, any software that uses their library must also be released under AGPL and make its source code publicly available.

## About Swiss Ephemeris

Swiss Ephemeris is the high-precision ephemeris developed by Astrodienst. It is based upon the DE406 ephemeris from NASA's JPL, and covers the time range from 13000 BC to AD 17000.

For more information: https://www.astro.com/swisseph/

## Usage

These Firebase Cloud Functions are deployed as part of the NatalNova platform but can be called independently:

### `calculateNatalChart`

Calculates a complete natal chart including planetary positions, houses, and aspects.

**Input:**
```typescript
{
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  placeId: string; // Google Places ID
}
```

**Output:**
```typescript
{
  chartInfo: {...},
  planetaryPosit
  planetaryPositions: {...},
  houseCusps: [...],
  aspects: [...]
}
Development
Prerequisites

Node.js 20+
Firebase CLI
Google Maps API Key (for timezone and coordinates)

Setup
bashcd functions
npm install
Testing
bashnpm test
Deployment
bashfirebase deploy --only functions
````

## Contributing

As this is AGPL-licensed software, contributions are welcome! Please ensure:
1. You agree to license your contributions under AGPL-3.0
2. All changes maintain AGPL compliance
3. Tests are included for new functionality

## Contact

For questions about this specific implementation, please open an issue on GitHub.

For Swiss Ephemeris questions, refer to: https://www.astro.com/swisseph/