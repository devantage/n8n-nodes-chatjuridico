import { describeOperationCases, expectScopedProperties } from '../../testing';
import { ActivateOperation } from './activate';
import { AiAgentResource } from './ai-agent.resource';
import { DeactivateOperation } from './deactivate';
import { GetStatusOperation } from './get-status';

describe('aiAgent operations', (): void => {
  describeOperationCases([
    {
      label: 'gets the agent status of a conversation',
      operation: new GetStatusOperation('aiAgent'),
      parameters: { conversationId: 'chat-1' },
      method: 'get',
      response: { data: { conversation_id: 'chat-1', agent_is_active: true } },
      expectedRequest: ['conversations/chat-1/agent-status'],
      expectedJson: { conversation_id: 'chat-1', agent_is_active: true },
    },
    {
      label: 'activates the agent in a conversation',
      operation: new ActivateOperation('aiAgent'),
      parameters: { conversationId: 'chat-1' },
      method: 'post',
      response: { data: { conversation_id: 'chat-1', agent_is_active: true } },
      expectedRequest: ['conversations/chat-1/agent/activate'],
      expectedJson: { conversation_id: 'chat-1', agent_is_active: true },
    },
    {
      label: 'deactivates the agent in a conversation',
      operation: new DeactivateOperation('aiAgent'),
      parameters: { conversationId: 'chat-1' },
      method: 'post',
      response: { data: { conversation_id: 'chat-1', agent_is_active: false } },
      expectedRequest: ['conversations/chat-1/agent/deactivate'],
      expectedJson: { conversation_id: 'chat-1', agent_is_active: false },
    },
  ]);

  it('registers every operation scoped to the resource', (): void => {
    const resource: AiAgentResource = new AiAgentResource();

    for (const name of ['getStatus', 'activate', 'deactivate']) {
      expectScopedProperties(resource.getOperation(name), 'aiAgent');
    }
  });
});
