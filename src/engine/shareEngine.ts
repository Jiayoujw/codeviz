import type { AlgorithmType } from '../types';

interface ShareState {
  algorithm: AlgorithmType | '';
  code: string;
  step: number;
  speed: number;
  lang: string;
  theme: string;
}

export function encodeShare(state: ShareState): string {
  try {
    const json = JSON.stringify(state);
    const encoded = btoa(encodeURIComponent(json));
    const url = new URL(window.location.href);
    url.searchParams.set('s', encoded);
    return url.toString();
  } catch {
    return window.location.href;
  }
}

export function decodeShare(): ShareState | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('s');
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function copyShareUrl(state: ShareState): string {
  const url = encodeShare(state);
  navigator.clipboard.writeText(url).catch(() => {
    // fallback
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  });
  return url;
}
