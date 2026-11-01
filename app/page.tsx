
"use client";

import { Component, type ReactNode, useState } from "react";
import DownloadButton from "@/components/DownloadButton";
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
        <div
          className="flex h-[180px] items-center justify-center overflow-hidden rounded-xl border p-3 sm:h-[220px] [@media(orientation:landscape)_and_(max-height:800px)]:h-[160px]"
          style={{
            borderColor: "var(--border)",
            background: "var(--workspace-background)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--dim)" }}>
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
    (error?.code === "QUOTA_EXCEEDED" ||
      (retryAttempted &&
        (error?.code === "PROVIDER_DOWN" ||
          error?.code === "PROVIDER_BUSY")));

  const hasModel = state === "done" && Boolean(modelUrl);

  const workspaceStatus = hasModel
    ? "Model ready"
    : isGenerating
      ? "Generating"
      : "Awaiting prompt";

  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-7">

        {/* Hero section */}
        <section className="max-w-3xl space-y-3">
          <p
            className="text-xs font-medium uppercase tracking-[0.22em]"
            style={{ color: "var(--accent)" }}
          >
            Your imagination, in three dimensions
          </p>

          <h1
            className="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: "var(--fg)" }}
          >
            From words to{" "}
            <span className="bg-gradient-to-r from-[#8589bd] via-[#a99dcc] to-[#b78eb0] bg-clip-text text-transparent">
              3D reality.
            </span>
          </h1>

          <p
            className="max-w-2xl text-sm leading-6 sm:text-base"
            style={{ color: "var(--dim)" }}
          >
            Describe an object, generate a reference image, and transform it
            into a model you can explore and download.
          </p>
        </section>

        {/* Main workspace */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(290px,0.78fr)_minmax(0,1.5fr)] lg:gap-7">

          {/* Prompt panel */}
          <aside className="glass-panel min-w-0 rounded-2xl p-4 sm:p-6 lg:mt-[68px]">
            <div className="mb-6">
              <p
                className="text-xs font-medium uppercase tracking-[0.16em]"
                style={{ color: "var(--dim)" }}
              >
                Create
              </p>

              <h2
                className="mt-2 text-xl font-medium"
                style={{ color: "var(--fg)" }}
              >
                Describe your model
              </h2>

              <p
                className="mt-2 text-sm leading-6"
                style={{ color: "var(--dim)" }}
              >
                Add the shape, material, and details you want to see.
              </p>
            </div>

            <PromptForm onSubmit={handleGenerate} disabled={isGenerating} />

            <div
              className="mt-6 border-t pt-4"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-xs leading-5" style={{ color: "var(--dim)" }}>
                Tip: specific details about materials, proportions, and style
                can help define your object.
              </p>
            </div>
          </aside>

          {/* 3D workspace */}
          <section className="min-w-0 space-y-0">
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border px-4 py-3 backdrop-blur-xl sm:px-5"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                    color: "var(--accent)",
                  }}
                >
                  ◈
                </div>

                <div className="min-w-0">
                  <h2
                    className="text-sm font-medium"
                    style={{ color: "var(--fg)" }}
                  >
                    3D Preview
                  </h2>

                  <p
                    className="mt-0.5 text-xs"
                    style={{ color: "var(--dim)" }}
                  >
                    Inspect and interact with your model
                  </p>
                </div>
              </div>

              <span
                className="flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--dim)",
                }}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    hasModel
                      ? "bg-emerald-500"
                      : isGenerating
                        ? "animate-pulse bg-violet-500"
                        : "bg-slate-400"
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
                    <h3
                      className="text-sm font-medium"
                      style={{ color: "var(--fg)" }}
                    >
                      Reference image
                    </h3>

                    <p
                      className="mt-1 text-xs"
                      style={{ color: "var(--dim)" }}
                    >
                      Generated from your description
                    </p>
                  </div>
                </div>

                <div
                  className="flex h-[220px] items-center justify-center overflow-hidden rounded-xl border p-3 sm:h-[280px]"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--workspace-background)",
                  }}
                >
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
              <div
                className="relative flex h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 text-center backdrop-blur-sm sm:h-[500px] lg:h-[600px]"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--workspace-background)",
                }}
              >
                <div
                  aria-hidden="true"
                  className="form3d-grid pointer-events-none absolute inset-0 opacity-80 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
                />

                <div
                  className="relative flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                    color: "var(--accent)",
                  }}
                >
                  ◈
                </div>

                <h3
                  className="relative mt-5 text-lg font-medium"
                  style={{ color: "var(--fg)" }}
                >
                  Your next creation starts here
                </h3>

                <p
                  className="relative mt-2 max-w-sm text-sm leading-6"
                  style={{ color: "var(--dim)" }}
                >
                  Enter a description to generate a reference image and build
                  your 3D model.
                </p>

                <div
                  className="relative mt-6 flex flex-wrap items-center justify-center gap-2 text-xs"
                  style={{ color: "var(--dim)" }}
                >
                  <span
                    className="rounded-full border px-3 py-1.5"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Image generation
                  </span>

                  <span aria-hidden="true">→</span>

                  <span
                    className="rounded-full border px-3 py-1.5"
                    style={{ borderColor: "var(--border)" }}
                  >
                    3D mesh
                  </span>
                </div>
              </div>
            )}

            {/* Viewer actions */}
            <div className="glass-panel mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-3">
                <DownloadButton modelUrl={modelUrl} prompt={prompt} />

                <button
                  type="button"
                  onClick={() => setResetKey((value) => value + 1)}
                  disabled={!hasModel}
                  className="rounded-xl border px-3.5 py-3 text-sm transition hover:bg-slate-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--fg)",
                  }}
                >
                  Reset view
                </button>
              </div>

              <label
                className="flex cursor-pointer items-center gap-2 text-sm"
                style={{ color: "var(--fg)" }}
              >
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(event) => setAutoRotate(event.target.checked)}
                  disabled={!hasModel}
                  className="accent-[#aaa4d5] disabled:cursor-not-allowed"
                />
                Auto-rotate
              </label>
            </div>
          </section>
        </div>

        <SampleGallery visible={showSamples} />

        <footer
          className="border-t pt-4 text-center text-xs"
          style={{ borderColor: "var(--border)", color: "var(--dim)" }}
        >
          Form3D · AI-powered 3D creation
        </footer>
      </div>
    </main>
  );
}
