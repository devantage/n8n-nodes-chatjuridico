import { resourceRegistry } from './index';

describe('resources index', (): void => {
  it('exposes the resource registry', (): void => {
    expect(resourceRegistry.getResource('contact').name).toBe('contact');
  });
});
