import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PAGE_CANVAS_HEX } from '../brandUi';
import { WELCOME_VIDEO_FRAME_FILL, WELCOME_VIDEO_PATH, WELCOME_VIDEO_POSTER } from '../welcomeVideo';

describe('welcomeVideo', () => {
  it('points at the compressed About/home welcome clip', () => {
    expect(WELCOME_VIDEO_PATH).toBe('/videos/welcome-about.mp4');
    expect(WELCOME_VIDEO_POSTER).toBe('/images/welcome-about-poster.jpg');
    expect(existsSync(resolve(process.cwd(), 'public/videos/welcome-about.mp4'))).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'public/images/welcome-about-poster.jpg'))).toBe(true);
  });

  it('fills the player frame with the page cream', () => {
    expect(WELCOME_VIDEO_FRAME_FILL).toBe(PAGE_CANVAS_HEX);
    expect(WELCOME_VIDEO_FRAME_FILL).toBe('#F6F0E6');
    const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
    expect(css).toMatch(/\.welcome-video-shell\s*\{[^}]*background:\s*#F6F0E6/s);
    expect(css).toMatch(/\.welcome-video\s*\{[^}]*background-color:\s*#F6F0E6/s);
    const source = readFileSync(resolve(process.cwd(), 'src/components/WelcomeVideo.tsx'), 'utf8');
    expect(source).toContain('WELCOME_VIDEO_FRAME_FILL');
  });
});
