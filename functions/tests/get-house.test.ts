import {getHouse} from '../src/utils/get-house';

describe('getHouse', () => {
  const mockHouseCusps = [
    0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330,
  ];

  test('returns house 1 for position at 0°', () => {
    expect(getHouse(0, mockHouseCusps)).toBe(1);
  });

  test('returns house 2 for position at 45°', () => {
    expect(getHouse(45, mockHouseCusps)).toBe(2);
  });

  test('returns house 7 for position at 180°', () => {
    expect(getHouse(180, mockHouseCusps)).toBe(7);
  });

  test('handles position near cusp boundary', () => {
    expect(getHouse(29.9, mockHouseCusps)).toBe(1);
    expect(getHouse(30.1, mockHouseCusps)).toBe(2);
  });

  test('returns 1 if houseCusps is invalid', () => {
    expect(getHouse(100, [])).toBe(1);
  });

  test('handles 12th house wraparound', () => {
    expect(getHouse(359, mockHouseCusps)).toBe(12);
  });
});