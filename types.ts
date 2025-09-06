export interface Garment {
  id: string;
  imageData: string; // Original image
  cutoutImageData: string; // Background removed image for try-on
  category: string;
  colors: string[];
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All-Season';
  formality: 1 | 2 | 3 | 4 | 5; // 1: Casual, 5: Formal
  description: string;
}

export interface Avatar {
  bodyShape: 'masculine' | 'feminine' | 'androgynous';
  skinTone: string;
  hairColor: string;
  hairStyle: 'short' | 'long' | 'bun' | 'bald';
  facialHair: 'none' | 'beard' | 'mustache' | 'goatee';
  faceShape: 'oval' | 'round' | 'square';
  eyeColor: string;
  height: number; // In cm
  weight: number; // In kg
  bodyType: 'slim' | 'fit' | 'muscular' | 'curvy' | 'plus-size';
  chest: number; // In cm
  waist: number; // In cm
  hips: number; // In cm
}

export interface Outfit {
  outfitGarmentIds: string[];
  reasoning: string;
}

export interface SavedOutfit extends Outfit {
  id: string;
  title: string;
}

export type View = 'closet' | 'stylist' | 'avatar' | 'mirror';