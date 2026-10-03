"use client";

import type {
  GenerationError,
  GenerationState,
} from "@/hooks/useGeneration";

type StatusPanelProps = {
  state: GenerationState;
  error: GenerationError | null;
  elapsedSeconds: number;
  retry: () => Promise<void>;
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_PROMPT:
    "The prompt could not be accepted. Please check it and try again.",
  RATE_LIMITED:
    "Too many requests were made. Please wait a moment and try again.",
  QUOTA_EXCEEDED:
    "The AI service has reached its available quota. Please try again later.",
  PROVIDER_BUSY:
    "The AI service is busy right now. Please try again shortly.",
  PROVIDER_DOWN:
    "The AI service could not be reached. Please try again.",
  TIMEOUT:
    "The AI service took too long to respond. Please try again.",
  BAD_OUTPUT:
    "The AI service returned an invalid result. Please try again.",
  INTERNAL:
    "Something went wrong on our side. Please try again.",
};

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function getStepLabel(state: GenerationState): string | null {
  switch (state) {
    case "imaging":
      return "Step 1/3: creating reference image";

    case "meshing":
      return "Step 2/3: building 3D mesh";

    case "loading":
      return "Step 3/3: loading model";

    default:
      return null;
  }
}

export default function StatusPanel({
  state,
  error,
  elapsedSeconds,
  retry,
}: StatusPanelProps) {
  const stepLabel = getStepLabel(state);

  if (state === "error" && error) {
    const message =
      (error.code &&
        ERROR_MESSAGES[error.code]) ??
      error.message;

    return (
      <section
        className="w-full rounded-xl border border-red-900 bg-zinc-900 p-4"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-red-400">
          {message}
        </p>

        {error.retryable && (
          <button
            type="button"
            onClick={() => void retry()}
            className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Retry
          </button>
        )}
      </section>
    );
  }

  if (
    state === "imaging" ||
    state === "meshing" ||
    state === "loading"
  ) {
    return (
      <section
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4"
        aria-live="polite"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-200">
            {stepLabel}
          </p>

          <span className="text-sm tabular-nums text-zinc-500">
            {formatElapsed(elapsedSeconds)}
          </span>
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          Free AI services can take up to ~2 minutes.
        </p>
      </section>
    );
  }

  return null;
}