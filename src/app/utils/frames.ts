import { Frame } from '../types/photobooth';

const base = import.meta.env.BASE_URL;
const assetBase = base.endsWith('/') ? base.slice(0, -1) : base;

/** PNG frames in /public/frames — transparent photo opening, opaque border artwork. */
export function framePublicPng(name: string): string {
  return `${assetBase}/frames/${name}.png`;
}

/** Ratios & photo windows aligned to transparent holes (see scripts/detect-photo-holes.mjs). */
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
      x: 7.96,
      y: 8.9,
      width: 84.07,
      height: 72.9,
    },
  },
  {
    id: 'blue-bunting',
    name: { en: 'Blue Celebration', ar: 'احتفال أزرق' },
    imagePath: framePublicPng('blue-bunting'),
    ratio: 1080 / 1350,
    photoArea: {
      x: 7.96,
      y: 8.85,
      width: 84.07,
      height: 72.92,
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
      y: 8.2,
      width: 66.02,
      height: 80.2,
    },
  },
];

export interface RenderPhotoOptions {
  outputWidth?: number;
  /** Match live preview: front camera uses ~38% vertical object-position in Camera.tsx */
  previewFacingUser?: boolean;
}

/**
 * Export: solid white background → photo (cover in hole) → frame PNG on top. No text.
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
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const areaX = (frame.photoArea.x / 100) * canvas.width;
  const areaY = (frame.photoArea.y / 100) * canvas.height;
  const areaWidth = (frame.photoArea.width / 100) * canvas.width;
  const areaHeight = (frame.photoArea.height / 100) * canvas.height;

  const anchorY = options.previewFacingUser === true ? 0.38 : 0.5;
  drawImageCoverAnchored(ctx, photoImg, areaX, areaY, areaWidth, areaHeight, 0.5, anchorY);

  ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/png');
};

/** object-fit: cover with object-position (anchorX*100%, anchorY*100%) on image & box — matches CSS semantics. */
const drawImageCoverAnchored = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  anchorX: number,
  anchorY: number
) => {
  const scale = Math.max(width / img.width, height / img.height);
  const sw = img.width * scale;
  const sh = img.height * scale;
  const dx = x + width * anchorX - img.width * anchorX * scale;
  const dy = y + height * anchorY - img.height * anchorY * scale;
  ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, sw, sh);
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
