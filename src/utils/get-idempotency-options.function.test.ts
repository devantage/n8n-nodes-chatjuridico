import { getIdempotencyOptions } from './get-idempotency-options.function';

describe('getIdempotencyOptions', (): void => {
  it('builds the idempotency header', (): void => {
    expect(getIdempotencyOptions('key-1')).toEqual({
      headers: { 'X-Idempotency-Key': 'key-1' },
    });
  });

  it('returns undefined without a key', (): void => {
    expect(getIdempotencyOptions('')).toBeUndefined();
    expect(getIdempotencyOptions(undefined)).toBeUndefined();
  });
});
