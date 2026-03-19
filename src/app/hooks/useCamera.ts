import { RefObject, useCallback, useEffect, useState } from 'react';

type CameraPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported' | 'error';
type FacingMode = 'user' | 'environment';

interface UseCameraOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  defaultFacingMode?: FacingMode;
}

export function useCamera({ videoRef, defaultFacingMode = 'user' }: UseCameraOptions) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [permissionState, setPermissionState] = useState<CameraPermissionState>('prompt');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<FacingMode>(defaultFacingMode);

  const stopCamera = useCallback(() => {
    setStream((prev) => {
      prev?.getTracks().forEach((track) => track.stop());
      return null;
    });
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [videoRef]);

  const startCamera = useCallback(
    async (nextFacingMode?: FacingMode) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setPermissionState('unsupported');
        setErrorMessage('Camera API is not supported on this browser/device.');
        return;
      }

      if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        const isLocalDev =
          host === 'localhost' ||
          host === '127.0.0.1' ||
          host === '[::1]' ||
          host.endsWith('.localhost');
        if (!window.isSecureContext && !isLocalDev) {
          setPermissionState('error');
          setErrorMessage(
            'Camera needs a secure connection (HTTPS). Open this site with https:// or use localhost for development.'
          );
          setIsStarting(false);
          return;
        }
      }

      setIsStarting(true);
      setErrorMessage('');
      const desiredFacingMode = nextFacingMode ?? facingMode;

      try {
        if ('permissions' in navigator && navigator.permissions?.query) {
          try {
            const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
            if (status.state === 'denied') {
              setPermissionState('denied');
            }
          } catch {
            // Some browsers throw on camera permission query; continue with getUserMedia.
          }
        }

        stopCamera();
        let mediaStream: MediaStream | null = null;
        let activeFacingMode = desiredFacingMode;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: desiredFacingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          const fallbackMode: FacingMode = desiredFacingMode === 'user' ? 'environment' : 'user';
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: fallbackMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
          activeFacingMode = fallbackMode;
        }

        if (!mediaStream) {
          throw new Error('Could not acquire camera stream.');
        }

        setStream(mediaStream);
        setFacingMode(activeFacingMode);
        setPermissionState('granted');
      } catch (error) {
        const domError = error as DOMException;
        if (domError.name === 'NotAllowedError' || domError.name === 'SecurityError') {
          setPermissionState('denied');
          setErrorMessage('Camera permission denied. Please allow access and try again.');
        } else if (domError.name === 'NotFoundError' || domError.name === 'OverconstrainedError') {
          setPermissionState('error');
          setErrorMessage('No compatible camera was found.');
        } else {
          setPermissionState('error');
          setErrorMessage('Failed to start camera.');
        }
      } finally {
        setIsStarting(false);
      }
    },
    [facingMode, stopCamera]
  );

  const switchCamera = useCallback(async () => {
    const nextMode: FacingMode = facingMode === 'user' ? 'environment' : 'user';
    await startCamera(nextMode);
  }, [facingMode, startCamera]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => undefined);
    }
  }, [stream, videoRef]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    stream,
    isStarting,
    permissionState,
    errorMessage,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
  };
}
