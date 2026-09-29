import { z } from 'zod';
import { parseOrThrow } from './zod-parse.util';

describe('parseOrThrow', () => {
  const schema = z.object({ id: z.string(), count: z.number() });

  it('returns the parsed data when it matches the schema', () => {
    const data = { id: 'a1', count: 3 };

    expect(parseOrThrow(schema, data)).toEqual(data);
  });

  it('throws a normalized ApiError when the data does not match the schema', () => {
    const invalid = { id: 'a1', count: 'not-a-number' };

    expect(() => parseOrThrow(schema, invalid)).toThrow(
      expect.objectContaining({ kind: 'validation' }),
    );
  });

  it('includes the failing field path in the error message', () => {
    const invalid = { id: 'a1' };

    try {
      parseOrThrow(schema, invalid);
      throw new Error('expected parseOrThrow to throw');
    } catch (error) {
      expect((error as { message: string }).message).toContain('count');
    }
  });
});
