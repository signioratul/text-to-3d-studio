export interface ImageProvider {
  name: string;

  textToImage(
    prompt: string,
    opts?: { signal?: AbortSignal }
  ): Promise<{ imageUrl: string }>;
}

export interface MeshProvider {
  name: string;

  imageToGlb(
    imageUrl: string,
    opts?: { signal?: AbortSignal }
  ): Promise<{
    stream: ReadableStream<Uint8Array>;
    size?: number;
  }>;
}
