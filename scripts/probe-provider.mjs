import { Client } from "@gradio/client";

const candidates = [
  "black-forest-labs/FLUX.1-schnell",
  "tencent/Hunyuan3D-2",
  "stabilityai/TripoSR",
  "microsoft/TRELLIS",
  "microsoft/TRELLIS.2",
];

const token = process.env.HF_TOKEN;

if (!token) {
  console.warn("WARNING: HF_TOKEN is not set. Public Spaces can still be probed.");
}

for (const spaceId of candidates) {
  console.log("\n" + "=".repeat(80));
  console.log(`SPACE: ${spaceId}`);
  console.log("=".repeat(80));

  try {
    const options = token ? { token } : {};

    const client = await Client.connect(spaceId, options);

    console.log("STATUS: CONNECTED");

    const api = await client.view_api();

    console.log("\nEXACT API:");
    console.dir(api, { depth: null, colors: false });
  } catch (error) {
    console.log("STATUS: FAILED");

    if (error instanceof Error) {
      console.log(`ERROR: ${error.message}`);
    } else {
      console.dir(error, { depth: null, colors: false });
    }
  }
}