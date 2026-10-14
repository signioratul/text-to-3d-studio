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
    "Unfortunately since this is a free service, the quota for the day is exceeded. You can try after 6:30 pm today",
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

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function getStepLabel(state: GenerationState): string | null {
  switch (state) {
    case "imaging":
      return "Creating reference image";

    case "meshing":
      return "Building 3D mesh";

    case "loading":
      return "Preparing your model";

    default:
      return null;
  }
}

function getStepNumber(state: GenerationState): number {
  switch (state) {
    case "imaging":
      return 1;
    case "meshing":
      return 2;
    case "loading":
      return 3;
    default:
      return 0;
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
      (error.code && ERROR_MESSAGES[error.code]) ?? error.message;

    return (
      <section
        className="w-full rounded-2xl border border-rose-300/15 bg-rose-950/20 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.10)] backdrop-blur-xl sm:p-5"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-200/10 bg-rose-200/[0.06] text-rose-200"
          >
            !
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-rose-100">
              Generation could not be completed
            </p>
            <p className="mt-1 text-sm leading-6 text-rose-100/70">
              {message}
            </p>

            {error.retryable && (
              <button
                type="button"
                onClick={() => void retry()}
                className="mt-4 rounded-xl border border-rose-200/15 bg-rose-100/[0.06] px-4 py-2 text-sm font-medium text-rose-50 transition hover:bg-rose-100/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/50"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (
    state === "imaging" ||
    state === "meshing" ||
    state === "loading"
  ) {
    const stepNumber = getStepNumber(state);

    return (
      <section
        className="w-full rounded-2xl border border-white/[0.10] bg-slate-950/40 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.10)] backdrop-blur-xl sm:p-5"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-200/15 bg-violet-200/[0.06] text-sm font-medium text-violet-200"
            aria-hidden="true"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-violet-200/80" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-100">
                {stepLabel}
              </p>

              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs tabular-nums text-slate-400">
                {formatElapsed(elapsedSeconds)}
              </span>
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {`Step ${stepNumber} of 3`} · Free AI services may take up to about 2 minutes.
            </p>

            <div
              className="mt-4 grid grid-cols-3 gap-1.5"
              aria-label={`Generation step ${stepNumber} of 3`}
            >
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-1 rounded-full transition-colors duration-500 ${
                    step <= stepNumber
                      ? "bg-gradient-to-r from-[#999acb] to-[#c1b3d8]"
                      : "bg-white/[0.08]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}