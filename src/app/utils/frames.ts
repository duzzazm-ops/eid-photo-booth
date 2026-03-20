import { Frame, PhotoArea } from '../types/photobooth';

const base = import.meta.env.BASE_URL;
const assetBase = base.endsWith('/') ? base.slice(0, -1) : base;

/** PNG frames in /public/frames — transparent photo opening, opaque border artwork. */
export function framePublicPng(name: string): string {
  return `${assetBase}/frames/${name}.png`;
}

/** Ratios & photo windows (see scripts/detect-photo-holes.mjs). */
export const frames: Frame[] = [
  {
    id: 'film-landscape',
    name: { en: 'Classic Film', ar: 'فيلم كلاسيكي' },
    imagePath: framePublicPng('film-landscape'),
    ratio: 1,
    photoArea: {
      x: 13.8,
      y: 7.96,
      width: 72.5,
      height: 84.07,
    },
  },
  {
    id: 'green-bunting',
    name: { en: 'Green Celebration', ar: 'احتفال أخضر' },
    imagePath: framePublicPng('green-bunting'),
    ratio: 1080 / 1350,
    photoArea: {
      x: 10.06,
      y: 11.22,
      width: 79.87,
      height: 68.75,
    },
  },
  {
    id: 'blue-bunting',
    name: { en: 'Blue Celebration', ar: 'احتفال أزرق' },
    imagePath: framePublicPng('blue-bunting'),
    ratio: 1080 / 1350,
    photoArea: {
      x: 10.06,
      y: 11.14,
      width: 79.87,
      height: 68.82,
    },
  },
  {
    id: 'white-decorative',
    name: { en: 'Elegant White', ar: 'أبيض أنيق' },
    imagePath: framePublicPng('white-decorative'),
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
    ratio: 1280 / 720,
    photoArea: {
      x: 16.88,
      y: 8.47,
      width: 66.02,
      height: 80.42,
    },
  },
];

/** Shrink photo window so content stays inside decorative borders (per edge, 0–0.5). */
const PHOTO_BBOX_INSET = 0.04;

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
 * Uses contain + clip so bitmap never spills past the window; masks to real PNG transparency.
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

  const inset = insetPhotoArea(frame.photoArea, PHOTO_BBOX_INSET);
  const areaX = (inset.x / 100) * canvas.width;
  const areaY = (inset.y / 100) * canvas.height;
  const areaWidth = (inset.width / 100) * canvas.width;
  const areaHeight = (inset.height / 100) * canvas.height;

  const anchorY = options.previewFacingUser === true ? 0.38 : 0.5;

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
  drawImageContainAnchored(pctx, photoImg, areaX, areaY, areaWidth, areaHeight, 0.5, anchorY);
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

  return canvas.toDataURL('image/png');
};

/** object-fit: contain — entire image visible inside box; letterboxing stays white inside clip. */
function drawImageContainAnchored(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  anchorX: number,
  anchorY: number
) {
  const scale = Math.min(width / img.width, height / img.height);
  const sw = img.width * scale;
  const sh = img.height * scale;
  const dx = x + width * anchorX - img.width * anchorX * scale;
  const dy = y + height * anchorY - img.height * anchorY * scale;
  ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, sw, sh);
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
