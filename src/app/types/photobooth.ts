export type FilterType = 'none' | 'soft' | 'bw' | 'warm' | 'vintage' | 'cool';

export interface PhotoArea {
  x: number; // X position as percentage (0-100)
  y: number; // Y position as percentage (0-100)
  width: number; // Width as percentage (0-100)
  height: number; // Height as percentage (0-100)
}

/** Landscape frames require device held sideways before capture (see Camera). */
export type FrameOrientation = 'portrait' | 'landscape';

/** Optional per-frame export tuning (cover crop / focal point). */
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
  /**
   * Shrink photo bbox inside photoArea (0–0.2). Lower = bigger picture + white mat inside the hole.
   * Default in renderer is 0.04 when unset.
   */
  photoBBoxInset?: number;
}

export interface CapturedPhoto {
  dataUrl: string;
  filter: FilterType;
}

export interface PhotoSession {
  frameId: string;
  photos: CapturedPhoto[];
}