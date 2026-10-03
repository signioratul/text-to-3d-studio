"use client";

import {
  Component,
  type ReactNode,
  useState,
} from "react";

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
    return {
      hasError: true,
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[420px] w-full min-w-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 sm:h-[500px] lg:h-[600px]">
          <p className="text-sm text-zinc-400">
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6 p-4 sm:p-6">
        <PromptForm
          onSubmit={handleGenerate}
          disabled={isGenerating}
        />

        <StatusPanel
          state={state}
          error={error}
          elapsedSeconds={elapsedSeconds}
          retry={retry}
        />

        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <DownloadButton
            modelUrl={modelUrl}
            prompt={prompt}
          />

          <button
            type="button"
            onClick={() =>
              setResetKey((value) => value + 1)
            }
            className="rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Reset view
          </button>

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(event) =>
                setAutoRotate(event.target.checked)
              }
            />
            Auto-rotate
          </label>
        </div>

        {(imageUrl || (state === "done" && modelUrl)) && (
          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            {imageUrl && (
              <div className="min-w-0 w-full">
                <p className="mb-2 text-sm text-zinc-400">
                  Reference image
                </p>

                <div className="flex h-[420px] min-w-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:h-[500px] lg:h-[600px]">
                  <img
                    src={imageUrl}
                    alt="Generated reference"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            {state === "done" && modelUrl && (
              <div className="min-w-0">
                <ModelErrorBoundary>
                  <ModelViewer
                    url={modelUrl}
                    autoRotate={autoRotate}
                    resetKey={resetKey}
                  />
                </ModelErrorBoundary>
              </div>
            )}
          </div>
        )}

        <SampleGallery visible={showSamples} />
      </div>
    </main>
  );
}