"use client";

import { FormEvent, useState } from "react";

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

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isDisabled) {
      return;
    }

    onSubmit(trimmedPrompt);
  }

  function selectExample(example: string) {
    if (disabled) {
      return;
    }

    setPrompt(example);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 space-y-4"
    >
      <div className="min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="prompt"
            className="min-w-0 text-sm font-medium text-zinc-200"
          >
            Describe your 3D object
          </label>

          <span
            className={`shrink-0 text-xs ${
              isTooLong
                ? "text-red-400"
                : "text-zinc-500"
            }`}
          >
            {prompt.length}/{MAX_LENGTH}
          </span>
        </div>

        <textarea
          id="prompt"
          name="prompt"
          value={prompt}
          onChange={(event) =>
            setPrompt(event.target.value)
          }
          disabled={disabled}
          maxLength={MAX_LENGTH + 1}
          rows={4}
          placeholder="Describe the 3D object you want to create..."
          aria-invalid={isInvalid}
          aria-describedby="prompt-validation"
          className="box-border block w-full max-w-full resize-none overflow-y-auto break-words rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div
          id="prompt-validation"
          className="min-h-5"
          aria-live="polite"
        >
          {isEmpty && prompt.length > 0 && (
            <p className="text-sm text-red-400">
              Please enter a prompt.
            </p>
          )}

          {isTooLong && (
            <p className="text-sm text-red-400">
              Prompt must be 200 characters or fewer.
            </p>
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Try an example
        </p>

        <div className="flex min-w-0 flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => selectExample(example)}
              disabled={disabled}
              className="max-w-full rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-left text-xs text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {disabled ? "Generating..." : "Generate"}
      </button>
    </form>
  );
}