import { describe, expect, it } from "vitest";

import {
  mockImageProvider,
  mockMeshProvider,
} from "../lib/providers/mock";

describe("mockImageProvider", () => {
  it("returns the local sample image URL", async () => {
    const result = await mockImageProvider.textToImage(
      "wooden treasure chest"
    );

    expect(result).toEqual({
      imageUrl: "/samples/sample.webp",
    });
  });

  it("has the MOCK provider name", () => {
    expect(mockImageProvider.name).toBe("MOCK");
  });
});

describe("mockMeshProvider", () => {
  it("has the MOCK provider name", () => {
    expect(mockMeshProvider.name).toBe("MOCK");
  });

  it("returns a GLB stream with the expected size", async () => {
    const result = await mockMeshProvider.imageToGlb(
      "/samples/sample.webp"
    );

    expect(result.stream).toBeInstanceOf(ReadableStream);
    expect(result.size).toBe(16_580_240);

    const reader = result.stream.getReader();
    const { value, done } = await reader.read();

    expect(done).toBe(false);
    expect(value).toBeInstanceOf(Uint8Array);
    expect(value?.byteLength).toBe(16_580_240);

    const magic = new TextDecoder().decode(
      value?.slice(0, 4)
    );

    expect(magic).toBe("glTF");

    await reader.cancel();
  });

  it("accepts an AbortSignal", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      mockMeshProvider.imageToGlb(
        "/samples/sample.webp",
        { signal: controller.signal }
      )
    ).rejects.toMatchObject({
      name: "AbortError",
    });
  });
});

describe("mockImageProvider abort handling", () => {
  it("rejects when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      mockImageProvider.textToImage(
        "wooden treasure chest",
        { signal: controller.signal }
      )
    ).rejects.toMatchObject({
      name: "AbortError",
    });
  });
});