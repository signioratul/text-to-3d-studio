import { Client, handle_file } from "@gradio/client";

import { AppError } from "../errors";
import type { ImageProvider, MeshProvider } from "./types";

const FLUX = "black-forest-labs/FLUX.1-schnell";
const HUNYUAN = "tencent/Hunyuan3D-2";

type FileData = {
  value?: unknown;
  url?: string;
  path?: string;
};

type Result = {
  data?: unknown[];
};

function token(): `hf_${string}` {
  const value = process.env.HF_TOKEN;

  if (!value) {
    throw new AppError("INTERNAL", "HF_TOKEN is not configured.");
  }

  if (!value.startsWith("hf_")) {
    throw new AppError("INTERNAL", "HF_TOKEN must start with hf_.");
  }

  return value as `hf_${string}`;
}

function timeout(name: "IMAGE_TIMEOUT_MS" | "MESH_TIMEOUT_MS"): number {
  const value = Number(process.env[name]);

  if (!Number.isFinite(value) || value <= 0) {
    throw new AppError(
      "INTERNAL",
      `${name} must be a positive number.`
    );
  }

  return value;
}

function mapError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const message =
    error instanceof Error ? error.message : String(error);
  const text = message.toLowerCase();

  if (text.includes("sleeping") || text.includes("queue")) {
    return new AppError(
      "PROVIDER_BUSY",
      "The Hugging Face provider is currently busy."
    );
  }

  if (text.includes("quota")) {
    return new AppError(
      "QUOTA_EXCEEDED",
      "The Hugging Face provider quota has been exceeded."
    );
  }

  if (
    text.includes("timeout") ||
    text.includes("timed out") ||
    text.includes("abort")
  ) {
    return new AppError(
      "TIMEOUT",
      "The Hugging Face provider request timed out."
    );
  }

  if (
    error instanceof TypeError ||
    text.includes("network") ||
    text.includes("fetch failed") ||
    text.includes("connection")
  ) {
    return new AppError(
      "PROVIDER_DOWN",
      "The Hugging Face provider could not be reached."
    );
  }

  return new AppError(
    "PROVIDER_DOWN",
    "The Hugging Face provider request failed."
  );
}

function fileUrl(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  const file = value as FileData;
  const unwrapped =
    file.value !== undefined ? file.value : file;

  if (!unwrapped || typeof unwrapped !== "object") {
    return undefined;
  }

  const result = unwrapped as FileData;
  return result.url ?? result.path;
}

async function connect(space: string): Promise<Client> {
  try {
    return await Client.connect(space, {
      token: token(),
    });
  } catch (error) {
    throw mapError(error);
  }
}

function timed<T>(
  operation: Promise<T>,
  ms: number,
  signal?: AbortSignal
): Promise<T> {
  return new Promise((resolve, reject) => {
    let done = false;

    const finish = (callback: () => void) => {
      if (done) return;

      done = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      callback();
    };

    const abort = () =>
      finish(() =>
        reject(
          new AppError(
            "TIMEOUT",
            "The Hugging Face provider request was aborted."
          )
        )
      );

    const timer = setTimeout(
      () =>
        finish(() =>
          reject(
            new AppError(
              "TIMEOUT",
              "The Hugging Face provider request timed out."
            )
          )
        ),
      ms
    );

    signal?.addEventListener("abort", abort, {
      once: true,
    });

    operation.then(
      (value) => finish(() => resolve(value)),
      (error) => finish(() => reject(error))
    );
  });
}

async function predict(
  space: string,
  endpoint: string,
  payload: Record<string, unknown>,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<Result> {
  const client = await connect(space);

  return timed(
    client.predict(endpoint, payload) as Promise<Result>,
    timeoutMs,
    signal
  );
}

async function outputGlb(
  result: Result
): Promise<{
  stream: ReadableStream<Uint8Array>;
  size: number;
}> {
   const url = fileUrl(result.data?.[0]);

  if (!url) {
    throw new AppError(
      "BAD_OUTPUT",
      "Hugging Face returned no generated GLB."
    );
  }

  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://")
  ) {
    throw new AppError(
      "BAD_OUTPUT",
      "Hugging Face returned an invalid GLB URL."
    );
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new AppError(
      "PROVIDER_DOWN",
      `Failed to download generated GLB: HTTP ${response.status}.`
    );
  }

  const buffer = new Uint8Array(
    await response.arrayBuffer()
  );

  if (
    buffer.length < 4 ||
    new TextDecoder().decode(buffer.subarray(0, 4)) !== "glTF"
  ) {
    throw new AppError(
      "BAD_OUTPUT",
      "Hugging Face returned invalid GLB output."
    );
  }

  return {
    stream: new ReadableStream({
      start(controller) {
        controller.enqueue(buffer);
        controller.close();
      },
    }),
    size: buffer.length,
  };
}

export const hfImageProvider: ImageProvider = {
  name: "HF",

  async textToImage(prompt, opts) {
    try {
      const result = await predict(
        FLUX,
        "/infer",
        { prompt },
        timeout("IMAGE_TIMEOUT_MS"),
        opts?.signal
      );

      const imageUrl = fileUrl(result.data?.[0]);

      if (!imageUrl) {
        throw new AppError(
          "BAD_OUTPUT",
          "Hugging Face returned no generated image."
        );
      }

      if (
        !imageUrl.startsWith("http://") &&
        !imageUrl.startsWith("https://")
      ) {
        throw new AppError(
          "BAD_OUTPUT",
          "Hugging Face returned an invalid image URL."
        );
      }

      return { imageUrl };
    } catch (error) {
      throw mapError(error);
    }
  },
};

export const hfMeshProvider: MeshProvider = {
  name: "HF",

  async imageToGlb(imageUrl, opts) {
    try {
      const result = await predict(
        HUNYUAN,
        "/shape_generation",
        {
          caption: null,
          image: handle_file(imageUrl),
          mv_image_front: null,
          mv_image_back: null,
          mv_image_left: null,
          mv_image_right: null,
          steps: 30,
          guidance_scale: 5,
          seed: 1234,
          octree_resolution: 256,
          check_box_rembg: true,
          num_chunks: 8000,
          randomize_seed: true,
        },
        timeout("MESH_TIMEOUT_MS"),
        opts?.signal
      );

      return await outputGlb(result);
    } catch (error) {
      throw mapError(error);
    }
  },
};