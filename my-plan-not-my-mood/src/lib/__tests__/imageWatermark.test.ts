import { describe, expect, it } from 'vitest';
import {
  MUNTIES_WATERMARK_PATH,
  muntiesWatermarkUrl,
  shouldWatermarkThumb,
} from '../imageWatermark';

describe('imageWatermark', () => {
  it('uses the Munties logo on large previews only', () => {
    expect(MUNTIES_WATERMARK_PATH).toBe('/images/munties_ai_agents_logo.png');
    expect(muntiesWatermarkUrl('https://nonnegotiation.com')).toBe(
      'https://nonnegotiation.com/images/munties_ai_agents_logo.png',
    );
    expect(shouldWatermarkThumb('xs')).toBe(false);
    expect(shouldWatermarkThumb('sm')).toBe(false);
    expect(shouldWatermarkThumb('md')).toBe(true);
    expect(shouldWatermarkThumb('lg')).toBe(true);
    expect(shouldWatermarkThumb('xs', true)).toBe(true);
  });
});
