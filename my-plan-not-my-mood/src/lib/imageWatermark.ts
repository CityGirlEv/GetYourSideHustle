export const MUNTIES_WATERMARK_PATH = '/images/munties_ai_agents_logo.png';
export const MUNTIES_WATERMARK_LABEL = 'Munties AI Agents';
export const MUNTIES_WATERMARK_OPACITY = 0.16;

export function muntiesWatermarkUrl(origin = ''): string {
  return `${String(origin).replace(/\/$/, '')}${MUNTIES_WATERMARK_PATH}`;
}

export function shouldWatermarkThumb(size: 'xs' | 'sm' | 'md' | 'lg', fill = false): boolean {
  return fill || size === 'md' || size === 'lg';
}
