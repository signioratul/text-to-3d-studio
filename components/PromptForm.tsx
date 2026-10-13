"use client";

import { useState, type FormEvent } from "react";

const MAX_LENGTH = 200;

const EXAMPLES = [
  "A wooden treasure chest",
  "A futuristic robot helmet",
  "A medieval stone lantern",
];

type PromptFormProps = {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
};

export default function PromptForm({
  onSubmit,
  disabled = false,
}: PromptFormProps) {
  const [prompt, setPrompt] = useState("");

  const trimmedPrompt = prompt.trim();
  const isEmpty = trimmedPrompt.length === 0;
  const isTooLong = prompt.length > MAX_LENGTH;
  const isInvalid = isEmpty || isTooLong;
  const isDisabled = disabled || isInvalid;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDisabled) return;

    onSubmit(trimmedPrompt);
  }

  function selectExample(example: string) {
    if (disabled) return;
    setPrompt(example);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-5">
      <div className="min-w-0 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="prompt"
            className="text-sm font-medium tracking-wide text-slate-200"
          >
            Describe your 3D object
          </label>

          <span
            className={`shrink-0 text-xs tabular-nums ${
              isTooLong ? "text-rose-300" : "text-slate-500"
            }`}
          >
            {prompt.length}/{MAX_LENGTH}
          </span>
        </div>

        <div className="rounded-2xl border border-white/[0.12] bg-slate-950/45 p-1 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl transition duration-300 focus-within:border-violet-300/40 focus-within:shadow-[0_0_28px_rgba(167,139,250,0.08)]">
          <textarea
            id="prompt"
            name="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={disabled}
            maxLength={MAX_LENGTH + 1}
            rows={4}
            placeholder="Imagine something… a fantasy object, a product, or a world of your own."
            aria-invalid={isInvalid}
            aria-describedby="prompt-validation"
            className="block box-border w-full max-w-full resize-none overflow-y-auto break-words rounded-xl border-0 bg-transparent px-4 py-4 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-xs text-slate-500">
              Be descriptive for better results
            </span>
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-sm text-violet-200"
            >
              ✳
            </span>
          </div>
        </div>

        <div
          id="prompt-validation"
          className="min-h-5"
          aria-live="polite"
        >
          {isEmpty && prompt.length > 0 && (
            <p className="text-sm text-rose-300">
              Please enter a prompt.
            </p>
          )}

          {isTooLong && (
            <p className="text-sm text-rose-300">
              Prompt must be 200 characters or fewer.
            </p>
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          Try an example
        </p>

        <div className="flex min-w-0 flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => selectExample(example)}
              disabled={disabled}
              className="max-w-full rounded-full border border-white/[0.10] bg-white/[0.035] px-3.5 py-2 text-left text-xs leading-5 text-slate-300 transition duration-200 hover:border-violet-300/30 hover:bg-violet-200/[0.07] hover:text-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="group relative w-full overflow-hidden rounded-xl border border-white/20 bg-gradient-to-r from-[#929fce] via-[#aaa0d0] to-[#c1a6c5] px-4 py-3.5 text-sm font-semibold text-[#171827] shadow-[0_5px_24px_rgba(142,132,190,0.12)] transition duration-300 hover:brightness-110 hover:shadow-[0_8px_30px_rgba(142,132,190,0.20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:bg-none disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
      >
        <span className="flex items-center justify-center gap-2.5">
          <span aria-hidden="true" className="text-base">
            ✧
          </span>
          {disabled ? "Creating your model…" : "Generate 3D Model"}
          <span
            aria-hidden="true"
            className="ml-auto text-lg font-normal transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </button>
    </form>
  );
}