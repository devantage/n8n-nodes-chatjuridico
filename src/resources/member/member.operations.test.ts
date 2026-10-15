import { describeOperationCases, expectScopedProperties } from '../../testing';
import { httpClient } from '../../utils';
import { ListOperation } from './list';
import { MemberResource } from './member.resource';
import { getMemberOptions } from './shared';

describe('member operations', (): void => {
  describeOperationCases([
    {
      label: 'lists office members',
      operation: new ListOperation('member'),
      parameters: {},
      method: 'get',
      response: { data: [{ id: 'member-1' }] },
      expectedRequest: ['members'],
      expectedJson: { data: [{ id: 'member-1' }] },
    },
  ]);

  it('registers every operation scoped to the resource', (): void => {
    expectScopedProperties(new MemberResource().getOperation('list'), 'member');
  });

  it('loads the member options', async (): Promise<void> => {
    jest
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce({ data: [{ id: 'member-1', name: 'João' }] });

    await expect(getMemberOptions.call({} as never)).resolves.toEqual([
      { name: 'João', value: 'member-1' },
    ]);
  });
});
