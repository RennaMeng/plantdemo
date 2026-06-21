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
  const leafShape = getFeature("leafShape", selectedFeatures.leafShape);
  const leafMargin = getFeature("leafMargin", selectedFeatures.leafMargin);
  const phyllotaxis = getFeature("phyllotaxis", selectedFeatures.phyllotaxis);
  const inflorescence = getFeature("inflorescence", selectedFeatures.inflorescence);
  const flowerColor = getFeature("flowerColor", selectedFeatures.flowerColor);
  const fruitType = getFeature("fruitType", selectedFeatures.fruitType);

  return [
    "Create a high-resolution scientific botanical specimen image of a complete plant, not a single leaf.",
    "The plant must clearly include the selected leaf morphology, leaf arrangement, inflorescence, flower color, and fruit type in one coherent specimen.",
    `Leaves: ${leafShape.promptWords}, ${leafMargin.promptWords}, visible midrib and fine vein network.`,
    `Phyllotaxis: ${phyllotaxis.promptWords}, with leaves arranged accurately along the stem or base.`,
    `Inflorescence and flowers: ${inflorescence.promptWords}, ${flowerColor.promptWords}, botanically plausible flowers.`,
    `Fruit: ${fruitType.promptWords}, shown as a small but visible mature or developing fruit structure.`,
    "Style: realistic botanical scanography and natural history museum specimen photography, scientific macro detail, elegant artful composition, not cartoon, not fantasy.",
    "Composition: complete plant centered vertically, top-down specimen view, pressed-flat herbarium feeling, clean silhouette, full plant visible from root/base to flowers and fruit.",
    "Background and light: pure black background (#000000), high-precision scanner light, even cool illumination, minimal shadow, razor-sharp plant edges.",
    "Avoid: pot, soil, vase, hand, tools, insects, decorative labels, cluttered background, landscape scene, extra unrelated plants.",
  ].join(" ");
}

export function createRandomSelectedFeatures(): SelectedFeatures {
  return featureOrder.reduce((result, category) => {
    const options = plantFeatures[category];
    const randomFeature = options[Math.floor(Math.random() * options.length)];

    return {
      ...result,
      [category]: randomFeature.id,
    };
  }, {} as SelectedFeatures);
}

export function generateSpecimenCode(selectedFeatures: SelectedFeatures, index: number): string {
  const leafShape = getFeature("leafShape", selectedFeatures.leafShape).id.slice(0, 3).toUpperCase();
  const flowerColor = getFeature("flowerColor", selectedFeatures.flowerColor).id.slice(0, 3).toUpperCase();

  return `PMG-${flowerColor}-${leafShape}-${String(index + 1).padStart(3, "0")}`;
}
