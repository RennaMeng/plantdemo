import { useEffect, useMemo, useState } from "react";
import { ExplanationPanel } from "./components/ExplanationPanel";
import { FeatureSelector } from "./components/FeatureSelector";
import { HerbariumCard } from "./components/HerbariumCard";
import { PlantPreview } from "./components/PlantPreview";
import { defaultSelectedFeatures } from "./data/plantFeatures";
import { generateBotanicalImage } from "./services/imageGeneration";
import type { FeatureCategory, HerbariumCardData, SelectedFeatures } from "./types";
import {
  createRandomSelectedFeatures,
  featureOrder,
  generateImagePrompt,
  generatePlantExplanation,
  generatePlantName,
  generateSpecimenCode,
} from "./utils/plantGeneration";

function areFeaturesEqual(first: SelectedFeatures, second: SelectedFeatures): boolean {
  return featureOrder.every((category) => first[category] === second[category]);
}

function App() {
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeatures>(defaultSelectedFeatures);
  const [generatedFeatures, setGeneratedFeatures] = useState<SelectedFeatures>(defaultSelectedFeatures);
  const [cards, setCards] = useState<HerbariumCardData[]>([]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>("当前显示的是教学示意图");

  const explanation = useMemo(() => generatePlantExplanation(generatedFeatures), [generatedFeatures]);
  const imagePrompt = useMemo(() => generateImagePrompt(generatedFeatures), [generatedFeatures]);
  const generatedName = useMemo(() => generatePlantName(generatedFeatures), [generatedFeatures]);
  const isDraftDifferent = useMemo(() => !areFeaturesEqual(selectedFeatures, generatedFeatures), [selectedFeatures, generatedFeatures]);

  useEffect(() => {
    if (!isGeneratingImage) {
      return;
    }

    setGenerationProgress(8);

    const interval = window.setInterval(() => {
      setGenerationProgress((current) => {
        if (current >= 92) {
          return current;
        }

        return current + Math.max(2, Math.round((92 - current) * 0.12));
      });
    }, 700);

    return () => window.clearInterval(interval);
  }, [isGeneratingImage]);

  function handleFeatureChange(category: FeatureCategory, id: string) {
    setSelectedFeatures((current) => ({
      ...current,
      [category]: id,
    }));
  }

  async function handleGenerate() {
    const featuresToGenerate = selectedFeatures;
    const prompt = generateImagePrompt(featuresToGenerate);

    setGeneratedFeatures(featuresToGenerate);
    setGeneratedImageUrl(null);
    setFallbackMessage(null);
    setGenerationProgress(8);
    setIsGeneratingImage(true);

    try {
      const result = await generateBotanicalImage(prompt);
      setGenerationProgress(100);
      setGeneratedImageUrl(result.imageUrl);
      setFallbackMessage(null);
    } catch (error) {
      console.error(error);
      setGeneratedImageUrl(null);
      const message = error instanceof Error ? error.message : "图片生成失败";
      setFallbackMessage(`当前显示的是教学示意图。后台图片生成未成功：${message}`);
    } finally {
      window.setTimeout(() => {
        setIsGeneratingImage(false);
        setGenerationProgress(0);
      }, 350);
    }
  }

  function handleRandomize() {
    setSelectedFeatures(createRandomSelectedFeatures());
  }

  function handleReset() {
    setSelectedFeatures(defaultSelectedFeatures);
    setGeneratedFeatures(defaultSelectedFeatures);
    setGeneratedImageUrl(null);
    setGenerationProgress(0);
    setFallbackMessage("当前显示的是教学示意图");
  }

  function handleSave() {
    const featuresToSave = selectedFeatures;
    const imageUrlToSave = areFeaturesEqual(featuresToSave, generatedFeatures) ? generatedImageUrl : null;
    const savedAt = new Date();
    const now = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(savedAt);

    const card: HerbariumCardData = {
      id: crypto.randomUUID(),
      name: generatePlantName(featuresToSave),
      specimenCode: generateSpecimenCode(featuresToSave, cards.length),
      selectedFeatures: featuresToSave,
      explanation: generatePlantExplanation(featuresToSave),
      imagePrompt: generateImagePrompt(featuresToSave),
      imageUrl: imageUrlToSave,
      savedAt: now,
      savedAtISO: savedAt.toISOString(),
    };

    setGeneratedFeatures(featuresToSave);
    setGeneratedImageUrl(imageUrlToSave);
    setFallbackMessage(imageUrlToSave ? null : "当前显示的是教学示意图");
    setCards((current) => [card, ...current]);
  }

  function handleLoadCard(card: HerbariumCardData) {
    setSelectedFeatures(card.selectedFeatures);
    setGeneratedFeatures(card.selectedFeatures);
    setGeneratedImageUrl(card.imageUrl);
    setFallbackMessage(card.imageUrl ? null : "当前显示的是教学示意图");
  }

  function handleDeleteCard(id: string) {
    setCards((current) => current.filter((card) => card.id !== id));
  }

  function handleClearCards() {
    setCards([]);
  }

  return (
    <main className="min-h-screen bg-archive-paper px-4 py-6 text-archive-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[390px_1fr]">
        <FeatureSelector
          selectedFeatures={selectedFeatures}
          onChange={handleFeatureChange}
          onGenerate={handleGenerate}
          onSave={handleSave}
          onRandomize={handleRandomize}
          onReset={handleReset}
          isGenerating={isGeneratingImage}
        />

        <div className="grid gap-6">
          <section className="rounded-lg border border-archive-line bg-archive-label/75 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-archive-moss">Current Teaching Specimen</p>
                <h2 className="mt-1 font-serif text-2xl text-archive-ink">{generatedName}</h2>
              </div>
              <span className="rounded border border-archive-line bg-white/70 px-3 py-1.5 text-xs text-archive-ink/65">
                {isDraftDifferent ? "选择已更新，等待生成" : "预览已同步"}
              </span>
            </div>
          </section>
          <PlantPreview
            selectedFeatures={generatedFeatures}
            imageUrl={generatedImageUrl}
            isGenerating={isGeneratingImage}
            generationProgress={generationProgress}
            fallbackMessage={fallbackMessage}
          />
          <ExplanationPanel explanation={explanation} imagePrompt={imagePrompt} />
          <HerbariumCard cards={cards} onLoadCard={handleLoadCard} onDeleteCard={handleDeleteCard} onClearCards={handleClearCards} />
        </div>
      </div>
    </main>
  );
}

export default App;
