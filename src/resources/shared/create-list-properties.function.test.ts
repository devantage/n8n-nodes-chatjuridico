import { createListProperties } from './create-list-properties.function';

describe('createListProperties', (): void => {
  it('creates the return all and limit properties', (): void => {
    const [returnAll, limit] = createListProperties(100, 20);

    expect(returnAll.name).toBe('returnAll');
    expect(limit.name).toBe('limit');
    expect(limit.typeOptions).toEqual({ minValue: 1, maxValue: 100 });
    expect(limit.default).toBe(20);
    expect(limit.displayOptions).toEqual({ show: { returnAll: [false] } });
  });

  it('caps the default limit to the max limit', (): void => {
    expect(createListProperties(10)[1].default).toBe(10);
  });
});
