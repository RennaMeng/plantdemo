export type FeatureCategory =
  | "leafShape"
  | "leafMargin"
  | "phyllotaxis"
  | "inflorescence"
  | "flowerColor"
  | "fruitType";

export interface PlantFeature {
  id: string;
  zh: string;
  en: string;
  description: string;
  promptWords: string;
}

export type PlantFeatureMap = Record<FeatureCategory, PlantFeature[]>;

export type SelectedFeatures = Record<FeatureCategory, string>;

export interface HerbariumCardData {
  id: string;
  name: string;
  selectedFeatures: SelectedFeatures;
  explanation: string;
  imagePrompt: string;
  savedAt: string;
}
