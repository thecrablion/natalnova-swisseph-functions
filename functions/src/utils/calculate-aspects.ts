import {Aspect} from '../types/chart.types';

interface AspectDefinition {
  angle: number;
  baseOrb: number;
}

const ASPECT_DEFINITIONS: Record<string, AspectDefinition> = {
  Conjunction: {angle: 0, baseOrb: 9.0},
  Opposition: {angle: 180, baseOrb: 9.0},
  Trine: {angle: 120, baseOrb: 9.0},
  Square: {angle: 90, baseOrb: 9.0},
  Sextile: {angle: 60, baseOrb: 6.0},
  Quincunx: {angle: 150, baseOrb: 3.0},
  Sesquiquadrate: {angle: 135, baseOrb: 3.0},
  Semisquare: {angle: 45, baseOrb: 3.0},
  Semisextile: {angle: 30, baseOrb: 3.0},
};

const MAJOR_ASPECT_ORB = 9.0;
const LUMINARY_BONUS = 3.0;
const LUMINARIES = ['Sun', 'Moon'];

/**
 * Calculates all aspects between celestial bodies
 * @param positions - Object with planet names as keys and positions as values
 * @returns Array of aspects found
 */
export function calculateAspects(
  positions: Record<string, number>
): Aspect[] {
  const planets = Object.keys(positions);
  const aspects: Aspect[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      const pos1 = positions[planet1];
      const pos2 = positions[planet2];

      if (pos1 === undefined || pos2 === undefined) continue;

      let difference = Math.abs(pos1 - pos2);
      difference = Math.min(difference, 360 - difference);

      for (const [aspectName, aspectDef] of Object.entries(
        ASPECT_DEFINITIONS
      )) {
        let currentOrb = aspectDef.baseOrb;

        const hasLuminary =
          LUMINARIES.includes(planet1) || LUMINARIES.includes(planet2);
        const isMajorAspect = aspectDef.baseOrb === MAJOR_ASPECT_ORB;

        if (hasLuminary && isMajorAspect) {
          currentOrb += LUMINARY_BONUS;
        }

        const orbValue = Math.abs(difference - aspectDef.angle);

        if (orbValue <= currentOrb) {
          aspects.push({
            planet1,
            aspectType: aspectName,
            planet2,
            orb: parseFloat(orbValue.toFixed(2)),
            fullDescription: `${planet1} ${aspectName} ${planet2} (Orb: ${orbValue.toFixed(2)}°)`,
          });
        }
      }
    }
  }

  return aspects;
}