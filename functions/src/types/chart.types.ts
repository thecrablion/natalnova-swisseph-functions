export interface BirthDataInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  placeId: string;
}

export interface GeographicData {
  latitude: number;
  longitude: number;
  timezoneUtc: number;
  julianDayUtc: number;
  latitudeFormatted: string;
  longitudeFormatted: string;
  timezoneFormatted: string;
}

export interface LocalDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  formattedDate: string;
  formattedTime: string;
}

export interface ChartInfo {
  localDate: LocalDateTime;
  location: GeographicData;
}

export interface PlanetaryPosition {
  eclipticLongitude: number;
  sign: string;
  degreesInSign: number;
  minutesInSign: number;
  house: number;
  formattedPosition: string;
  formattedHouse: string;
}

export interface HouseCusp {
  houseNumber: number;
  eclipticLongitude: number;
  sign: string;
  degreesInSign: number;
  minutesInSign: number;
  formattedPosition: string;
}

export interface Aspect {
  planet1: string;
  aspectType: string;
  planet2: string;
  orb: number;
  fullDescription: string;
}

export interface NatalChart {
  chartInfo: ChartInfo;
  planetaryPositions: Record<string, PlanetaryPosition>;
  houseCusps: HouseCusp[];
  aspects: Aspect[];
  houseSystem: string;
  zodiacType: string;
}

export interface CalculationError {
  code: string;
  message: string;
}