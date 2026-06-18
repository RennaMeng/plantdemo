import { categoryLabels, plantFeatures } from "../data/plantFeatures";
import type { FeatureCategory, PlantFeature, SelectedFeatures } from "../types";

export const featureOrder: FeatureCategory[] = [
  "leafShape",
  "leafMargin",
  "phyllotaxis",
  "inflorescence",
  "flowerColor",
  "fruitType",
];

export function getFeature(category: FeatureCategory, id: string): PlantFeature {
  const feature = plantFeatures[category].find((item) => item.id === id);

  if (!feature) {
    return plantFeatures[category][0];
  }

  return feature;
}

export function generatePlantName(selectedFeatures: SelectedFeatures): string {
  const flowerColor = getFeature("flowerColor", selectedFeatures.flowerColor);
  const phyllotaxis = getFeature("phyllotaxis", selectedFeatures.phyllotaxis);
  const leafShape = getFeature("leafShape", selectedFeatures.leafShape);

  return `${flowerColor.zh}花${phyllotaxis.zh}${leafShape.zh.replace("形", "")}叶植物`;
}

export function generatePlantExplanation(selectedFeatures: SelectedFeatures): string {
  const selected = featureOrder.map((category) => ({
    category,
    label: categoryLabels[category],
    feature: getFeature(category, selectedFeatures[category]),
  }));

  const featureList = selected
    .map(({ label, feature }) => `${label.zh}为${feature.zh}（${feature.en}）：${feature.description}`)
    .join("；");

  const visualSummary = `从视觉上看，这个组合会形成一株以${getFeature(
    "phyllotaxis",
    selectedFeatures.phyllotaxis,
  ).zh}叶片为主要节奏、具有${getFeature("leafShape", selectedFeatures.leafShape).zh}轮廓和${getFeature(
    "flowerColor",
    selectedFeatures.flowerColor,
  ).zh}花部焦点的教学植物。${getFeature(
    "inflorescence",
    selectedFeatures.inflorescence,
  ).zh}让花沿着特定轴线或中心组织起来，${getFeature(
    "fruitType",
    selectedFeatures.fruitType,
  ).zh}则补充了生殖结构的观察线索。`;

  return `当前形态组合：${selected
    .map(({ label, feature }) => `${label.zh}${feature.zh}`)
    .join("、")}。${featureList}。${visualSummary}请注意，这个组合不一定对应真实物种，而是用于帮助初学者理解植物形态术语与视觉结构之间关系的教学用植物形态模型。`;
}

export function generateImagePrompt(selectedFeatures: SelectedFeatures): string {
  const promptParts = featureOrder.map((category) => getFeature(category, selectedFeatures[category]).promptWords);

  return `Scientific botanical illustration of a herbaceous plant with ${promptParts.join(
    ", ",
  )}, clear leaf venation, educational diagram style, white background, labeled morphology.`;
}
