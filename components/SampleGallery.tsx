"use client";

type Sample = {
  name: string;
  url: string;
};

const SAMPLES: Sample[] = [
  {
    name: "Treasure chest",
    url: "/samples/chest.glb",
  },
];

type SampleGalleryProps = {
  visible: boolean;
};

export default function SampleGallery({
  visible,
}: SampleGalleryProps) {
  if (!visible) return null;

  return (
    <section
      className="glass-panel w-full rounded-2xl p-4 sm:p-5"
      aria-label="Sample models"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
          Sample model (live generation unavailable)
        </h2>
        <p className="mt-1 text-xs" style={{ color: "var(--dim)" }}>
          This is a pre-existing model and was not generated from your prompt.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SAMPLES.map((sample) => (
          <div
            key={sample.url}
            className="rounded-xl border p-3"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <p className="mb-3 text-sm" style={{ color: "var(--fg)" }}>
              {sample.name}
            </p>
            <a
              href={sample.url}
              className="inline-flex rounded-lg border px-3 py-2 text-xs transition hover:-translate-y-0.5"
              style={{
                borderColor: "var(--border)",
                color: "var(--fg)",
              }}
            >
              Open model
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
