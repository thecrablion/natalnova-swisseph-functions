import {degreeToSign, formatPosition} from '../src/utils/degree-to-sign';

describe('degreeToSign', () => {
  test('converts 0° to Aries', () => {
    const result = degreeToSign(0);
    expect(result.sign).toBe('Aries');
    expect(result.degrees).toBe(0);
    expect(result.minutes).toBe(0);
  });

  test('converts 30° to Taurus', () => {
    const result = degreeToSign(30);
    expect(result.sign).toBe('Taurus');
    expect(result.degrees).toBe(0);
  });

  test('converts 45.5° to Taurus 15° 30\'', () => {
    const result = degreeToSign(45.5);
    expect(result.sign).toBe('Taurus');
    expect(result.degrees).toBe(15);
    expect(result.minutes).toBe(30);
  });

  test('converts 359° to Pisces', () => {
    const result = degreeToSign(359);
    expect(result.sign).toBe('Pisces');
    expect(result.degrees).toBe(29);
  });

  test('handles negative degrees', () => {
    const result = degreeToSign(-30);
    expect(result.sign).toBe('Aquarius');
  });

  test('handles degrees over 360', () => {
    const result = degreeToSign(390);
    expect(result.sign).toBe('Taurus');
    expect(result.degrees).toBe(0);
  });
});

describe('formatPosition', () => {
  test('formats position correctly', () => {
    const position = {sign: 'Aries', degrees: 15, minutes: 30};
    expect(formatPosition(position)).toBe("15° Aries 30'");
  });
});