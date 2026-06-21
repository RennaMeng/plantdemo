interface ExplanationPanelProps {
  explanation: string;
  imagePrompt: string;
}

export function ExplanationPanel({ explanation, imagePrompt }: ExplanationPanelProps) {
  return (
    <section className="rounded-lg border border-archive-line bg-archive-pale/80 p-5">
      <div className="mb-4 border-b border-archive-line pb-3">
        <p className="text-xs uppercase tracking-[0.22em] text-archive-moss">Mock AI Interpretation</p>
        <h2 className="mt-1 font-serif text-2xl text-archive-ink">AI 形态解释</h2>
      </div>

      <p className="text-sm leading-7 text-archive-ink/78">{explanation}</p>

      <div className="mt-5 rounded-md border border-archive-line bg-white/70 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-serif text-base text-archive-ink">Image Prompt</h3>
          <span className="rounded border border-archive-line bg-archive-label px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-archive-moss">
            Complete Plant Image
          </span>
        </div>
        <p className="mb-2 text-xs leading-5 text-archive-ink/55">
          影像模式：将当前形态组合转译为一张黑底、真实、科学且有艺术感的完整植物图，包含叶、花序、花色与果实特征。
        </p>
        <p className="text-xs leading-6 text-archive-ink/68">{imagePrompt}</p>
        <p className="mt-3 text-xs leading-5 text-archive-ink/50">
          TODO: Replace or tune the server-side image provider as needed. This preset currently asks Google Nano Banana 2 / Gemini Flash Image for a complete botanical specimen image.
        </p>
      </div>
    </section>
  );
}
