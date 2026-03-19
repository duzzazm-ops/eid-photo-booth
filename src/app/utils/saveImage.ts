/**
 * Cross-browser save / share for PNG data URLs (iOS Safari, Chrome Android, desktop).
 * iOS Safari often ignores <a download>; we open a blob URL + show save instructions.
 */

export type SavePhotoResult = {
  method: 'share' | 'download' | 'opened_tab';
  /** Show helper sheet for Apple mobile browsers after opening image */
  showIosSaveHint: boolean;
  /** Object URL for a manual "tap to open" link if pop-ups are blocked */
  tapToOpenHref?: string;
};

export function isAppleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (typeof navigator.platform === 'string' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** Mobile Safari / WebKit on iPhone & iPad (not Chrome/Firefox/Edge on iOS). */
export function isLikelyMobileSafari(): boolean {
  if (!isAppleTouchDevice()) return false;
  const ua = navigator.userAgent;
  if (/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)) return false;
  const isiDevice = /iPhone|iPod|iPad/.test(ua);
  const isTouchMac =
    typeof navigator.platform === 'string' &&
    navigator.platform === 'MacIntel' &&
    navigator.maxTouchPoints > 1;
  return /\bSafari\b/.test(ua) && !/\bChrome\b|Chromium/.test(ua) && (isiDevice || isTouchMac);
}

function dataUrlToBlobFallback(dataUrl: string): Blob | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  try {
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime || 'image/png' });
  } catch {
    return null;
  }
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob | null> {
  try {
    const res = await fetch(dataUrl);
    return await res.blob();
  } catch {
    return dataUrlToBlobFallback(dataUrl);
  }
}

function triggerDownload(objectUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Save or share the final photo. On iOS Safari may open a new tab and require user to Save Image.
 */
export async function savePhotoToDevice(options: {
  dataUrl: string;
  filename: string;
  title?: string;
}): Promise<SavePhotoResult> {
  const { dataUrl, filename, title = 'Eid photo' } = options;

  const blob = await dataUrlToBlob(dataUrl);
  if (!blob) {
    return { method: 'opened_tab', showIosSaveHint: false, tapToOpenHref: dataUrl };
  }

  const file = new File([blob], filename, { type: 'image/png' });

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text: title });
        return { method: 'share', showIosSaveHint: false };
      }
    } catch (err) {
      const name = err instanceof DOMException ? err.name : (err as Error)?.name;
      if (name === 'AbortError') return { method: 'share', showIosSaveHint: false };
    }
  }

  const appleMobile = isAppleTouchDevice();
  const safariish = isLikelyMobileSafari();

  const objectUrl = URL.createObjectURL(blob);

  // iOS Safari: <a download> is unreliable — open image so user can Share → Save Image / long-press.
  if (safariish) {
    const newWin = window.open(objectUrl, '_blank', 'noopener,noreferrer');
    if (newWin) {
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
      return { method: 'opened_tab', showIosSaveHint: true };
    }
    return { method: 'opened_tab', showIosSaveHint: true, tapToOpenHref: objectUrl };
  }

  try {
    triggerDownload(objectUrl, filename);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return { method: 'download', showIosSaveHint: false };
  } catch {
    const w = window.open(objectUrl, '_blank', 'noopener,noreferrer');
    if (w) {
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
      return { method: 'opened_tab', showIosSaveHint: appleMobile };
    }
    return { method: 'opened_tab', showIosSaveHint: appleMobile, tapToOpenHref: objectUrl };
  }
}
