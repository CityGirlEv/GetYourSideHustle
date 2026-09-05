import { describe, it, expect } from 'vitest';
import { formatColorAll, hexToRgb, rgbToHsl, rgbToCmyk } from '../utils/color-converter.js';

describe('Color Converter Utility', () => {
  it('converts Hex to RGB correctly', () => {
    const { r, g, b } = hexToRgb('#1E3A8A');
    expect(r).toBe(30);
    expect(g).toBe(58);
    expect(b).toBe(138);
  });

  it('converts RGB to HSL correctly', () => {
    const { h, s, l } = rgbToHsl(30, 58, 138);
    expect(h).toBe(224);
    expect(s).toBe(64);
    expect(l).toBe(33);
  });

  it('converts RGB to CMYK correctly', () => {
    const { c, m, y, k } = rgbToCmyk(30, 58, 138);
    expect(c).toBe(78);
    expect(m).toBe(58);
    expect(y).toBe(0);
    expect(k).toBe(46);
  });

  it('generates all color formats (HEX, RGB, HSL, CMYK) in one object', () => {
    const color = formatColorAll('#FACC15', 'Coach Duke Yellow');
    expect(color.hex).toBe('#FACC15');
    expect(color.rgb).toBe('rgb(250, 204, 21)');
    expect(color.hsl).toBe('hsl(48, 96%, 53%)');
    expect(color.cmyk).toBe('cmyk(0%, 18%, 92%, 2%)');
  });
});
