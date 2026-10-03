"use client";

type DownloadButtonProps = {
  modelUrl: string | null;
  prompt: string;
};

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "model";
}

export default function DownloadButton({
  modelUrl,
  prompt,
}: DownloadButtonProps) {
  const disabled = !modelUrl;

  function handleDownload() {
    if (!modelUrl) {
      return;
    }

    const anchor = document.createElement("a");

    anchor.href = modelUrl;
    anchor.download = `${slugify(prompt)}.glb`;
    anchor.click();
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled}
      className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
    >
      Download GLB
    </button>
  );
}