import { compactObject } from './compact-object.function';

describe('compactObject', (): void => {
  it('removes undefined and empty string values', (): void => {
    expect(
      compactObject({
        name: 'João',
        email: '',
        phone: undefined,
      }),
    ).toEqual({ name: 'João' });
  });

  it('keeps null, false and zero values', (): void => {
    expect(
      compactObject({
        accountable_id: null,
        is_archived: false,
        count: 0,
      }),
    ).toEqual({
      accountable_id: null,
      is_archived: false,
      count: 0,
    });
  });
});
