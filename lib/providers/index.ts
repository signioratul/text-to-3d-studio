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
const imageProviderName = process.env.IMAGE_PROVIDER ?? providerName;
const meshProviderName = process.env.MESH_PROVIDER ?? providerName;

const imageProviders: Record<string, ImageProvider> = {
  mock: mockImageProvider,
  hf: hfImageProvider,
};

const meshProviders: Record<string, MeshProvider> = {
  mock: mockMeshProvider,
  hf: hfMeshProvider,
};

function selectProvider<T>(
  providerName: string,
  variableName: string,
  providers: Record<string, T>
): T {
  const provider = providers[providerName];

  if (!provider) {
    throw new AppError(
      "INTERNAL",
      `Unsupported ${variableName} "${providerName}". Expected "hf" or "mock".`
    );
  }

  return provider;
}

export const imageProvider = selectProvider(
  imageProviderName,
  "IMAGE_PROVIDER",
  imageProviders
);
export const meshProvider = selectProvider(
  meshProviderName,
  "MESH_PROVIDER",
  meshProviders
);

if (imageProviderName === meshProviderName) {
  console.log(`[${imageProviderName.toUpperCase()}] Provider selected`);
} else {
  console.log(`[${imageProviderName.toUpperCase()}] Image provider selected`);
  console.log(`[${meshProviderName.toUpperCase()}] Mesh provider selected`);
}
