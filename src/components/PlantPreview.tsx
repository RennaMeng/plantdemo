import type { PlantFeature, SelectedFeatures } from "../types";
import { getFeature } from "../utils/plantGeneration";

interface PlantPreviewProps {
  selectedFeatures: SelectedFeatures;
  compact?: boolean;
  imageUrl?: string | null;
  isGenerating?: boolean;
  generationProgress?: number;
  fallbackMessage?: string | null;
}

const flowerColors: Record<string, string> = {
  white: "#f8f6ec",
  yellow: "#e0b938",
  purple: "#7c5aa6",
  red: "#b84a42",
  blue: "#5276ad",
};

function leafPath(shape: string): string {
  switch (shape) {
    case "ovate":
      return "M0,-30 C25,-25 33,5 0,38 C-33,5 -25,-25 0,-30Z";
    case "cordate":
      return "M0,36 C-36,4 -36,-24 -9,-24 C-2,-24 0,-16 0,-16 C0,-16 2,-24 9,-24 C36,-24 36,4 0,36Z";
    case "palmate":
      return "M0,-40 L10,-12 L34,-26 L20,0 L44,6 L17,14 L26,38 L0,20 L-26,38 L-17,14 L-44,6 L-20,0 L-34,-26 L-10,-12Z";
    case "needle":
      return "M0,-48 C5,-22 5,22 0,48 C-5,22 -5,-22 0,-48Z";
    default:
      return "M0,-42 C17,-22 18,22 0,44 C-18,22 -17,-22 0,-42Z";
  }
}

function leafTransforms(phyllotaxis: string): string[] {
  switch (phyllotaxis) {
    case "alternate":
      return ["translate(100 230) rotate(-45)", "translate(148 188) rotate(47)", "translate(106 148) rotate(-42)", "translate(150 108) rotate(43)"];
    case "whorled":
      return [
        "translate(126 188) rotate(-90)",
        "translate(126 188) rotate(0)",
        "translate(126 188) rotate(90)",
        "translate(126 188) rotate(180)",
        "translate(126 122) rotate(-90)",
        "translate(126 122) rotate(0)",
        "translate(126 122) rotate(90)",
      ];
    case "basal":
      return [
        "translate(126 258) rotate(-70)",
        "translate(126 258) rotate(-35)",
        "translate(126 258) rotate(0)",
        "translate(126 258) rotate(35)",
        "translate(126 258) rotate(70)",
      ];
    default:
      return ["translate(98 218) rotate(-55)", "translate(154 218) rotate(55)", "translate(98 162) rotate(-52)", "translate(154 162) rotate(52)"];
  }
}

function flowerNodes(inflorescence: string, color: string) {
  const petal = (x: number, y: number, size = 8) => (
    <g key={`${x}-${y}-${size}`} transform={`translate(${x} ${y})`}>
      <circle cx="0" cy={-size * 0.55} r={size * 0.48} fill={color} stroke="#486348" strokeWidth="0.8" />
      <circle cx={size * 0.55} cy="0" r={size * 0.48} fill={color} stroke="#486348" strokeWidth="0.8" />
      <circle cx="0" cy={size * 0.55} r={size * 0.48} fill={color} stroke="#486348" strokeWidth="0.8" />
      <circle cx={-size * 0.55} cy="0" r={size * 0.48} fill={color} stroke="#486348" strokeWidth="0.8" />
      <circle r={size * 0.24} fill="#d7b65f" />
    </g>
  );

  if (inflorescence === "umbel") {
    return (
      <g>
        {[82, 104, 126, 148, 170].map((x) => (
          <line key={x} x1="126" y1="68" x2={x} y2="40" stroke="#71865f" strokeWidth="1.3" />
        ))}
        {[82, 104, 126, 148, 170].map((x) => petal(x, 40, 7))}
      </g>
    );
  }

  if (inflorescence === "capitulum") {
    return (
      <g>
        <circle cx="126" cy="46" r="23" fill={color} stroke="#486348" strokeWidth="1" />
        <circle cx="126" cy="46" r="11" fill="#d7b65f" stroke="#486348" strokeWidth="0.8" />
        {Array.from({ length: 10 }).map((_, index) => (
          <circle
            key={index}
            cx={126 + Math.cos((index / 10) * Math.PI * 2) * 18}
            cy={46 + Math.sin((index / 10) * Math.PI * 2) * 18}
            r="4"
            fill="#fffaf0"
            opacity="0.45"
          />
        ))}
      </g>
    );
  }

  if (inflorescence === "spike") {
    return <g>{[42, 58, 74, 90].map((y, index) => petal(index % 2 ? 137 : 115, y, 6))}</g>;
  }

  if (inflorescence === "panicle") {
    return (
      <g>
        {[74, 94, 114].map((y, index) => (
          <g key={y}>
            <line x1="126" y1={y} x2={index % 2 ? 160 : 92} y2={y - 20} stroke="#71865f" strokeWidth="1.2" />
            {petal(index % 2 ? 160 : 92, y - 20, 6)}
          </g>
        ))}
        {petal(126, 44, 6)}
      </g>
    );
  }

  return <g>{[40, 58, 76, 94].map((y, index) => petal(index % 2 ? 139 : 113, y, 6.5))}</g>;
}

export function PlantPreview({
  selectedFeatures,
  compact = false,
  imageUrl = null,
  isGenerating = false,
  generationProgress = 0,
  fallbackMessage = null,
}: PlantPreviewProps) {
  const leafShape = getFeature("leafShape", selectedFeatures.leafShape);
  const leafMargin = getFeature("leafMargin", selectedFeatures.leafMargin);
  const phyllotaxis = getFeature("phyllotaxis", selectedFeatures.phyllotaxis);
  const inflorescence = getFeature("inflorescence", selectedFeatures.inflorescence);
  const flowerColor = getFeature("flowerColor", selectedFeatures.flowerColor);
  const fruitType = getFeature("fruitType", selectedFeatures.fruitType);
  const color = flowerColors[flowerColor.id] ?? flowerColors.purple;
  const transforms = leafTransforms(phyllotaxis.id);
  const path = leafPath(leafShape.id);
  const leafStrokeDash = leafMargin.id === "serrated" ? "2 2" : leafMargin.id === "undulate" ? "5 3" : undefined;
  const fruitFill = fruitType.id === "berry" || fruitType.id === "drupe" ? "#7d3331" : "#b49b5c";
  const annotations: Array<[string, PlantFeature]> = [
    ["叶形", leafShape],
    ["叶缘", leafMargin],
    ["叶序", phyllotaxis],
    ["花序", inflorescence],
    ["果实", fruitType],
  ];

  return (
    <section className={`rounded-lg border border-archive-line bg-archive-label shadow-specimen ${compact ? "p-3" : "p-5"}`}>
      {!compact && (
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-archive-line pb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-archive-moss">AI Botanical Image Preview</p>
            <h2 className="mt-1 font-serif text-2xl text-archive-ink">植物科学插画预览</h2>
          </div>
          <span className="rounded border border-archive-line bg-white/70 px-2 py-1 text-xs text-archive-ink/70">
            {imageUrl ? "AI Image" : "Mock SVG"}
          </span>
        </div>
      )}

      <div className={compact ? "" : "grid gap-4 lg:grid-cols-[1fr_190px]"}>
        <div className="archive-grid rounded-md border border-archive-line bg-[#fbfaf3] p-2">
          <div className="relative min-h-56 overflow-hidden rounded">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="AI 生成的植物科学插画"
                className="h-full min-h-56 w-full object-contain"
              />
            ) : (
              <svg viewBox="0 0 252 320" role="img" aria-label="植物形态预览图" className="h-full min-h-56 w-full">
                <line x1="126" y1="280" x2="126" y2="58" stroke="#395d3d" strokeWidth="3" strokeLinecap="round" />
                {transforms.map((transform, index) => (
                  <g key={index} transform={transform}>
                    <path d={path} fill="#8aa06f" stroke="#385d3b" strokeWidth="1.4" strokeDasharray={leafStrokeDash} opacity="0.96" />
                    <line x1="0" y1="-26" x2="0" y2="30" stroke="#e8efdf" strokeWidth="1" opacity="0.8" />
                  </g>
                ))}
                {flowerNodes(inflorescence.id, color)}
                <g>
                  <line x1="126" y1="246" x2="154" y2="264" stroke="#71865f" strokeWidth="1.2" />
                  <ellipse cx="162" cy="268" rx={fruitType.id === "legume" ? 15 : 7} ry={fruitType.id === "legume" ? 4 : 9} fill={fruitFill} stroke="#5f5130" />
                  <line x1="126" y1="246" x2="98" y2="264" stroke="#71865f" strokeWidth="1.2" />
                  <ellipse cx="90" cy="268" rx={fruitType.id === "legume" ? 15 : 7} ry={fruitType.id === "legume" ? 4 : 9} fill={fruitFill} stroke="#5f5130" />
                </g>
                {!compact && (
                  <g fill="#173f2a" fontSize="9" fontFamily="Georgia, serif">
                    <line x1="174" y1="48" x2="220" y2="32" stroke="#8c9b7a" />
                    <text x="184" y="29">01 花序</text>
                    <line x1="168" y1="160" x2="224" y2="150" stroke="#8c9b7a" />
                    <text x="188" y="146">02 叶形</text>
                    <line x1="72" y1="220" x2="28" y2="240" stroke="#8c9b7a" />
                    <text x="10" y="252">03 叶序</text>
                  </g>
                )}
              </svg>
            )}
            {isGenerating && (
              <div className="absolute inset-0 grid place-items-center bg-[#fbfaf3]/85 px-6 text-center">
                <div className="w-full max-w-sm rounded-md border border-archive-line bg-white/85 px-4 py-4 text-sm text-archive-ink shadow-specimen">
                  <div className="flex items-center justify-between gap-3">
                    <span>正在生成完整植物科学图...</span>
                    <span className="font-serif text-base">{generationProgress}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-archive-line/55">
                    <div
                      className="h-full rounded-full bg-archive-moss transition-all duration-500"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-archive-ink/55">正在调用后台图片接口，请稍候。</p>
                </div>
              </div>
            )}
          </div>
          {!compact && fallbackMessage && !imageUrl && (
            <p className="mt-3 rounded border border-archive-line bg-white/75 px-3 py-2 text-xs leading-5 text-archive-ink/68">
              {fallbackMessage}
            </p>
          )}
        </div>

        {!compact && (
          <aside className="rounded-md border border-archive-line bg-white/60 p-4">
            <h3 className="font-serif text-lg text-archive-ink">结构标注</h3>
            <dl className="mt-4 grid gap-3 text-sm">
              {annotations.map(([label, feature]) => (
                <div key={label} className="border-b border-archive-line/70 pb-2 last:border-0">
                  <dt className="text-xs text-archive-moss">{label}</dt>
                  <dd className="mt-1 text-archive-ink">
                    {feature.zh} <span className="text-archive-ink/50">/ {feature.en}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>
    </section>
  );
}
