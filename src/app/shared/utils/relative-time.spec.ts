import { relativeTime } from './relative-time';

describe('relativeTime', () => {
  const now = new Date('2026-01-10T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "только что" for very recent timestamps', () => {
    expect(relativeTime(new Date(now.getTime() - 2_000))).toBe('только что');
  });

  it('formats seconds ago', () => {
    expect(relativeTime(new Date(now.getTime() - 30_000))).toBe('30 секунд назад');
  });

  it('formats minutes ago with correct plural form', () => {
    expect(relativeTime(new Date(now.getTime() - 60_000))).toBe('1 минуту назад');
    expect(relativeTime(new Date(now.getTime() - 2 * 60_000))).toBe('2 минуты назад');
    expect(relativeTime(new Date(now.getTime() - 5 * 60_000))).toBe('5 минут назад');
  });

  it('formats hours ago', () => {
    expect(relativeTime(new Date(now.getTime() - 3 * 60 * 60_000))).toBe('3 часа назад');
  });

  it('formats days ago', () => {
    expect(relativeTime(new Date(now.getTime() - 2 * 24 * 60 * 60_000))).toBe('2 дня назад');
  });

});
