import { FilterType } from '../types/photobooth';

export const applyFilter = (
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  filter: FilterType
): ImageData => {
  const data = imageData.data;

  switch (filter) {
    case 'soft':
      // Soft, slightly brighter
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.1);
        data[i + 1] = Math.min(255, data[i + 1] * 1.1);
        data[i + 2] = Math.min(255, data[i + 2] * 1.1);
      }
      break;

    case 'bw':
      // Black and white
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      break;

    case 'warm':
      // Warm tones
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.2); // More red
        data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Slight green
        data[i + 2] = data[i + 2] * 0.9; // Less blue
      }
      break;

    case 'vintage':
      // Vintage/sepia
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
      // Cool tones
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * 0.9; // Less red
        data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Slight green
        data[i + 2] = Math.min(255, data[i + 2] * 1.2); // More blue
      }
      break;

    case 'none':
    default:
      // No filter
      break;
  }

  return imageData;
};
