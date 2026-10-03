import { AppError } from "./errors";

const MAX_PROMPT_LENGTH = 200;

export function validatePrompt(value: unknown): string {
  if (typeof value !== "string") {
    throw new AppError(
      "INVALID_PROMPT",
      "Prompt must be a string."
    );
  }

  const prompt = value.trim();

  if (!prompt) {
    throw new AppError(
      "INVALID_PROMPT",
      "Prompt must not be empty."
    );
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new AppError(
      "INVALID_PROMPT",
      `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.`
    );
  }

  return prompt;
}

export function enhancePrompt(prompt: string): string {
  return prompt;
}