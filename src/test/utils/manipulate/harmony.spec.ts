import { describe, expect, test } from 'vitest';
import { getHarmonize } from '@/utils/manipulate/harmony';

describe('getHarmonize', () => {
  const hsb = [0,0,0];
  test('analogous', () => {
    const analogous = getHarmonize('analogous')(hsb);
    expect(analogous).toContainEqual(hsb);
    expect(analogous).toContainEqual([30,0,0]);
    expect(analogous).toContainEqual([330,0,0]);
  });
  test('triad', () => {
    const analogous = getHarmonize('triad')(hsb);
    expect(analogous).toContainEqual(hsb);
    expect(analogous).toContainEqual([120,0,0]);
    expect(analogous).toContainEqual([240,0,0]);
  });
  test('complement', () => {
    const analogous = getHarmonize('complement')(hsb);
    expect(analogous).toContainEqual(hsb);
    expect(analogous).toContainEqual([180,0,0]);
  });
  test('split complement', () => {
    const analogous = getHarmonize('split complement')(hsb);
    expect(analogous).toContainEqual(hsb);
    expect(analogous).toContainEqual([150,0,0]);
    expect(analogous).toContainEqual([210,0,0]);
  });
  test('tetrad', () => {
    const analogous = getHarmonize('tetrad')(hsb);
    expect(analogous).toContainEqual(hsb);
    expect(analogous).toContainEqual([30,0,0]);
    expect(analogous).toContainEqual([180,0,0]);
    expect(analogous).toContainEqual([210,0,0]);
  });
  test('square', () => {
    const analogous = getHarmonize('square')(hsb);
    expect(analogous).toContainEqual(hsb);
    expect(analogous).toContainEqual([90,0,0]);
    expect(analogous).toContainEqual([180,0,0]);
    expect(analogous).toContainEqual([270,0,0]);
  });
  test('compound', () => {
    const analogous = getHarmonize('compound')(hsb);
    expect(analogous).toContainEqual(hsb);
    expect(analogous).toContainEqual([30,0,0]);
    expect(analogous).toContainEqual([180,0,0]);
    expect(analogous).toContainEqual([150,0,0]);
  });
  const hsb2 = [0,100,100];
  test('shades', () => {
    const analogous = getHarmonize('shades')(hsb2, 2);
    expect(analogous).toContainEqual(hsb2);
    expect(analogous).toContainEqual([0,100,50]);
  });
  test('tints', () => {
    const analogous = getHarmonize('tints')(hsb2, 2);
    expect(analogous).toContainEqual(hsb2);
    expect(analogous).toContainEqual([0,50,100]);
  });
  test('tones', () => {
    const analogous = getHarmonize('tones')(hsb2, 2);
    expect(analogous).toContainEqual(hsb2);
    expect(analogous).toContainEqual([0,50,50]);
  });
});
