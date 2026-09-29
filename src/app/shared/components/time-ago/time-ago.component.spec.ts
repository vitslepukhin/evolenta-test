import { TestBed } from '@angular/core/testing';
import { TimeAgoComponent } from './time-ago.component';

describe('TimeAgoComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the relative time for the given date', async () => {
    TestBed.configureTestingModule({ imports: [TimeAgoComponent] });
    const fixture = TestBed.createComponent(TimeAgoComponent);
    fixture.componentRef.setInput('date', '2026-01-10T11:58:00.000Z');
    await vi.advanceTimersByTimeAsync(0);
    await fixture.whenStable();

    const time = (fixture.nativeElement as HTMLElement).querySelector('time');
    expect(time?.textContent?.trim()).toBe('2 минуты назад');
    expect(time?.getAttribute('datetime')).toBe('2026-01-10T11:58:00.000Z');
  });

  it('recomputes the label as time passes (every refresh tick)', async () => {
    TestBed.configureTestingModule({ imports: [TimeAgoComponent] });
    const fixture = TestBed.createComponent(TimeAgoComponent);
    fixture.componentRef.setInput('date', '2026-01-10T12:00:00.000Z');
    await vi.advanceTimersByTimeAsync(0);
    await fixture.whenStable();

    let time = (fixture.nativeElement as HTMLElement).querySelector('time');
    expect(time?.textContent?.trim()).toBe('только что');

    await vi.advanceTimersByTimeAsync(60_000);
    await fixture.whenStable();

    time = (fixture.nativeElement as HTMLElement).querySelector('time');
    expect(time?.textContent?.trim()).toBe('1 минуту назад');

    await vi.advanceTimersByTimeAsync(4 * 60_000);
    await fixture.whenStable();

    time = (fixture.nativeElement as HTMLElement).querySelector('time');
    expect(time?.textContent?.trim()).toBe('5 минут назад');
  });
});
