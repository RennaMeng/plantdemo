import { categoryLabels } from "../data/plantFeatures";
import type { HerbariumCardData } from "../types";
import { featureOrder, getFeature } from "../utils/plantGeneration";
import { PlantPreview } from "./PlantPreview";

interface HerbariumCardProps {
  cards: HerbariumCardData[];
}

export function HerbariumCard({ cards }: HerbariumCardProps) {
  return (
    <section className="rounded-lg border border-archive-line bg-archive-label/90 p-5 shadow-specimen">
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-archive-line pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-archive-moss">My Herbarium Cards</p>
          <h2 className="mt-1 font-serif text-2xl text-archive-ink">我的植物图鉴卡片</h2>
        </div>
        <span className="text-sm text-archive-ink/60">{cards.length} cards</span>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-md border border-dashed border-archive-line bg-white/55 p-6 text-center text-sm leading-6 text-archive-ink/60">
          尚未保存图鉴卡片。选择形态特征后点击 Save Herbarium Card，即可把当前植物模型加入这里。
        </div>
      ) : (
        <div className="grid gap-4">
          {cards.map((card) => (
            <article key={card.id} className="grid gap-4 rounded-md border border-archive-line bg-white/70 p-4 md:grid-cols-[170px_1fr]">
              <PlantPreview selectedFeatures={card.selectedFeatures} compact />
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-serif text-xl text-archive-ink">{card.name}</h3>
                  <time className="rounded border border-archive-line bg-archive-label px-2 py-1 text-xs text-archive-ink/55">{card.savedAt}</time>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {featureOrder.map((category) => {
                    const feature = getFeature(category, card.selectedFeatures[category]);

                    return (
                      <span key={category} className="rounded border border-archive-line bg-archive-pale px-2.5 py-1 text-xs text-archive-ink/72">
                        {categoryLabels[category].zh}: {feature.zh}
                      </span>
                    );
                  })}
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-archive-ink/68">{card.explanation}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
