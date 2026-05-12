export const NEON_CYAN = '#00f5ff';
export const NEON_PURPLE = '#b347ea';
export const NEON_PINK = '#ff2d78';
export const NEON_GREEN = '#39ff14';
export const NEON_YELLOW = '#ffe600';
export const NEON_ORANGE = '#ff6b35';

export const SURFACE_0 = '#0a0a0f';
export const SURFACE_1 = '#12121a';
export const SURFACE_2 = '#1a1a26';
export const SURFACE_3 = '#222233';

export const COMPARE_COLOR = NEON_PINK;
export const SWAP_COLOR = NEON_YELLOW;
export const SORTED_COLOR = NEON_GREEN;
export const PIVOT_COLOR = NEON_PURPLE;
export const DEFAULT_BAR_COLOR = NEON_CYAN;
export const HIGHLIGHT_COLOR = NEON_ORANGE;
export const VISITED_COLOR = '#8b5cf6';
export const PATH_COLOR = NEON_GREEN;
export const CURRENT_COLOR = NEON_YELLOW;

export const GRADIENT_DARK = `linear-gradient(135deg, ${SURFACE_0}, ${SURFACE_1})`;
export const GRADIENT_NEON = `linear-gradient(135deg, ${NEON_CYAN}, ${NEON_PURPLE})`;
export const GRADIENT_WARM = `linear-gradient(135deg, ${NEON_PINK}, ${NEON_ORANGE})`;

export interface ThemeColors {
  bg: string;
  nodeFill: string;
  gridLine: string;
  emptyText: string;
}

export function getThemeColors(): ThemeColors {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  return {
    bg: isLight ? '#f5f5fa' : '#0a0a0f',
    nodeFill: isLight ? '#ffffff' : '#12121a',
    gridLine: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)',
    emptyText: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
  };
}

export function getBarColor(index: number, snapshot: {
  comparing: [number, number] | null;
  swapping: [number, number] | null;
  sorted: number[];
  pivot: number | null;
}): string {
  if (snapshot.comparing && snapshot.comparing.includes(index)) return COMPARE_COLOR;
  if (snapshot.swapping && snapshot.swapping.includes(index)) return SWAP_COLOR;
  if (snapshot.pivot === index) return PIVOT_COLOR;
  if (snapshot.sorted.includes(index)) return SORTED_COLOR;
  return DEFAULT_BAR_COLOR;
}

export function getNodeColor(
  visited: boolean,
  current: boolean,
  highlighted: boolean,
  inPath: boolean
): string {
  if (inPath) return PATH_COLOR;
  if (current) return CURRENT_COLOR;
  if (highlighted) return HIGHLIGHT_COLOR;
  if (visited) return VISITED_COLOR;
  return SURFACE_3;
}

export function lerpColor(a: string, b: string, t: number): string {
  const parseHex = (hex: string) => {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  };
  const ca = parseHex(a);
  const cb = parseHex(b);
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bl = Math.round(ca.b + (cb.b - ca.b) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}
