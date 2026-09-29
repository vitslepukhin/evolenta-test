import { LocalUserTimeZone } from './user-time-zone.service';

describe('LocalUserTimeZone', () => {
  const timeZone = new LocalUserTimeZone();

  it('formats a positive offset as +HHmm', () => {
    const date = new Date('2026-01-10T12:00:00.000Z');
    vi.spyOn(date, 'getTimezoneOffset').mockReturnValue(-240);
    expect(timeZone.timezoneOffset(date)).toBe('+0400');
  });

  it('formats a negative offset with minutes as -HHmm', () => {
    const date = new Date('2026-01-10T12:00:00.000Z');
    vi.spyOn(date, 'getTimezoneOffset').mockReturnValue(150);
    expect(timeZone.timezoneOffset(date)).toBe('-0230');
  });
});
