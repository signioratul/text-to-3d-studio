import { NextRequest, NextResponse } from "next/server";

import { AppError, errorResponse } from "@/lib/errors";
import { meshProvider } from "@/lib/providers";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 300;

const ALLOWED_IMAGE_HOSTS = new Set([
  "black-forest-labs-flux-1-schnell.hf.space",
]);

const MOCK_IMAGE_URL = "/samples/sample.webp";

function validateImageUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(
      "INVALID_PROMPT",
      "imageUrl must be a non-empty string."
    );
  }

  const imageUrl = value.trim();

  if (
    process.env.PROVIDER === "mock" &&
    imageUrl === MOCK_IMAGE_URL
  ) {
    return imageUrl;
  }

  let url: URL;

  try {
    url = new URL(imageUrl);
  } catch {
    throw new AppError(
      "INVALID_PROMPT",
      "imageUrl must be a valid URL."
    );
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new AppError(
      "INVALID_PROMPT",
      "imageUrl must use HTTP or HTTPS."
    );
  }

  if (!ALLOWED_IMAGE_HOSTS.has(url.hostname)) {
    throw new AppError(
      "INVALID_PROMPT",
      "imageUrl host is not allowed."
    );
  }

  return url.toString();
}

export async function POST(req: NextRequest) {
  try {
    rateLimit(req);

    const body = await req.json();
    const imageUrl = validateImageUrl(body?.imageUrl);

    const result = await meshProvider.imageToGlb(imageUrl, {
      signal: req.signal,
    });

    return new Response(result.stream, {
      status: 200,
      headers: {
        "Content-Type": "model/gltf-binary",
        "X-Provider": meshProvider.name,
        "Cache-Control": "no-store",
        ...(result.size !== undefined
          ? { "Content-Length": String(result.size) }
          : {}),
      },
    });
  } catch (error) {
    const appError =
      error instanceof AppError
        ? error
        : error instanceof SyntaxError
          ? new AppError(
              "INVALID_PROMPT",
              "Request body must be valid JSON."
            )
          : error instanceof Error
            ? error
            : new Error("Unknown error");

    const { body, status } = errorResponse(appError);

    return NextResponse.json(body, {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}