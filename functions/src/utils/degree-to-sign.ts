const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

export interface SignPosition {
  sign: string;
  degrees: number;
  minutes: number;
}

/**
 * Converts ecliptic longitude to zodiac sign position
 * @param longitude - Ecliptic longitude in degrees (0-360)
 * @returns Object with sign, degrees, and minutes
 */
export function degreeToSign(longitude: number): SignPosition {
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLongitude / 30);
  const degreesInSign = Math.floor(normalizedLongitude % 30);
  const minutesInSign = Math.floor((normalizedLongitude % 1) * 60);

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degrees: degreesInSign,
    minutes: minutesInSign,
  };
}

/**
 * Formats position as string (e.g., "15° Aries 30'")
 */
export function formatPosition(position: SignPosition): string {
  return `${position.sign} ${position.degrees}° ${position.minutes}'`;
}