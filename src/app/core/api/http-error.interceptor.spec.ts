import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiError } from './api-error';
import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('normalizes a backend error response into an ApiError with status and message', async () => {
    const request = firstValueFrom(http.get('/api/senior-1/tickets/1'));

    httpMock
      .expectOne('/api/senior-1/tickets/1')
      .flush({ message: 'Ticket not found' }, { status: 404, statusText: 'Not Found' });

    await expect(request).rejects.toMatchObject({
      kind: 'http',
      status: 404,
      message: 'Ticket not found',
    } satisfies Partial<ApiError>);
  });

  it('normalizes a network failure (status 0) into a network ApiError', async () => {
    const request = firstValueFrom(http.get('/api/senior-1/tickets/1'));

    httpMock.expectOne('/api/senior-1/tickets/1').error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });

    await expect(request).rejects.toMatchObject({
      kind: 'network',
      status: 0,
    } satisfies Partial<ApiError>);
  });
});
