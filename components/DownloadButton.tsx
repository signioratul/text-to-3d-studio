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
    if (!modelUrl) return;
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
      className="rounded-xl bg-gradient-to-r from-[#929fce] via-[#aaa0d0] to-[#c1a6c5] px-4 py-3 text-sm font-semibold text-[#171827] shadow-[0_5px_24px_rgba(142,132,190,0.14)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
    >
      Download GLB
    </button>
  );
}
