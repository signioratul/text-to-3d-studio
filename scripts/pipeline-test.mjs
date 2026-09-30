import { Client, handle_file } from "@gradio/client";
import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

const PROMPT = "a small wooden treasure chest";
const SCRATCH_DIR = path.resolve("scratch");
const IMAGE_PATH = path.join(SCRATCH_DIR, "out.webp");
const GLB_PATH = path.join(SCRATCH_DIR, "out.glb");

async function saveGradioFile(fileData, outputPath) {
  if (!fileData) {
    throw new Error("Gradio returned no file.");
  }

  const file = fileData.value ?? fileData;
  const sourceUrl = file.url ?? file.path;

  if (!sourceUrl) {
    throw new Error(`Gradio returned no file URL/path: ${JSON.stringify(fileData)}`);
  }

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download generated file: HTTP ${response.status}`
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outputPath, buffer);
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

  const token = process.env.HF_TOKEN;

  if (!token) {
    console.warn("WARNING: HF_TOKEN is not set.");
  }

  const options = token ? { token } : {};

  console.log("Connecting to FLUX.1-schnell...");
  const flux = await Client.connect(
    "black-forest-labs/FLUX.1-schnell",
    options
  );

  console.log("Connecting to Hunyuan3D-2...");
  const hunyuan = await Client.connect(
    "tencent/Hunyuan3D-2",
    options
  );

  console.log("\nSTEP 1: Text → Image");

  const imageStart = performance.now();

  const imageResult = await flux.predict("/infer", {
    prompt: PROMPT,
  });

  const imageEnd = performance.now();

  const generatedImage = imageResult.data?.[0];

  await saveGradioFile(generatedImage, IMAGE_PATH);

  console.log(
    `Image step: ${((imageEnd - imageStart) / 1000).toFixed(2)}s`
  );
  console.log(`Saved: ${IMAGE_PATH}`);

  console.log("\nSTEP 2: Image → 3D");

  const image3dStart = performance.now();

  const image3dResult = await hunyuan.predict("/shape_generation", {
    caption: null,
    image: handle_file(IMAGE_PATH),
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
  });

  const image3dEnd = performance.now();

  const generatedGlb = image3dResult.data?.[0];

  await saveGradioFile(generatedGlb, GLB_PATH);

  console.log(
    `3D step: ${((image3dEnd - image3dStart) / 1000).toFixed(2)}s`
  );
  console.log(`Saved: ${GLB_PATH}`);

  console.log("\nVERIFICATION");

  const imagePass = await verifyFile(IMAGE_PATH, "RIFF");
  const glbPass = await verifyFile(GLB_PATH, "glTF");

  console.log("\nRESULT");

  if (imagePass && glbPass) {
    console.log("PASS: Pipeline completed successfully.");
  } else {
    console.log("FAIL: Pipeline verification failed.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("\nPIPELINE FAILED");
  console.error(error);
  process.exitCode = 1;
});