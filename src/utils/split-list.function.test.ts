import { splitList } from './split-list.function';

describe('splitList', (): void => {
  it('splits and trims comma separated values', (): void => {
    expect(splitList(' lead, vip ,,trabalhista ')).toEqual([
      'lead',
      'vip',
      'trabalhista',
    ]);
  });

  it('normalizes arrays', (): void => {
    expect(splitList([' a ', '', 'b'])).toEqual(['a', 'b']);
  });

  it('returns an empty list for undefined values', (): void => {
    expect(splitList(undefined)).toEqual([]);
  });
});
