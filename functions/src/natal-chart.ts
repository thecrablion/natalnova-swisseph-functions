import {onCall, HttpsError} from 'firebase-functions/v2/https';
import {Storage} from '@google-cloud/storage';
import * as swisseph from 'swisseph';
import {Client} from '@googlemaps/google-maps-services-js';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import {defineSecret} from 'firebase-functions/params';
import {
  BirthDataInput,
  NatalChart,
  ChartInfo,
  PlanetaryPosition,
  HouseCusp,
} from './types/chart.types';
import {degreeToSign, formatPosition} from './utils/degree-to-sign';
import {getHouse} from './utils/get-house';
import {calculateAspects} from './utils/calculate-aspects';

const googleMapsApiKey = defineSecret('GOOGLE_MAPS_API_KEY');

const gmapsClient = new Client({});
const storage = new Storage();

const CELESTIAL_BODIES = {
  Sun: swisseph.SE_SUN,
  Moon: swisseph.SE_MOON,
  Mercury: swisseph.SE_MERCURY,
  Venus: swisseph.SE_VENUS,
  Mars: swisseph.SE_MARS,
  Jupiter: swisseph.SE_JUPITER,
  Saturn: swisseph.SE_SATURN,
  Uranus: swisseph.SE_URANUS,
  Neptune: swisseph.SE_NEPTUNE,
  Pluto: swisseph.SE_PLUTO,
  'North Node': swisseph.SE_TRUE_NODE,
  'Mean Node': swisseph.SE_MEAN_NODE,
};

const EPHEMERIS_CACHE_DIR = path.join(os.tmpdir(), 'ephe');

/**
 * Downloads ephemeris files from Firebase Storage if not already cached
 */
async function ensureEphemerisFiles(): Promise<void> {
  if (fs.existsSync(EPHEMERIS_CACHE_DIR)) {
    console.log('Ephemeris files already cached');
    return;
  }

  console.log('Downloading ephemeris files...');
  fs.mkdirSync(EPHEMERIS_CACHE_DIR, {recursive: true});

  // Fix: Validar que FIREBASE_STORAGE_BUCKET existe
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new HttpsError(
      'failed-precondition',
      'FIREBASE_STORAGE_BUCKET environment variable is not set'
    );
  }

  const bucket = storage.bucket(bucketName);

  try {
    const [files] = await bucket.getFiles({prefix: 'ephe/'});

    await Promise.all(
      files.map(async (file) => {
        if (file.name.endsWith('/')) return;

        const destination = path.join(
          EPHEMERIS_CACHE_DIR,
          path.basename(file.name)
        );
        await file.download({destination});
        console.log(`Downloaded: ${path.basename(file.name)}`);
      })
    );

    console.log('Ephemeris files downloaded successfully');
  } catch (error) {
    console.error('Error downloading ephemeris files:', error);
    throw new HttpsError(
      'internal',
      'Failed to load ephemeris files from storage'
    );
  }
}

/**
 * Fetches geographic data using Google Maps API
 */
async function getGeographicData(
  placeId: string,
  birthDatetime: Date,
  apiKey: string
) {
  try {
    const placeDetails = await gmapsClient.placeDetails({
      params: {
        place_id: placeId,
        key: apiKey,
        fields: ['geometry'],
      },
    });

    const location = placeDetails.data.result.geometry?.location;
    if (!location) {
      throw new HttpsError('not-found', 'Location not found for place ID');
    }

    const timezoneResult = await gmapsClient.timezone({
      params: {
        location: location,
        timestamp: Math.floor(birthDatetime.getTime() / 1000),
        key: apiKey,
      },
    });

    const {rawOffset = 0, dstOffset = 0} = timezoneResult.data;
    const totalUtcOffset = (rawOffset + dstOffset) / 3600;

    return {
      latitude: location.lat,
      longitude: location.lng,
      timezoneUtc: totalUtcOffset,
    };
  } catch (error: any) {
    console.error('Google Maps API error:', error);
    throw new HttpsError(
      'internal',
      `Failed to get geographic data: ${error.message}`
    );
  }
}

/**
 * Calculates planetary positions
 */
function calculatePlanetaryPositions(
  jdUtc: number,
  houseCusps: number[]
): Record<string, PlanetaryPosition> {
  const positions: Record<string, PlanetaryPosition> = {};
  const flags = swisseph.SEFLG_SPEED;

  for (const [name, id] of Object.entries(CELESTIAL_BODIES)) {
    const result = swisseph.swe_calc_ut(jdUtc, id, flags);

    // Fix: Verificar si result tiene la propiedad error
    if ('error' in result && result.error) {
      console.error(`Error calculating ${name}:`, result.error);
      continue;
    }

    // Fix: Asegurar que result tiene longitude
    if (!('longitude' in result)) {
      console.error(`No longitude data for ${name}`);
      continue;
    }

    const signPos = degreeToSign(result.longitude);
    const house = getHouse(result.longitude, houseCusps);

    positions[name] = {
      eclipticLongitude: result.longitude,
      sign: signPos.sign,
      degreesInSign: signPos.degrees,
      minutesInSign: signPos.minutes,
      house: house,
      formattedPosition: formatPosition(signPos),
      formattedHouse: `House ${house}`,
    };
  }

  return positions;
}

/**
 * Calculates house cusps and angles
 */
function calculateHouses(
  jdUtc: number,
  latitude: number,
  longitude: number
): {cusps: number[]; ascendant: number; mc: number} {
  const houses = swisseph.swe_houses(jdUtc, latitude, longitude, 'P');

  // Fix: Verificar si houses tiene error
  if ('error' in houses && houses.error) {
    console.error('Error calculating houses:', houses.error);
    throw new HttpsError('internal', 'Failed to calculate house cusps');
  }

  // Fix: Verificar que houses tiene las propiedades necesarias
  if (!('house' in houses) || !('ascendant' in houses) || !('mc' in houses)) {
    throw new HttpsError('internal', 'Invalid house calculation result');
  }

  return {
    cusps: houses.house,
    ascendant: houses.ascendant,
    mc: houses.mc,
  };
}

/**
 * Main function to calculate natal chart
 */
export const calculateNatalChart = onCall(
  {
    secrets: [googleMapsApiKey],
    memory: '512MiB',
    timeoutSeconds: 60,
    region: 'us-central1',
  },
  async (request): Promise<NatalChart> => {
    const data = request.data as BirthDataInput;

    if (
      !data.year ||
      !data.month ||
      !data.day ||
      data.hour == null ||
      data.minute == null ||
      !data.placeId
    ) {
      throw new HttpsError(
        'invalid-argument',
        'Missing required birth data or place ID'
      );
    }

    await ensureEphemerisFiles();
    swisseph.swe_set_ephe_path(EPHEMERIS_CACHE_DIR);

    const birthDatetime = new Date(
      data.year,
      data.month - 1,
      data.day,
      data.hour,
      data.minute
    );

    const geoData = await getGeographicData(
      data.placeId,
      birthDatetime,
      googleMapsApiKey.value()
    );

    const localHourDecimal = data.hour + data.minute / 60.0;
    const jdLocal = swisseph.swe_julday(
      data.year,
      data.month,
      data.day,
      localHourDecimal,
      swisseph.SE_GREG_CAL
    );
    const jdUtc = jdLocal - geoData.timezoneUtc / 24.0;

    const housesData = calculateHouses(jdUtc, geoData.latitude, geoData.longitude);

    const planetaryPositions = calculatePlanetaryPositions(jdUtc, housesData.cusps);

    // Fix: Asegurar que todas las propiedades requeridas estén presentes
    const ascendantSignPos = degreeToSign(housesData.ascendant);
    planetaryPositions['Ascendant'] = {
      eclipticLongitude: housesData.ascendant,
      sign: ascendantSignPos.sign,
      degreesInSign: ascendantSignPos.degrees,
      minutesInSign: ascendantSignPos.minutes,
      house: 1,
      formattedPosition: formatPosition(ascendantSignPos),
      formattedHouse: 'House 1',
    };

    const midheavenSignPos = degreeToSign(housesData.mc);
    planetaryPositions['Midheaven'] = {
      eclipticLongitude: housesData.mc,
      sign: midheavenSignPos.sign,
      degreesInSign: midheavenSignPos.degrees,
      minutesInSign: midheavenSignPos.minutes,
      house: 10,
      formattedPosition: formatPosition(midheavenSignPos),
      formattedHouse: 'House 10',
    };

    const partOfFortune =
      (housesData.ascendant +
        planetaryPositions['Moon'].eclipticLongitude -
        planetaryPositions['Sun'].eclipticLongitude +
        360) %
      360;

    const fortuneSignPos = degreeToSign(partOfFortune);
    planetaryPositions['Part of Fortune'] = {
      eclipticLongitude: partOfFortune,
      sign: fortuneSignPos.sign,
      degreesInSign: fortuneSignPos.degrees,
      minutesInSign: fortuneSignPos.minutes,
      house: getHouse(partOfFortune, housesData.cusps),
      formattedPosition: formatPosition(fortuneSignPos),
      formattedHouse: `House ${getHouse(partOfFortune, housesData.cusps)}`,
    };

    const rawPositions: Record<string, number> = {};
    for (const [name, pos] of Object.entries(planetaryPositions)) {
      rawPositions[name] = pos.eclipticLongitude;
    }
    const aspects = calculateAspects(rawPositions);

    const houseCusps: HouseCusp[] = housesData.cusps.map((cusp, index) => {
      const signPos = degreeToSign(cusp);
      return {
        houseNumber: index + 1,
        eclipticLongitude: cusp,
        sign: signPos.sign,
        degreesInSign: signPos.degrees,
        minutesInSign: signPos.minutes,
        formattedPosition: formatPosition(signPos),
      };
    });

    const chartInfo: ChartInfo = {
      localDate: {
        year: data.year,
        month: data.month,
        day: data.day,
        hour: data.hour,
        minute: data.minute,
        formattedDate: birthDatetime.toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        formattedTime: `${data.hour.toString().padStart(2, '0')}:${data.minute
          .toString()
          .padStart(2, '0')}`,
      },
      location: {
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        timezoneUtc: geoData.timezoneUtc,
        julianDayUtc: jdUtc,
        latitudeFormatted: `${Math.abs(geoData.latitude).toFixed(2)}°${
          geoData.latitude >= 0 ? 'N' : 'S'
        }`,
        longitudeFormatted: `${Math.abs(geoData.longitude).toFixed(2)}°${
          geoData.longitude >= 0 ? 'E' : 'W'
        }`,
        timezoneFormatted: `UTC${geoData.timezoneUtc >= 0 ? '+' : ''}${geoData.timezoneUtc.toFixed(1)}`,
      },
    };

    return {
      chartInfo,
      planetaryPositions,
      houseCusps,
      aspects,
      houseSystem: 'Placidus',
      zodiacType: 'Tropical',
    };
  }
);