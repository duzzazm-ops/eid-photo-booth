import { Frame, PhotoArea } from '../types/photobooth';

const base = import.meta.env.BASE_URL;
const assetBase = base.endsWith('/') ? base.slice(0, -1) : base;

/** PNG frames in /public/frames — transparent photo opening, opaque border artwork. */
export function framePublicPng(name: string): string {
  return `${assetBase}/frames/${name}.png`;
}

export function frameRequiresLandscapeCapture(frame: Frame): boolean {
  return frame.orientation === 'landscape';
}

/** Ratios & photo windows (see scripts/detect-photo-holes.mjs). */
export const frames: Frame[] = [
  {
    id: 'green-bunting',
    name: { en: 'Green Celebration', ar: 'احتفال أخضر' },
    imagePath: framePublicPng('green-bunting'),
    orientation: 'portrait',
    ratio: 1080 / 1350,
    /** Larger opening: photo + white mat fill more of the frame hole (inside transparent area). */
    photoBBoxInset: 0.015,
    photoArea: {
      x: 4.75,
      y: 6.85,
      width: 90.5,
      height: 79.25,
    },
  },
  {
    id: 'blue-bunting',
    name: { en: 'Blue Celebration', ar: 'احتفال أزرق' },
    imagePath: framePublicPng('blue-bunting'),
    orientation: 'portrait',
    ratio: 1080 / 1350,
    photoBBoxInset: 0.015,
    photoArea: {
      x: 4.75,
      y: 6.78,
      width: 90.5,
      height: 79.32,
    },
  },
  {
    id: 'white-decorative',
    name: { en: 'Elegant White', ar: 'أبيض أنيق' },
    imagePath: framePublicPng('white-decorative'),
    orientation: 'landscape',
    ratio: 1280 / 720,
    photoArea: {
      x: 17.66,
      y: 8.1,
      width: 65.16,
      height: 73.8,
    },
  },
  {
    id: 'postage-stamp',
    name: { en: 'Postage Stamp', ar: 'طابع بريدي' },
    imagePath: framePublicPng('postage-stamp'),
    orientation: 'landscape',
    ratio: 1280 / 720,
    photoArea: {
      x: 16.88,
      y: 8.47,
      width: 66.02,
      height: 80.42,
    },
  },
];

/** Default shrink inside photoArea so content stays inside decorative borders (per edge, 0–0.5). */
const DEFAULT_PHOTO_BBOX_INSET = 0.04;

/** Pixels with frame alpha below this count as “hole” (show photo). */
const HOLE_ALPHA_THRESHOLD = 140;

function insetPhotoArea(area: PhotoArea, edgeFrac: number): PhotoArea {
  const e = Math.min(0.2, Math.max(0, edgeFrac));
  const nx = area.x + area.width * e;
  const ny = area.y + area.height * e;
  const nw = area.width * (1 - 2 * e);
  const nh = area.height * (1 - 2 * e);
  return {
    x: nx,
    y: ny,
    width: Math.max(1, nw),
    height: Math.max(1, nh),
  };
}

export interface RenderPhotoOptions {
  outputWidth?: number;
  /** Front-camera captures use a higher focal point when composing into the hole */
  previewFacingUser?: boolean;
}

/**
 * Export: white matte → photo only inside (hole ∩ inset bbox), full frame on top.
 * Photo uses cover (Math.max scale) + clip — cropping allowed, no stretch; alpha-hole mask clips spill.
 * Final PNG is opaque on white (toDataURL); same path on all devices.
 */
export const renderPhotoWithFrame = async (
  frame: Frame,
  photos: string[],
  options: RenderPhotoOptions = {}
): Promise<string> => {
  const outputWidth = options.outputWidth ?? 1200;
  const outputHeight = Math.round(outputWidth / frame.ratio);
  const frameImg = await loadImage(frame.imagePath);
  const first = photos[0];
  if (!first) {
    throw new Error('No photo to render');
  }
  const photoImg = await loadImage(first);

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  const insetFrac = frame.photoBBoxInset ?? DEFAULT_PHOTO_BBOX_INSET;
  const inset = insetPhotoArea(frame.photoArea, insetFrac);
  const areaX = (inset.x / 100) * canvas.width;
  const areaY = (inset.y / 100) * canvas.height;
  const areaWidth = (inset.width / 100) * canvas.width;
  const areaHeight = (inset.height / 100) * canvas.height;

  const tune = frame.renderTune;
  const sourceExpand = tune?.coverSourceExpand ?? 1;
  let anchorX = 0.5;
  let anchorY = options.previewFacingUser === true ? 0.38 : 0.5;
  if (tune?.anchorX != null) anchorX = tune.anchorX;
  if (tune?.anchorY != null) anchorY = tune.anchorY;

  const photoLayer = document.createElement('canvas');
  photoLayer.width = outputWidth;
  photoLayer.height = outputHeight;
  const pctx = photoLayer.getContext('2d');
  if (!pctx) {
    throw new Error('Photo layer context not available');
  }
  pctx.fillStyle = '#FFFFFF';
  pctx.fillRect(0, 0, outputWidth, outputHeight);
  pctx.save();
  pctx.beginPath();
  pctx.rect(areaX, areaY, areaWidth, areaHeight);
  pctx.clip();
  drawImageCoverAnchored(
    pctx,
    photoImg,
    areaX,
    areaY,
    areaWidth,
    areaHeight,
    anchorX,
    anchorY,
    sourceExpand
  );
  pctx.restore();

  const frameScratch = document.createElement('canvas');
  frameScratch.width = outputWidth;
  frameScratch.height = outputHeight;
  const fctx = frameScratch.getContext('2d');
  if (!fctx) {
    throw new Error('Frame scratch context not available');
  }
  fctx.drawImage(frameImg, 0, 0, outputWidth, outputHeight);
  const frameData = fctx.getImageData(0, 0, outputWidth, outputHeight);
  const photoData = pctx.getImageData(0, 0, outputWidth, outputHeight);
  const out = ctx.createImageData(outputWidth, outputHeight);
  const fd = frameData.data;
  const pd = photoData.data;
  const od = out.data;
  const x0 = Math.floor(areaX);
  const y0 = Math.floor(areaY);
  const x1 = Math.ceil(areaX + areaWidth);
  const y1 = Math.ceil(areaY + areaHeight);

  for (let y = 0; y < outputHeight; y++) {
    for (let x = 0; x < outputWidth; x++) {
      const i = (y * outputWidth + x) * 4;
      const inBbox = x >= x0 && x < x1 && y >= y0 && y < y1;
      const inHole = fd[i + 3] < HOLE_ALPHA_THRESHOLD;
      if (inHole && inBbox) {
        od[i] = pd[i];
        od[i + 1] = pd[i + 1];
        od[i + 2] = pd[i + 2];
        od[i + 3] = 255;
      } else {
        od[i] = 255;
        od[i + 1] = 255;
        od[i + 2] = 255;
        od[i + 3] = 255;
      }
    }
  }

  ctx.putImageData(out, 0, 0);
  ctx.drawImage(frameImg, 0, 0, outputWidth, outputHeight);

  // Flatten any residual alpha (e.g. soft frame edges) onto white — fully opaque output
  const flat = ctx.getImageData(0, 0, outputWidth, outputHeight);
  const d = flat.data;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] / 255;
    if (a < 1) {
      d[i] = Math.round(d[i] * a + 255 * (1 - a));
      d[i + 1] = Math.round(d[i + 1] * a + 255 * (1 - a));
      d[i + 2] = Math.round(d[i + 2] * a + 255 * (1 - a));
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(flat, 0, 0);

  return canvas.toDataURL('image/png');
};

/**
 * object-fit: cover into dest (x,y,w,h) via source crop — uniform scale, no stretch.
 * sourceExpand > 1 widens the source window (more FOV) before mapping to the same dest.
 */
function drawImageCoverAnchored(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  anchorX: number,
  anchorY: number,
  sourceExpand = 1
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (iw <= 0 || ih <= 0) return;

  const boxRatio = width / height;
  const imgRatio = iw / ih;
  let sw: number;
  let sh: number;
  if (imgRatio > boxRatio) {
    sh = ih;
    sw = ih * boxRatio;
  } else {
    sw = iw;
    sh = iw / boxRatio;
  }

  if (sourceExpand > 1) {
    sw = Math.min(iw, sw * sourceExpand);
    sh = Math.min(ih, sh * sourceExpand);
  }

  const focalX = iw * anchorX;
  const focalY = ih * anchorY;
  let sx = focalX - sw / 2;
  let sy = focalY - sh / 2;
  sx = Math.max(0, Math.min(sx, iw - sw));
  sy = Math.max(0, Math.min(sy, ih - sh));

  ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height);
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
