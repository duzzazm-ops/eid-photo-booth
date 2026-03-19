import { RefObject, useCallback, useState } from 'react';
import { CapturedPhoto, CaptureMode, FilterType } from '../types/photobooth';
import { applyFilter } from '../utils/photoFilters';

interface UsePhotoCaptureOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  mode: CaptureMode;
  timerDuration: number;
  selectedFilter: FilterType;
  isMirrored: boolean;
  onFlash?: () => void;
  onShutter?: () => void;
  onPhotoCaptured?: (photo: CapturedPhoto, index: number) => void;
}

export function usePhotoCapture({
  videoRef,
  mode,
  timerDuration,
  selectedFilter,
  isMirrored,
  onFlash,
  onShutter,
  onPhotoCaptured,
}: UsePhotoCaptureOptions) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    const MAX_EDGE = 1600;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > MAX_EDGE || h > MAX_EDGE) {
      const scale = MAX_EDGE / Math.max(w, h);
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (isMirrored) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    if (selectedFilter !== 'none') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const filteredData = applyFilter(ctx, imageData, selectedFilter);
      ctx.putImageData(filteredData, 0, 0);
    }

    onFlash?.();
    onShutter?.();
    return canvas.toDataURL('image/png');
  }, [isMirrored, onFlash, onShutter, selectedFilter, videoRef]);

  const wait = useCallback((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)), []);

  const startCaptureSequence = useCallback(async (): Promise<CapturedPhoto[]> => {
    if (isCapturing) return [];
    setIsCapturing(true);
    setIsProcessing(false);

    const photos: CapturedPhoto[] = [];
    const count = mode === 'single' ? 1 : 4;

    try {
      for (let i = 0; i < count; i++) {
        for (let second = timerDuration; second > 0; second--) {
          setCountdown(second);
          await wait(1000);
        }
        setCountdown(0);
        await wait(120);

        const dataUrl = captureFrame();
        if (dataUrl) {
          const capturedPhoto = { dataUrl, filter: selectedFilter };
          photos.push(capturedPhoto);
          onPhotoCaptured?.(capturedPhoto, photos.length - 1);
        }
        setCountdown(null);

        if (i < count - 1) {
          await wait(1000);
        }
      }
    } finally {
      setIsCapturing(false);
      setIsProcessing(true);
    }

    return photos;
  }, [captureFrame, isCapturing, mode, onPhotoCaptured, selectedFilter, timerDuration, wait]);

  const finishProcessing = useCallback(() => setIsProcessing(false), []);

  return {
    countdown,
    isCapturing,
    isProcessing,
    startCaptureSequence,
    finishProcessing,
  };
}
