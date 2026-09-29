import { NaiveUtcDateParser } from './date-parser';

describe('NaiveUtcDateParser', () => {
  const parser = new NaiveUtcDateParser();

  it('parses a naive "YYYY-MM-DD HH:mm:ss.SSS" date string as UTC', () => {
    expect(parser.parse('2026-09-28 12:30:28.612').toISOString()).toBe('2026-09-28T12:30:28.612Z');
  });

  it('leaves an already-UTC ISO string (with Z) untouched', () => {
    expect(parser.parse('2026-09-28T12:30:28.612Z').toISOString()).toBe('2026-09-28T12:30:28.612Z');
  });

  it('leaves a string with an explicit offset untouched', () => {
    expect(parser.parse('2026-09-28T16:30:28.612+04:00').toISOString()).toBe('2026-09-28T12:30:28.612Z');
  });
});
