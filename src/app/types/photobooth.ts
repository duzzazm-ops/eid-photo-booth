export type CaptureMode = 'single' | 'strip';

export type FilterType = 'none' | 'soft' | 'bw' | 'warm' | 'vintage' | 'cool';

export interface PhotoArea {
  x: number; // X position as percentage (0-100)
  y: number; // Y position as percentage (0-100)
  width: number; // Width as percentage (0-100)
  height: number; // Height as percentage (0-100)
}

export interface Frame {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  mode: CaptureMode; // Which capture type this frame is for
  imagePath: string; // Local frame asset path
  ratio: number; // Width / height
  photoArea: PhotoArea; // Where to place the photo(s) within the frame
  photoAreas?: PhotoArea[]; // Optional areas for multi-shot layouts
}

export interface CapturedPhoto {
  dataUrl: string;
  filter: FilterType;
}

export interface PhotoSession {
  mode: CaptureMode;
  frameId: string;
  photos: CapturedPhoto[];
  customText?: {
    line1: string;
    line2: string;
    line3: string;
  };
}