import { describeOperationCases, expectScopedProperties } from '../../testing';
import { httpClient } from '../../utils';
import { FunnelResource } from './funnel.resource';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { getFunnelOptions } from './shared';

describe('funnel operations', (): void => {
  describeOperationCases([
    {
      label: 'lists funnels',
      operation: new ListOperation('funnel'),
      parameters: {},
      method: 'get',
      response: { data: [{ id: 'funnel-1' }] },
      expectedRequest: ['funnels'],
      expectedJson: { data: [{ id: 'funnel-1' }] },
    },
    {
      label: 'gets a funnel',
      operation: new GetOperation('funnel'),
      parameters: { funnelId: 'funnel-1' },
      method: 'get',
      response: { data: { id: 'funnel-1' } },
      expectedRequest: ['funnels/funnel-1'],
      expectedJson: { id: 'funnel-1' },
    },
  ]);

  it('registers every operation scoped to the resource', (): void => {
    const resource: FunnelResource = new FunnelResource();

    for (const name of ['list', 'get']) {
      expectScopedProperties(resource.getOperation(name), 'funnel');
    }
  });

  it('loads the funnel options', async (): Promise<void> => {
    jest
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce({ data: [{ id: 'funnel-1', name: 'Main' }] });

    await expect(getFunnelOptions.call({} as never)).resolves.toEqual([
      { name: 'Main', value: 'funnel-1' },
    ]);
  });
});
