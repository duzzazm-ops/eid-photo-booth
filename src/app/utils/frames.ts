import { Frame } from '../types/photobooth';

const base = import.meta.env.BASE_URL;
const assetBase = base.endsWith('/') ? base.slice(0, -1) : base;

/** PNG frames in /public/frames — replace with your real transparent PNGs (same filenames). */
export function framePublicPng(name: string): string {
  return `${assetBase}/frames/${name}.png`;
}

/** Ratios & photo windows tuned to PNGs in public/frames (detected from transparent holes). */
export const frames: Frame[] = [
  {
    id: 'film-landscape',
    name: { en: 'Classic Film', ar: 'فيلم كلاسيكي' },
    mode: 'single',
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
    mode: 'single',
    imagePath: framePublicPng('green-bunting'),
    ratio: 1080 / 1350,
    photoArea: {
      x: 7.96,
      y: 9.41,
      width: 84.07,
      height: 72.37,
    },
  },
  {
    id: 'blue-bunting',
    name: { en: 'Blue Celebration', ar: 'احتفال أزرق' },
    mode: 'single',
    imagePath: framePublicPng('blue-bunting'),
    ratio: 1080 / 1350,
    photoArea: {
      x: 7.96,
      y: 9.33,
      width: 84.07,
      height: 72.44,
    },
  },
  {
    id: 'white-decorative',
    name: { en: 'Elegant White', ar: 'أبيض أنيق' },
    mode: 'single',
    imagePath: framePublicPng('white-decorative'),
    ratio: 1280 / 720,
    photoArea: {
      x: 17.66,
      y: 8.47,
      width: 65.16,
      height: 73.33,
    },
  },
  {
    id: 'postage-stamp',
    name: { en: 'Postage Stamp', ar: 'طابع بريدي' },
    mode: 'single',
    imagePath: framePublicPng('postage-stamp'),
    ratio: 1280 / 720,
    photoArea: {
      x: 16.88,
      y: 8.47,
      width: 66.02,
      height: 80.42,
    },
  },
  {
    id: 'film-strip',
    name: { en: 'Photo Strip', ar: 'شريط الصور' },
    mode: 'strip',
    imagePath: framePublicPng('film-strip'),
    ratio: 1080 / 1920,
    photoArea: {
      x: 33.98,
      y: 5.99,
      width: 31.39,
      height: 88.03,
    },
    photoAreas: [
      { x: 33.98, y: 5.99, width: 31.39, height: 18.7 },
      { x: 34.07, y: 25.99, width: 31.3, height: 23.65 },
      { x: 33.98, y: 50.94, width: 31.39, height: 23.65 },
      { x: 34.07, y: 75.89, width: 31.3, height: 18.13 },
    ],
  },
];

interface RenderTextOptions {
  arabic: string;
  familyName: string;
  yearLabel: string;
}

interface RenderPhotoOptions {
  outputWidth?: number;
  text?: RenderTextOptions;
}

export const renderPhotoWithFrame = async (
  frame: Frame,
  photos: string[],
  options: RenderPhotoOptions = {}
): Promise<string> => {
  const outputWidth = options.outputWidth ?? 1200;
  const outputHeight = Math.round(outputWidth / frame.ratio);
  const frameImg = await loadImage(frame.imagePath);
  const photoImages = await Promise.all(photos.map((photoUrl) => loadImage(photoUrl)));

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  const areaX = (frame.photoArea.x / 100) * canvas.width;
  const areaY = (frame.photoArea.y / 100) * canvas.height;
  const areaWidth = (frame.photoArea.width / 100) * canvas.width;
  const areaHeight = (frame.photoArea.height / 100) * canvas.height;

  if (frame.mode === 'strip') {
    const stripAreas =
      frame.photoAreas?.length === 4
        ? frame.photoAreas.map((area) => ({
            x: (area.x / 100) * canvas.width,
            y: (area.y / 100) * canvas.height,
            width: (area.width / 100) * canvas.width,
            height: (area.height / 100) * canvas.height,
          }))
        : Array.from({ length: 4 }, (_, i) => ({
            x: areaX,
            y: areaY + (areaHeight / 4) * i,
            width: areaWidth,
            height: areaHeight / 4,
          }));

    for (let i = 0; i < 4; i++) {
      if (!photoImages[i]) continue;
      const target = stripAreas[i];
      drawImageCover(ctx, photoImages[i], target.x, target.y, target.width, target.height);
    }
  } else if (photoImages[0]) {
    drawImageCover(ctx, photoImages[0], areaX, areaY, areaWidth, areaHeight);
  }

  ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
  drawTextOverlay(ctx, canvas.width, canvas.height, options.text);
  return canvas.toDataURL('image/png');
};

const drawTextOverlay = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  text?: RenderTextOptions
) => {
  if (!text) return;

  const centerX = canvasWidth / 2;
  const baseY = canvasHeight * 0.9;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#FFFFFF';

  ctx.font = `700 ${Math.round(canvasWidth * 0.045)}px "Cairo", sans-serif`;
  ctx.fillText(text.arabic || 'عيد سعيد', centerX, baseY - canvasHeight * 0.08);

  ctx.font = `600 ${Math.round(canvasWidth * 0.03)}px "Inter", sans-serif`;
  ctx.fillText(text.familyName, centerX, baseY - canvasHeight * 0.04);

  ctx.font = `500 ${Math.round(canvasWidth * 0.028)}px "Inter", sans-serif`;
  ctx.fillText(text.yearLabel || 'Eid 2026', centerX, baseY);
  ctx.restore();
};

const drawImageCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const imgRatio = img.width / img.height;
  const areaRatio = width / height;

  let sx = 0;
  let sy = 0;
  let sWidth = img.width;
  let sHeight = img.height;

  if (imgRatio > areaRatio) {
    sWidth = img.height * areaRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / areaRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height);
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
