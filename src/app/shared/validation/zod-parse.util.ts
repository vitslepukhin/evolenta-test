import { ZodError, ZodType } from 'zod';
import { ApiError, createApiError } from '../../core/api/api-error';

/**
 * Parses `data` against `schema`. Throws a normalized `ApiError` (kind:
 * 'validation') instead of a raw `ZodError` when the shape doesn't match,
 * so callers only ever deal with `ApiError`.
 */
export function parseOrThrow<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  throw toValidationApiError(result.error);
}

function toValidationApiError(error: ZodError): ApiError {
  const message = error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');

  return createApiError('validation', `Некорректный формат ответа сервера: ${message}`, {
    cause: error,
  });
}
