import fs from "node:fs/promises";
import path from "node:path";
import { hfImageProvider, hfMeshProvider } from "../lib/providers/hf.ts";

const PROMPT = "a small wooden treasure chest";

const SCRATCH_DIR = path.resolve("scratch");
const IMAGE_PATH = path.join(SCRATCH_DIR, "out.webp");
const GLB_PATH = path.join(SCRATCH_DIR, "out.glb");

async function saveImage(imageUrl, outputPath) {
  if (
    !imageUrl.startsWith("http://") &&
    !imageUrl.startsWith("https://")
  ) {
    throw new Error(`Invalid image URL returned by provider: ${imageUrl}`);
  }

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download generated image: HTTP ${response.status}`
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length === 0) {
    throw new Error("Generated image is empty.");
  }

  await fs.writeFile(outputPath, buffer);
}

async function saveStream(stream, outputPath) {
  const reader = stream.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (!(value instanceof Uint8Array)) {
        throw new Error("Provider returned a non-Uint8Array stream chunk.");
      }

      chunks.push(value);
      totalBytes += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }

  if (totalBytes === 0) {
    throw new Error("Generated GLB stream is empty.");
  }

  const buffer = Buffer.concat(chunks, totalBytes);

  await fs.writeFile(outputPath, buffer);

  return buffer;
}

async function verifyFile(filePath, expectedMagic) {
  const stat = await fs.stat(filePath);

  if (stat.size <= 0) {
    console.log(`FAIL: ${filePath} is empty.`);
    return false;
  }

  const handle = await fs.open(filePath, "r");

  try {
    const buffer = Buffer.alloc(4);

    await handle.read(buffer, 0, 4, 0);

    const magic = buffer.toString("ascii");
    const pass = magic === expectedMagic;

    console.log(
      `${pass ? "PASS" : "FAIL"}: ${filePath} size=${stat.size} bytes, first4="${magic}"`
    );

    return pass;
  } finally {
    await handle.close();
  }
}

async function main() {
  await fs.mkdir(SCRATCH_DIR, { recursive: true });

  console.log("P2.3 REAL PROVIDER TEST");
  console.log("========================");
  console.log(`Provider: ${process.env.PROVIDER ?? "not set"}`);
  console.log(`Prompt: ${PROMPT}`);

  if (!process.env.HF_TOKEN) {
    throw new Error("HF_TOKEN is not set.");
  }

  if (!process.env.IMAGE_TIMEOUT_MS) {
    throw new Error("IMAGE_TIMEOUT_MS is not set.");
  }

  if (!process.env.MESH_TIMEOUT_MS) {
    throw new Error("MESH_TIMEOUT_MS is not set.");
  }

  console.log("\nSTEP 1: Text -> Image");

  const imageStart = performance.now();

  const imageResult = await hfImageProvider.textToImage(PROMPT);

  const imageEnd = performance.now();

  console.log(`Provider: ${hfImageProvider.name}`);
  console.log(`Image URL: ${imageResult.imageUrl}`);
  console.log(
    `Image generation: ${((imageEnd - imageStart) / 1000).toFixed(2)}s`
  );

  await saveImage(imageResult.imageUrl, IMAGE_PATH);

  console.log(`Saved: ${IMAGE_PATH}`);

  console.log("\nSTEP 2: Image -> GLB");

  const meshStart = performance.now();

  const meshResult = await hfMeshProvider.imageToGlb(
    imageResult.imageUrl
  );

  const meshEnd = performance.now();

  console.log(`Provider: ${hfMeshProvider.name}`);
  console.log(`Reported size: ${meshResult.size ?? "unknown"} bytes`);
  console.log(
    `Mesh generation: ${((meshEnd - meshStart) / 1000).toFixed(2)}s`
  );

  const glbBuffer = await saveStream(
    meshResult.stream,
    GLB_PATH
  );

  console.log(`Saved: ${GLB_PATH}`);
  console.log(`Actual GLB size: ${glbBuffer.byteLength} bytes`);

  console.log("\nVERIFICATION");

  const imagePass = await verifyFile(IMAGE_PATH, "RIFF");
  const glbPass = await verifyFile(GLB_PATH, "glTF");

  console.log("\nRESULT");

  if (imagePass && glbPass) {
    console.log("PASS: P2.3 real provider pipeline completed successfully.");
    console.log("PASS: Image provider returned a downloadable image.");
    console.log("PASS: Mesh provider returned a valid GLB.");
  } else {
    console.log("FAIL: P2.3 verification failed.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("\nP2.3 PIPELINE FAILED");

  if (error instanceof Error) {
    console.error(`${error.name}: ${error.message}`);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});