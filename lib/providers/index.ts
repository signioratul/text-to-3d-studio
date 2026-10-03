import { AppError } from "../errors";
import {
  hfImageProvider,
  hfMeshProvider,
} from "./hf";
import {
  mockImageProvider,
  mockMeshProvider,
} from "./mock";
import type { ImageProvider, MeshProvider } from "./types";

const providerName = process.env.PROVIDER ?? "mock";

function selectProviders(): {
  imageProvider: ImageProvider;
  meshProvider: MeshProvider;
} {
  switch (providerName) {
    case "mock":
      console.log("[MOCK] Provider selected");
      return {
        imageProvider: mockImageProvider,
        meshProvider: mockMeshProvider,
      };

    case "hf":
      console.log("[HF] Provider selected");
      return {
        imageProvider: hfImageProvider,
        meshProvider: hfMeshProvider,
      };

    default:
      throw new AppError(
        "INTERNAL",
        `Unsupported PROVIDER "${providerName}". Expected "hf" or "mock".`
      );
  }
}

export const { imageProvider, meshProvider } = selectProviders();
