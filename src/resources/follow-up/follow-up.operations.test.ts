import { describeOperationCases, expectScopedProperties } from '../../testing';
import { CancelOperation } from './cancel';
import { FollowUpResource } from './follow-up.resource';
import { ListOperation } from './list';

describe('followUp operations', (): void => {
  describeOperationCases([
    {
      label: 'lists follow-ups with filters',
      operation: new ListOperation('followUp'),
      parameters: {
        returnAll: false,
        limit: 20,
        filters: {
          session_id: 'session-1',
          status: 'sent',
          date_start: '',
          date_end: '2026-02-01T00:00:00',
        },
      },
      method: 'get',
      response: { data: [{ id: 'follow-up-1' }], pagination: {} },
      expectedRequest: [
        'session-follow-ups',
        {
          session_id: 'session-1',
          status: 'sent',
          date_end: '2026-02-01T00:00:00',
          limit: 20,
        },
      ],
      expectedJson: { data: [{ id: 'follow-up-1' }], pagination: {} },
    },
    {
      label: 'cancels a follow-up',
      operation: new CancelOperation('followUp'),
      parameters: { followUpId: 'follow-up-1' },
      method: 'post',
      response: { data: { id: 'follow-up-1', status: 'cancelled' } },
      expectedRequest: ['session-follow-ups/follow-up-1/cancel'],
      expectedJson: { id: 'follow-up-1', status: 'cancelled' },
    },
  ]);

  it('registers every operation scoped to the resource', (): void => {
    const resource: FollowUpResource = new FollowUpResource();

    for (const name of ['list', 'cancel']) {
      expectScopedProperties(resource.getOperation(name), 'followUp');
    }
  });
});
