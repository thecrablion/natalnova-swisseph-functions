import {calculateAspects} from '../src/utils/calculate-aspects';

describe('calculateAspects', () => {
  test('finds conjunction aspect', () => {
    const positions = {
      Sun: 0,
      Moon: 5,
    };

    const aspects = calculateAspects(positions);
    const conjunction = aspects.find((a) => a.aspectType === 'Conjunction');

    expect(conjunction).toBeDefined();
    expect(conjunction?.planet1).toBe('Sun');
    expect(conjunction?.planet2).toBe('Moon');
    expect(conjunction?.orb).toBe(5);
  });

  test('finds opposition aspect', () => {
    const positions = {
      Sun: 0,
      Moon: 180,
    };

    const aspects = calculateAspects(positions);
    const opposition = aspects.find((a) => a.aspectType === 'Opposition');

    expect(opposition).toBeDefined();
  });

  test('finds trine aspect', () => {
    const positions = {
      Sun: 0,
      Jupiter: 120,
    };

    const aspects = calculateAspects(positions);
    const trine = aspects.find((a) => a.aspectType === 'Trine');

    expect(trine).toBeDefined();
  });

  test('does not find aspect when orb is too wide', () => {
    const positions = {
      Sun: 0,
      Mars: 50,
    };

    const aspects = calculateAspects(positions);
    expect(aspects.length).toBe(0);
  });

  test('applies luminary bonus to major aspects', () => {
    const positions = {
      Sun: 0,
      Moon: 13,
    };

    const aspects = calculateAspects(positions);
    expect(aspects.length).toBeGreaterThan(0);
  });

  test('handles multiple aspects between bodies', () => {
    const positions = {
      Sun: 0,
      Moon: 90,
      Mars: 180,
    };

    const aspects = calculateAspects(positions);
    expect(aspects.length).toBeGreaterThan(2);
  });
});