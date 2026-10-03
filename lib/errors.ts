export type ErrorCode =
  | "INVALID_PROMPT"
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  | "PROVIDER_BUSY"
  | "PROVIDER_DOWN"
  | "TIMEOUT"
  | "BAD_OUTPUT"
  | "INTERNAL";

const ERROR_STATUS: Record<ErrorCode, number> = {
  INVALID_PROMPT: 400,
  RATE_LIMITED: 429,
  QUOTA_EXCEEDED: 429,
  PROVIDER_BUSY: 503,
  PROVIDER_DOWN: 502,
  TIMEOUT: 504,
  BAD_OUTPUT: 502,
  INTERNAL: 500,
};

const RETRYABLE: Record<ErrorCode, boolean> = {
  INVALID_PROMPT: false,
  RATE_LIMITED: true,
  QUOTA_EXCEEDED: false,
  PROVIDER_BUSY: true,
  PROVIDER_DOWN: true,
  TIMEOUT: true,
  BAD_OUTPUT: false,
  INTERNAL: false,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly retryable: boolean;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.retryable = RETRYABLE[code];
  }

  get status(): number {
    return ERROR_STATUS[this.code];
  }
}

export function errorResponse(error: AppError | Error) {
  if (error instanceof AppError) {
    return {
      body: {
        error: {
          code: error.code,
          message: error.message,
          retryable: error.retryable,
        },
      },
      status: error.status,
    };
  }

  return {
    body: {
      error: {
        code: "INTERNAL" as const,
        message: "An internal error occurred.",
        retryable: false,
      },
    },
    status: 500,
  };
}
