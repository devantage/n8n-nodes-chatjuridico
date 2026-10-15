import { TestUtil } from '@devantage/n8n-custom-nodes-framework';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { httpClient } from '../../utils';
import { AgentSessionResource } from './agent-session.resource';
import { CompleteOperation } from './complete';
import { CountOperation } from './count';
import { DailyCountOperation } from './daily-count';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { ListEvaluationsOperation } from './list-evaluations';
import { ListLogsOperation } from './list-logs';
import { SendFeedbackOperation } from './send-feedback';

describe('agentSession operations', (): void => {
  describeOperationCases([
    {
      label: 'lists sessions with filters',
      operation: new ListOperation('agentSession'),
      parameters: {
        returnAll: false,
        limit: 25,
        filters: {
          state: 'ongoing',
          agent_id: 'agent-1',
          chat_id: 'chat-1',
          contact_id: '',
          date_start: '2026-01-01T00:00:00',
        },
      },
      method: 'get',
      response: { data: [{ id: 'session-1' }], pagination: {} },
      expectedRequest: [
        'agent-sessions',
        {
          state: 'ongoing',
          agent_id: 'agent-1',
          chat_id: 'chat-1',
          date_start: '2026-01-01T00:00:00',
          limit: 25,
        },
      ],
      expectedJson: { data: [{ id: 'session-1' }], pagination: {} },
    },
    {
      label: 'counts sessions',
      operation: new CountOperation('agentSession'),
      parameters: { filters: { state: 'completed', agent_id: '' } },
      method: 'get',
      response: { data: { count: 7 } },
      expectedRequest: ['agent-sessions/count', { state: 'completed' }],
      expectedJson: { count: 7 },
    },
    {
      label: 'counts sessions by day',
      operation: new DailyCountOperation('agentSession'),
      parameters: {
        dateStart: '2026-01-01T00:00:00',
        dateEnd: '2026-01-31T23:59:59',
      },
      method: 'get',
      response: { data: [{ date: '2026-01-01', total: 3 }] },
      expectedRequest: [
        'agent-sessions/daily-count',
        { date_start: '2026-01-01T00:00:00', date_end: '2026-01-31T23:59:59' },
      ],
      expectedJson: { data: [{ date: '2026-01-01', total: 3 }] },
    },
    {
      label: 'gets a session',
      operation: new GetOperation('agentSession'),
      parameters: { sessionId: 'session-1' },
      method: 'get',
      response: { data: { id: 'session-1' } },
      expectedRequest: ['agent-sessions/session-1'],
      expectedJson: { id: 'session-1' },
    },
    {
      label: 'completes a session with a reason',
      operation: new CompleteOperation('agentSession'),
      parameters: {
        sessionId: 'session-1',
        additionalFields: { completed_reason: 'Stuck' },
      },
      method: 'post',
      response: { data: { id: 'session-1', state: 'completed' } },
      expectedRequest: [
        'agent-sessions/session-1/complete',
        { completed_reason: 'Stuck' },
      ],
      expectedJson: { id: 'session-1', state: 'completed' },
    },
    {
      label: 'completes a session without a reason',
      operation: new CompleteOperation('agentSession'),
      parameters: { sessionId: 'session-1', additionalFields: {} },
      method: 'post',
      response: { data: { id: 'session-1' } },
      expectedRequest: ['agent-sessions/session-1/complete', {}],
      expectedJson: { id: 'session-1' },
    },
    {
      label: 'sends feedback',
      operation: new SendFeedbackOperation('agentSession'),
      parameters: {
        sessionId: 'session-1',
        rating: 4,
        additionalFields: { user_feedback: 'Good' },
      },
      method: 'post',
      response: { data: { id: 'session-1' } },
      expectedRequest: [
        'agent-sessions/session-1/feedback',
        { user_feedback: 'Good', rating: 4 },
      ],
      expectedJson: { id: 'session-1' },
    },
    {
      label: 'lists evaluations',
      operation: new ListEvaluationsOperation('agentSession'),
      parameters: { sessionId: 'session-1' },
      method: 'get',
      response: { data: [{ id: 'evaluation-1' }] },
      expectedRequest: ['agent-sessions/session-1/evaluations'],
      expectedJson: { data: [{ id: 'evaluation-1' }] },
    },
    {
      label: 'lists logs',
      operation: new ListLogsOperation('agentSession'),
      parameters: { sessionId: 'session-1', returnAll: false, limit: 100 },
      method: 'get',
      response: { data: [{ id: 'log-1' }], pagination: {} },
      expectedRequest: ['agent-sessions/session-1/logs', { limit: 100 }],
      expectedJson: { data: [{ id: 'log-1' }], pagination: {} },
    },
  ]);

  it('fetches every log page when returning all', async (): Promise<void> => {
    const requestSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce({
        data: [{ id: 'log-1' }],
        pagination: { has_more: true, next_cursor: 'cursor-1', limit: 200 },
      })
      .mockResolvedValueOnce({
        data: [{ id: 'log-2' }],
        pagination: { has_more: false, next_cursor: null, limit: 200 },
      });
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        sessionId: 'session-1',
        returnAll: true,
      });

    await expect(
      new ListLogsOperation('agentSession').execute.call(context as never, 0),
    ).resolves.toEqual({
      json: { data: [{ id: 'log-1' }, { id: 'log-2' }] },
      pairedItem: 0,
    });
    expect(requestSpy).toHaveBeenLastCalledWith(
      context,
      'agent-sessions/session-1/logs',
      { limit: 200, cursor: 'cursor-1' },
    );
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: AgentSessionResource = new AgentSessionResource();

    for (const name of [
      'list',
      'count',
      'dailyCount',
      'get',
      'complete',
      'sendFeedback',
      'listEvaluations',
      'listLogs',
    ]) {
      expectScopedProperties(resource.getOperation(name), 'agentSession');
    }
  });
});
