import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { ImageProvider, MeshProvider } from "./types";

const MOCK_PREFIX = "[MOCK]";

const SAMPLE_IMAGE_URL = "/samples/sample.webp";
const SAMPLE_GLB_PATH = resolve(
  process.cwd(),
  "public",
  "samples",
  "chest.glb"
);

export const mockImageProvider: ImageProvider = {
  name: "MOCK",

  async textToImage(prompt: string, opts?: { signal?: AbortSignal }) {
    if (opts?.signal?.aborted) {
      console.log(`${MOCK_PREFIX} textToImage aborted`);
      throw new DOMException("The operation was aborted.", "AbortError");
    }

    console.log(`${MOCK_PREFIX} textToImage prompt="${prompt}"`);
    console.log(
      `${MOCK_PREFIX} returning ${SAMPLE_IMAGE_URL}`
    );

    return {
      imageUrl: SAMPLE_IMAGE_URL,
    };
  },
};

export const mockMeshProvider: MeshProvider = {
  name: "MOCK",

  async imageToGlb(
    imageUrl: string,
    opts?: { signal?: AbortSignal }
  ) {
    if (opts?.signal?.aborted) {
      console.log(`${MOCK_PREFIX} imageToGlb aborted`);
      throw new DOMException("The operation was aborted.", "AbortError");
    }

    console.log(
      `${MOCK_PREFIX} imageToGlb imageUrl="${imageUrl}"`
    );

    const glb = await readFile(SAMPLE_GLB_PATH);

    if (opts?.signal?.aborted) {
      console.log(`${MOCK_PREFIX} imageToGlb aborted`);
      throw new DOMException("The operation was aborted.", "AbortError");
    }

    console.log(
      `${MOCK_PREFIX} streaming public/samples/chest.glb`
    );
    console.log(
      `${MOCK_PREFIX} response header X-Provider: MOCK`
    );

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(glb));
        controller.close();
      },
    });

    return {
      stream,
      size: glb.byteLength,
    };
  },
};