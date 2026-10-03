"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GenerationState =
  | "idle"
  | "imaging"
  | "meshing"
  | "loading"
  | "done"
  | "error";

export type GenerationError = {
  code?: string;
  message: string;
  retryable?: boolean;
};

type ImageResponse = {
  imageUrl?: unknown;
  error?: {
    code?: unknown;
    message?: unknown;
    retryable?: unknown;
  };
};

type FailedStep = "image" | "mesh";

type UseGenerationResult = {
  state: GenerationState;
  imageUrl: string | null;
  modelUrl: string | null;
  error: GenerationError | null;
  elapsedSeconds: number;
  retryAttempted: boolean;
  generate: (prompt: string) => Promise<void>;
  retry: () => Promise<void>;
};

function getErrorFromResponse(
  body: ImageResponse,
  status: number
): GenerationError {
  if (
    body.error &&
    typeof body.error.message === "string"
  ) {
    return {
      code:
        typeof body.error.code === "string"
          ? body.error.code
          : undefined,
      message: body.error.message,
      retryable:
        typeof body.error.retryable === "boolean"
          ? body.error.retryable
          : undefined,
    };
  }

  return {
    message: `Request failed with status ${status}.`,
  };
}

async function readResponseError(
  response: Response
): Promise<GenerationError> {
  try {
    const body = (await response.json()) as ImageResponse;

    return getErrorFromResponse(
      body,
      response.status
    );
  } catch {
    return {
      message: `Request failed with status ${response.status}.`,
    };
  }
}

function errorFromUnknown(
  value: unknown
): GenerationError {
  if (
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof (value as { message?: unknown }).message ===
      "string"
  ) {
    return {
      code:
        "code" in value &&
        typeof (value as { code?: unknown }).code ===
          "string"
          ? (value as { code: string }).code
          : undefined,

      message: (value as { message: string }).message,

      retryable:
        "retryable" in value &&
        typeof (value as { retryable?: unknown })
          .retryable === "boolean"
          ? (value as { retryable: boolean }).retryable
          : undefined,
    };
  }

  return {
    message: "Generation failed.",
  };
}

export function useGeneration(): UseGenerationResult {
  const [state, setState] =
    useState<GenerationState>("idle");

  const [modelUrl, setModelUrl] =
    useState<string | null>(null);

  const [imageUrl, setImageUrl] =
    useState<string | null>(null);

  const [error, setError] =
    useState<GenerationError | null>(null);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [retryAttempted, setRetryAttempted] =
    useState(false);

  const controllerRef =
    useRef<AbortController | null>(null);

  const modelUrlRef =
    useRef<string | null>(null);

  const imageUrlRef =
    useRef<string | null>(null);

  const promptRef =
    useRef<string | null>(null);

  const failedStepRef =
    useRef<FailedStep | null>(null);

  const startedAtRef =
    useRef<number | null>(null);

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();

    const startedAt = Date.now();

    startedAtRef.current = startedAt;

    setElapsedSeconds(0);

    timerRef.current = setInterval(() => {
      setElapsedSeconds(
        Math.floor(
          (Date.now() - startedAt) / 1000
        )
      );
    }, 1000);
  }, [stopTimer]);

  const settleTimer = useCallback(() => {
    if (startedAtRef.current !== null) {
      setElapsedSeconds(
        Math.floor(
          (Date.now() - startedAtRef.current) / 1000
        )
      );
    }

    stopTimer();
  }, [stopTimer]);

  const revokeModelUrl = useCallback(() => {
    if (modelUrlRef.current) {
      URL.revokeObjectURL(modelUrlRef.current);
      modelUrlRef.current = null;
    }

    setModelUrl(null);
  }, []);

  const runImageStep = useCallback(
    async (
      prompt: string,
      controller: AbortController
    ): Promise<string> => {
      setState("imaging");

      const imageResponse = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      if (!imageResponse.ok) {
        throw {
          ...(await readResponseError(imageResponse)),
          failedStep: "image" as const,
        };
      }

      const imageBody =
        (await imageResponse.json()) as ImageResponse;

      if (
        typeof imageBody.imageUrl !== "string" ||
        !imageBody.imageUrl
      ) {
        throw {
          code: "BAD_OUTPUT",
          message:
            "Image generation returned no image URL.",
          retryable: false,
          failedStep: "image" as const,
        };
      }

      return imageBody.imageUrl;
    },
    []
  );

  const runMeshStep = useCallback(
    async (
      imageUrl: string,
      controller: AbortController
    ): Promise<void> => {
      setState("meshing");

      const meshResponse = await fetch("/api/mesh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
        signal: controller.signal,
      });

      if (!meshResponse.ok) {
        throw {
          ...(await readResponseError(meshResponse)),
          failedStep: "mesh" as const,
        };
      }

      setState("loading");

      const blob = await meshResponse.blob();

      if (blob.size === 0) {
        throw {
          code: "BAD_OUTPUT",
          message:
            "Mesh generation returned an empty file.",
          retryable: false,
          failedStep: "mesh" as const,
        };
      }

      const nextModelUrl =
        URL.createObjectURL(blob);

      if (controller.signal.aborted) {
        URL.revokeObjectURL(nextModelUrl);
        return;
      }

      revokeModelUrl();

      modelUrlRef.current = nextModelUrl;

      setModelUrl(nextModelUrl);
    },
    [revokeModelUrl]
  );

  const execute = useCallback(
    async (
      prompt: string,
      startFrom: FailedStep
    ): Promise<void> => {
      controllerRef.current?.abort();

      const controller = new AbortController();

      controllerRef.current = controller;

      setError(null);

      failedStepRef.current = null;

      if (startFrom === "image") {
        imageUrlRef.current = null;

        setImageUrl(null);

        revokeModelUrl();
      }

      startTimer();

      try {
        let imageUrl = imageUrlRef.current;

        if (startFrom === "image" || !imageUrl) {
          imageUrl = await runImageStep(
            prompt,
            controller
          );

          if (controller.signal.aborted) {
            return;
          }

          imageUrlRef.current = imageUrl;

          setImageUrl(imageUrl);
        }

        await runMeshStep(
          imageUrl,
          controller
        );

        if (controller.signal.aborted) {
          return;
        }

        failedStepRef.current = null;

        setError(null);

        setState("done");
      } catch (value) {
        if (controller.signal.aborted) {
          return;
        }

        const failure =
          value &&
          typeof value === "object" &&
          "failedStep" in value
            ? (value as {
                failedStep?: FailedStep;
                code?: string;
                message?: string;
                retryable?: boolean;
              })
            : null;

        failedStepRef.current =
          failure?.failedStep ?? startFrom;

        const generationError =
          errorFromUnknown(value);

        setError(generationError);

        setState("error");
      } finally {
        if (
          controllerRef.current === controller
        ) {
          controllerRef.current = null;
        }

        settleTimer();
      }
    },
    [
      revokeModelUrl,
      runImageStep,
      runMeshStep,
      settleTimer,
      startTimer,
    ]
  );

  const generate = useCallback(
    async (prompt: string): Promise<void> => {
      promptRef.current = prompt;

      setRetryAttempted(false);

      await execute(prompt, "image");
    },
    [execute]
  );

  const retry = useCallback(async (): Promise<void> => {
    const prompt = promptRef.current;

    const failedStep = failedStepRef.current;

    if (!prompt || !failedStep) {
      return;
    }

    setRetryAttempted(true);

    await execute(prompt, failedStep);
  }, [execute]);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();

      stopTimer();

      if (modelUrlRef.current) {
        URL.revokeObjectURL(modelUrlRef.current);
        modelUrlRef.current = null;
      }
    };
  }, [stopTimer]);

  return {
    state,
    imageUrl,
    modelUrl,
    error,
    elapsedSeconds,
    retryAttempted,
    generate,
    retry,
  };
}