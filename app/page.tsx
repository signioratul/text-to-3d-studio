"use client";

import {
  Component,
  type ReactNode,
  useState,
} from "react";

import DownloadButton from "@/components/DownloadButton";
import InteractiveBackground from "@/components/InteractiveBackground";
import ModelViewer from "@/components/ModelViewer";
import PromptForm from "@/components/PromptForm";
import SampleGallery from "@/components/SampleGallery";
import StatusPanel from "@/components/StatusPanel";
import { useGeneration } from "@/hooks/useGeneration";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ModelErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[420px] w-full items-center justify-center rounded-b-2xl border border-t-0 border-white/10 bg-slate-950/40 sm:h-[500px] lg:h-[600px]">
          <p className="text-sm text-slate-400">
            Could not load model
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Home() {
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [prompt, setPrompt] = useState("");

  const {
    state,
    modelUrl,
    imageUrl,
    error,
    elapsedSeconds,
    retryAttempted,
    generate,
    retry,
  } = useGeneration();

  const isGenerating =
    state === "imaging" ||
    state === "meshing" ||
    state === "loading";

  function handleGenerate(value: string) {
    setPrompt(value);
    void generate(value);
  }

  const showSamples =
    state === "error" &&
    (
      error?.code === "QUOTA_EXCEEDED" ||
      (
        retryAttempted &&
        (
          error?.code === "PROVIDER_DOWN" ||
          error?.code === "PROVIDER_BUSY"
        )
      )
    );

  const hasModel = state === "done" && Boolean(modelUrl);

  const workspaceStatus = hasModel
    ? "Model ready"
    : isGenerating
      ? "Generating"
      : "Awaiting prompt";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0b0d16] text-slate-100">
      <InteractiveBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200/15 bg-violet-200/[0.06] text-xl text-violet-200">
              ◈
            </div>

            <div>
              <p className="text-base font-semibold tracking-tight text-slate-100">
                Form3D
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                AI creation studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-2 text-xs text-slate-300 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a9c8b9]" />
            Text to 3D
          </div>
        </header>

        <section className="max-w-3xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-200/80">
            Your imagination, in three dimensions
          </p>

          <h1 className="text-3xl font-medium tracking-tight text-slate-100 sm:text-4xl lg:text-5xl">
            <span className="text-[#b8b4dc]">
              3D reality.
            </span>
          </h1>

          <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Describe an object, generate a reference image, and
            transform it into a model you can explore and download.
          </p>
        </section>

        <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(290px,0.78fr)_minmax(0,1.5fr)] lg:gap-8">
          <aside className="glass-panel min-w-0 rounded-2xl p-4 sm:p-6 lg:mt-[68px]">
            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Create
              </p>

              <h2 className="mt-2 text-xl font-medium text-slate-100">
                Describe your model
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Add the shape, material, and details you want to see.
              </p>
            </div>

            <PromptForm
              onSubmit={handleGenerate}
              disabled={isGenerating}
            />

            <div className="mt-6 border-t border-white/[0.08] pt-4">
              <p className="text-xs leading-5 text-slate-500">
                Tip: specific details about materials, proportions,
                and style can help define your object.
              </p>
            </div>
          </aside>

          <section className="min-w-0 space-y-0">
            {/* Workspace toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border border-white/[0.10] bg-slate-900/45 px-4 py-3 backdrop-blur-xl sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-200/10 bg-violet-200/[0.05] text-violet-200">
                  ◈
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-medium text-slate-200">
                    3D Preview
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Inspect and interact with your model
                  </p>
                </div>
              </div>

              <span className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-slate-400">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    hasModel
                      ? "bg-emerald-300/80"
                      : isGenerating
                        ? "animate-pulse bg-violet-300/80"
                        : "bg-slate-500"
                  }`}
                />
                {workspaceStatus}
              </span>
            </div>

            {/* Generation status */}
            <div className="pt-4">
              <StatusPanel
                state={state}
                error={error}
                elapsedSeconds={elapsedSeconds}
                retry={retry}
              />
            </div>

            {/* Reference image */}
            {imageUrl && (
              <div className="glass-panel mt-4 overflow-hidden rounded-2xl p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-slate-200">
                      Reference image
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Generated from your description
                    </p>
                  </div>
                </div>

                <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950/40 p-3 sm:h-[280px]">
                  <img
                    src={imageUrl}
                    alt="Generated reference"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Model viewer or empty state */}
            {hasModel && modelUrl ? (
              <div className="min-w-0 [&>section]:rounded-t-none [&>section]:border-t-0">
                <ModelErrorBoundary>
                  <ModelViewer
                    url={modelUrl}
                    autoRotate={autoRotate}
                    resetKey={resetKey}
                  />
                </ModelErrorBoundary>
              </div>
            ) : (
              <div className="relative flex h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.10] bg-slate-950/30 px-6 text-center backdrop-blur-sm sm:h-[500px] lg:h-[600px]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(174,180,214,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(174,180,214,0.12)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
                />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-200/15 bg-violet-200/[0.05] text-3xl text-violet-200/80">
                  ◈
                </div>

                <h3 className="relative mt-5 text-lg font-medium text-slate-200">
                  Your next creation starts here
                </h3>

                <p className="relative mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  Enter a description to generate a reference image
                  and build your 3D model.
                </p>

                <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full border border-white/[0.08] px-3 py-1.5">
                    Image generation
                  </span>
                  <span aria-hidden="true">→</span>
                  <span className="rounded-full border border-white/[0.08] px-3 py-1.5">
                    3D mesh
                  </span>
                </div>
              </div>
            )}

            {/* Viewer actions */}
            <div className="glass-panel mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-3">
                <DownloadButton
                  modelUrl={modelUrl}
                  prompt={prompt}
                />

                <button
                  type="button"
                  onClick={() =>
                    setResetKey((value) => value + 1)
                  }
                  disabled={!hasModel}
                  className="rounded-xl border border-white/[0.10] bg-white/[0.035] px-3.5 py-2 text-sm text-slate-300 transition hover:bg-white/[0.07] hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Reset view
                </button>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(event) =>
                    setAutoRotate(event.target.checked)
                  }
                  disabled={!hasModel}
                  className="accent-[#aaa4d5] disabled:cursor-not-allowed"
                />
                Auto-rotate
              </label>
            </div>
          </section>
        </div>

        <SampleGallery visible={showSamples} />

       <footer className="border-t border-white/[0.07] pt-4 text-center text-xs text-slate-500">
          Form3D · AI-powered 3D creation
        </footer>
      </div>
    </main>
  );
}