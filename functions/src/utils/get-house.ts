/**
 * Determines which astrological house a position falls into
 * @param position - Ecliptic longitude in degrees
 * @param houseCusps - Array of 12 house cusp positions
 * @returns House number (1-12)
 */
export function getHouse(position: number, houseCusps: number[]): number {
  if (!houseCusps || houseCusps.length !== 12) {
    return 1;
  }

  const normalizedPosition = ((position % 360) + 360) % 360;

  for (let i = 0; i < 12; i++) {
    const currentCusp = houseCusps[i];
    const nextCusp = houseCusps[(i + 1) % 12];

    if (nextCusp < currentCusp) {
      if (normalizedPosition >= currentCusp || normalizedPosition < nextCusp) {
        return i + 1;
      }
    } else {
      if (
        normalizedPosition >= currentCusp &&
        normalizedPosition < nextCusp
      ) {
        return i + 1;
      }
    }
  }

  return 12;
}