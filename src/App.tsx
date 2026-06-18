import { useMemo, useState } from "react";
import { ExplanationPanel } from "./components/ExplanationPanel";
import { FeatureSelector } from "./components/FeatureSelector";
import { HerbariumCard } from "./components/HerbariumCard";
import { PlantPreview } from "./components/PlantPreview";
import { defaultSelectedFeatures } from "./data/plantFeatures";
import type { FeatureCategory, HerbariumCardData, SelectedFeatures } from "./types";
import { generateImagePrompt, generatePlantExplanation, generatePlantName } from "./utils/plantGeneration";

function App() {
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeatures>(defaultSelectedFeatures);
  const [generatedFeatures, setGeneratedFeatures] = useState<SelectedFeatures>(defaultSelectedFeatures);
  const [cards, setCards] = useState<HerbariumCardData[]>([]);

  const explanation = useMemo(() => generatePlantExplanation(generatedFeatures), [generatedFeatures]);
  const imagePrompt = useMemo(() => generateImagePrompt(generatedFeatures), [generatedFeatures]);

  function handleFeatureChange(category: FeatureCategory, id: string) {
    setSelectedFeatures((current) => ({
      ...current,
      [category]: id,
    }));
  }

  function handleGenerate() {
    setGeneratedFeatures(selectedFeatures);
  }

  function handleSave() {
    const featuresToSave = selectedFeatures;
    const now = new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    const card: HerbariumCardData = {
      id: crypto.randomUUID(),
      name: generatePlantName(featuresToSave),
      selectedFeatures: featuresToSave,
      explanation: generatePlantExplanation(featuresToSave),
      imagePrompt: generateImagePrompt(featuresToSave),
      savedAt: now,
    };

    setGeneratedFeatures(featuresToSave);
    setCards((current) => [card, ...current]);
  }

  return (
    <main className="min-h-screen bg-archive-paper px-4 py-6 text-archive-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[390px_1fr]">
        <FeatureSelector
          selectedFeatures={selectedFeatures}
          onChange={handleFeatureChange}
          onGenerate={handleGenerate}
          onSave={handleSave}
        />

        <div className="grid gap-6">
          <PlantPreview selectedFeatures={generatedFeatures} />
          <ExplanationPanel explanation={explanation} imagePrompt={imagePrompt} />
          <HerbariumCard cards={cards} />
        </div>
      </div>
    </main>
  );
}

export default App;
