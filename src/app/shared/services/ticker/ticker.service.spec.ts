import { TestBed } from '@angular/core/testing';
import { TickerService } from './ticker.service';

describe('TickerService', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not change on the initial (zeroth) tick', async () => {
    const service = TestBed.inject(TickerService);
    const initial = service.tick();

    await vi.advanceTimersByTimeAsync(0);
    expect(service.tick()).toBe(initial);
  });

  it('changes once per minute', async () => {
    const service = TestBed.inject(TickerService);
    const initial = service.tick();

    await vi.advanceTimersByTimeAsync(60_000);
    const afterOneMinute = service.tick();
    expect(afterOneMinute).not.toBe(initial);

    await vi.advanceTimersByTimeAsync(60_000);
    expect(service.tick()).not.toBe(afterOneMinute);
  });

  it('is shared across injections (same instance, same schedule)', () => {
    const first = TestBed.inject(TickerService);
    const second = TestBed.inject(TickerService);
    expect(first).toBe(second);
  });
});
