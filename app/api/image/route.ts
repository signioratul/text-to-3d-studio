import { NextRequest, NextResponse } from "next/server";

import { AppError, errorResponse } from "@/lib/errors";
import {
  enhancePrompt,
  validatePrompt,
} from "@/lib/prompt";
import { imageProvider } from "@/lib/providers";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    rateLimit(req);

    const body = await req.json();

    const prompt = validatePrompt(body?.prompt);
    const enhancedPrompt = enhancePrompt(prompt);

    const result = await imageProvider.textToImage(
      enhancedPrompt,
      {
        signal: req.signal,
      }
    );

    return NextResponse.json(
      {
        imageUrl: result.imageUrl,
        provider: imageProvider.name,
        enhancedPrompt,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
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