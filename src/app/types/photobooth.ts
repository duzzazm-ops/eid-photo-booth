export type FilterType = 'none' | 'soft' | 'bw' | 'warm' | 'vintage' | 'cool';

export interface PhotoArea {
  x: number; // X position as percentage (0-100)
  y: number; // Y position as percentage (0-100)
  width: number; // Width as percentage (0-100)
  height: number; // Height as percentage (0-100)
}

/** Landscape frames require device held sideways before capture (see Camera). */
export type FrameOrientation = 'portrait' | 'landscape';

/** Optional per-frame export tuning (e.g. film-landscape: show more FOV without affecting others). */
export interface FrameRenderTune {
  /** >1 widens the source crop for cover (more scene visible). Default 1. */
  coverSourceExpand?: number;
  anchorX?: number;
  anchorY?: number;
}

export interface Frame {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  imagePath: string; // Local frame asset path
  ratio: number; // Width / height
  photoArea: PhotoArea; // Where to place the photo within the frame
  /** Default portrait — wide frames need landscape device orientation to capture. */
  orientation?: FrameOrientation;
  /** Export-only cover tuning */
  renderTune?: FrameRenderTune;
}

export interface CapturedPhoto {
  dataUrl: string;
  filter: FilterType;
}

export interface PhotoSession {
  frameId: string;
  photos: CapturedPhoto[];
}