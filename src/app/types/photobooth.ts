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
  imagePath: string; // Local frame asset path
  ratio: number; // Width / height
  photoArea: PhotoArea; // Where to place the photo within the frame
}

export interface CapturedPhoto {
  dataUrl: string;
  filter: FilterType;
}

export interface PhotoSession {
  frameId: string;
  photos: CapturedPhoto[];
}