import { Frame } from '../types/photobooth';
import filmStripFrame from '@/assets/frames/film-strip.svg';
import filmLandscapeFrame from '@/assets/frames/film-landscape.svg';
import greenBuntingFrame from '@/assets/frames/green-bunting.svg';
import blueBuntingFrame from '@/assets/frames/blue-bunting.svg';
import whiteDecorativeFrame from '@/assets/frames/white-decorative.svg';
import postageStampFrame from '@/assets/frames/postage-stamp.svg';

export const frames: Frame[] = [
  // Single photo frames
  {
    id: 'film-landscape',
    name: { en: 'Classic Film', ar: 'فيلم كلاسيكي' },
    mode: 'single',
    imagePath: filmLandscapeFrame,
    ratio: 3 / 4,
    photoArea: {
      x: 12,
      y: 12,
      width: 76,
      height: 76
    }
  },
  {
    id: 'green-bunting',
    name: { en: 'Green Celebration', ar: 'احتفال أخضر' },
    mode: 'single',
    imagePath: greenBuntingFrame,
    ratio: 3 / 4,
    photoArea: {
      x: 4,
      y: 6,
      width: 92,
      height: 83
    }
  },
  {
    id: 'blue-bunting',
    name: { en: 'Blue Celebration', ar: 'احتفال أزرق' },
    mode: 'single',
    imagePath: blueBuntingFrame,
    ratio: 3 / 4,
    photoArea: {
      x: 4,
      y: 6,
      width: 92,
      height: 83
    }
  },
  {
    id: 'white-decorative',
    name: { en: 'Elegant White', ar: 'أبيض أنيق' },
    mode: 'single',
    imagePath: whiteDecorativeFrame,
    ratio: 3 / 4,
    photoArea: {
      x: 8,
      y: 6,
      width: 84,
      height: 74
    }
  },
  {
    id: 'postage-stamp',
    name: { en: 'Postage Stamp', ar: 'طابع بريدي' },
    mode: 'single',
    imagePath: postageStampFrame,
    ratio: 3 / 4,
    photoArea: {
      x: 6,
      y: 6,
      width: 88,
      height: 72
    }
  },
  // Strip mode frame
  {
    id: 'film-strip',
    name: { en: 'Photo Strip', ar: 'شريط الصور' },
    mode: 'strip',
    imagePath: filmStripFrame,
    ratio: 3 / 4,
    photoArea: {
      x: 15,
      y: 15,
      width: 70,
      height: 70
    },
    photoAreas: [
      { x: 15, y: 15, width: 70, height: 17.5 },
      { x: 15, y: 32.5, width: 70, height: 17.5 },
      { x: 15, y: 50, width: 70, height: 17.5 },
      { x: 15, y: 67.5, width: 70, height: 17.5 }
    ],
  }
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

// Helper function to render photo with frame
export const renderPhotoWithFrame = async (
  frame: Frame,
  photos: string[], // Array of photo data URLs
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
      drawImageCover(
        ctx,
        photoImages[i],
        target.x,
        target.y,
        target.width,
        target.height
      );
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

// Helper to draw image with cover behavior (like CSS object-fit: cover)
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
    // Image is wider than area - crop sides
    sWidth = img.height * areaRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    // Image is taller than area - crop top/bottom
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