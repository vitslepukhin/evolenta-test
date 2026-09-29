export type ApiErrorKind = 'network' | 'http' | 'validation' | 'unknown';

export interface ApiError {
  readonly kind: ApiErrorKind;
  readonly message: string;
  readonly status?: number;
  readonly cause?: unknown;
}

const API_ERROR_KINDS: readonly ApiErrorKind[] = ['network', 'http', 'validation', 'unknown'];

export function createApiError(
  kind: ApiErrorKind,
  message: string,
  options?: { status?: number; cause?: unknown },
): ApiError {
  return { kind, message, status: options?.status, cause: options?.cause };
}

export function isApiError(value: unknown): value is ApiError {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<ApiError>;
  return (
    typeof candidate.kind === 'string' &&
    (API_ERROR_KINDS as readonly string[]).includes(candidate.kind) &&
    typeof candidate.message === 'string'
  );
}

export function readApiError(error: unknown): ApiError | undefined {
  if (isApiError(error)) {
    return error;
  }
  if (error instanceof Error && isApiError(error.cause)) {
    return error.cause;
  }
  return undefined;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  return readApiError(error)?.message ?? fallback;
}
