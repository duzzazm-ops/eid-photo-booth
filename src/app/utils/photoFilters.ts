import { FilterType } from '../types/photobooth';

/**
 * CSS approximate match for live `<video>` preview (export uses pixel `applyFilter`).
 */
export function previewFilterCss(filter: FilterType): string {
  switch (filter) {
    case 'soft':
      return 'brightness(1.1) contrast(0.94) saturate(1.12)';
    case 'bw':
      return 'grayscale(1) contrast(1.12) brightness(1.02)';
    case 'warm':
      return 'sepia(0.28) saturate(1.45) hue-rotate(-8deg) brightness(1.06)';
    case 'vintage':
      return 'sepia(0.55) contrast(1.12) brightness(0.9) saturate(0.82)';
    case 'cool':
      return 'saturate(1.2) hue-rotate(18deg) brightness(1.04) contrast(0.97)';
    case 'none':
    default:
      return 'none';
  }
}

export const applyFilter = (
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  filter: FilterType
): ImageData => {
  const data = imageData.data;

  switch (filter) {
    case 'soft':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.16);
        data[i + 1] = Math.min(255, data[i + 1] * 1.14);
        data[i + 2] = Math.min(255, data[i + 2] * 1.12);
      }
      break;

    case 'bw':
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        const g = Math.min(255, gray * 1.05);
        data[i] = g;
        data[i + 1] = g;
        data[i + 2] = g;
      }
      break;

    case 'warm':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.28);
        data[i + 1] = Math.min(255, data[i + 1] * 1.08);
        data[i + 2] = Math.max(0, data[i + 2] * 0.82);
      }
      break;

    case 'vintage':
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      }
      break;

    case 'cool':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, data[i] * 0.82);
        data[i + 1] = Math.min(255, data[i + 1] * 1.08);
        data[i + 2] = Math.min(255, data[i + 2] * 1.28);
      }
      break;

    case 'none':
    default:
      break;
  }

  return imageData;
};
