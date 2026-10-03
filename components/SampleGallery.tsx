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
  if (!visible) {
    return null;
  }

  return (
    <section
      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4"
      aria-label="Sample models"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-100">
          Sample model (live generation unavailable)
        </h2>

        <p className="mt-1 text-xs text-zinc-500">
          This is a pre-existing model and was not
          generated from your prompt.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SAMPLES.map((sample) => (
          <div
            key={sample.url}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
          >
            <p className="mb-3 text-sm text-zinc-300">
              {sample.name}
            </p>

            <a
              href={sample.url}
              className="inline-flex rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              Open model
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}