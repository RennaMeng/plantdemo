import { categoryLabels, plantFeatures } from "../data/plantFeatures";
import type { FeatureCategory, SelectedFeatures } from "../types";
import { featureOrder, getFeature } from "../utils/plantGeneration";

interface FeatureSelectorProps {
  selectedFeatures: SelectedFeatures;
  onChange: (category: FeatureCategory, id: string) => void;
  onGenerate: () => void;
  onSave: () => void;
  onRandomize: () => void;
  onReset: () => void;
  isGenerating: boolean;
}

export function FeatureSelector({
  selectedFeatures,
  onChange,
  onGenerate,
  onSave,
  onRandomize,
  onReset,
  isGenerating,
}: FeatureSelectorProps) {
  return (
    <section className="max-h-none overflow-visible rounded-lg border border-archive-line bg-archive-label/85 p-5 shadow-specimen lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto">
      <div className="mb-6 border-b border-archive-line pb-5">
        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-archive-moss">Plant Morphology Generator</p>
        <h1 className="font-serif text-3xl leading-tight text-archive-ink">Create Your Morphological Plant</h1>
        <p className="mt-3 text-sm leading-6 text-archive-ink/72">选择植物特征，生成一张教学用植物图鉴卡片。</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRandomize}
            className="rounded border border-archive-line bg-white/75 px-3 py-1.5 text-xs font-medium text-archive-ink transition hover:border-archive-moss hover:bg-archive-pale"
          >
            Random Morphology
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded border border-archive-line bg-white/75 px-3 py-1.5 text-xs font-medium text-archive-ink transition hover:border-archive-moss hover:bg-archive-pale"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {featureOrder.map((category) => {
          const selected = getFeature(category, selectedFeatures[category]);

          return (
            <label key={category} className="block">
              <span className="mb-2 flex items-baseline justify-between gap-3">
                <span className="font-serif text-base text-archive-ink">{categoryLabels[category].zh}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-archive-moss">{categoryLabels[category].en}</span>
              </span>
              <select
                value={selectedFeatures[category]}
                onChange={(event) => onChange(category, event.target.value)}
                className="w-full rounded-md border border-archive-line bg-white/80 px-3 py-2.5 text-sm text-archive-ink outline-none transition focus:border-archive-moss focus:ring-2 focus:ring-archive-moss/20"
              >
                {plantFeatures[category].map((feature) => (
                  <option key={feature.id} value={feature.id}>
                    {feature.zh} / {feature.en}
                  </option>
                ))}
              </select>
              <p className="mt-2 min-h-10 text-xs leading-5 text-archive-ink/64">{selected.description}</p>
            </label>
          );
        })}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="rounded-md border border-archive-ink bg-archive-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-[#245037] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? "Generating AI Image..." : "Generate AI Botanical Image"}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="rounded-md border border-archive-moss bg-archive-pale px-4 py-3 text-sm font-medium text-archive-ink transition hover:bg-[#dce8d0]"
        >
          Save Herbarium Card
        </button>
      </div>
    </section>
  );
}
