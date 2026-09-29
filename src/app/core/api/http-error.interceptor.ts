import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError, createApiError } from './api-error';

/**
 * Normalizes any failed HTTP request into an `ApiError` before it reaches
 * data-access services. Network/timeout failures use status 0; backend
 * failures keep the server status code.
 */
export function httpErrorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  return next(req).pipe(
    catchError((error: unknown) => {
      const apiError = toApiError(error);
      return throwError(() => apiError);
    }),
  );
}

function toApiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return createApiError('network', 'Не удалось соединиться с сервером', {
        status: 0,
        cause: error,
      });
    }
    return createApiError('http', extractHttpMessage(error), {
      status: error.status,
      cause: error,
    });
  }

  if (error instanceof Error) {
    return createApiError('unknown', error.message, { cause: error });
  }

  return createApiError('unknown', 'Произошла неизвестная ошибка', { cause: error });
}

function extractHttpMessage(error: HttpErrorResponse): string {
  const body: unknown = error.error;
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }
  return error.message || `Запрос завершился с ошибкой ${error.status}`;
}
