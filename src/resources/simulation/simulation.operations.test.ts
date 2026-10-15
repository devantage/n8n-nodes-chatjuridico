import { describeOperationCases, expectScopedProperties } from '../../testing';
import { CreateOperation } from './create';
import { EndOperation } from './end';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { ListMessagesOperation } from './list-messages';
import { SendMessageOperation } from './send-message';
import { SimulationResource } from './simulation.resource';

describe('simulation operations', (): void => {
  describeOperationCases([
    {
      label: 'lists simulations with filters',
      operation: new ListOperation('simulation'),
      parameters: {
        returnAll: false,
        limit: 10,
        filters: { state: 'completed', agent_id: '' },
      },
      method: 'get',
      response: { data: [{ id: 'simulation-1' }], pagination: {} },
      expectedRequest: ['simulations', { state: 'completed', limit: 10 }],
      expectedJson: { data: [{ id: 'simulation-1' }], pagination: {} },
    },
    {
      label: 'creates a simulation',
      operation: new CreateOperation('simulation'),
      parameters: {
        instanceId: 'instance-1',
        additionalFields: {
          agent_id: 'agent-1',
          simulation_purpose: '',
          contact_name: 'Maria',
        },
      },
      method: 'post',
      response: { data: { id: 'simulation-1' } },
      expectedRequest: [
        'simulations',
        {
          agent_id: 'agent-1',
          contact_name: 'Maria',
          instance_id: 'instance-1',
        },
      ],
      expectedJson: { id: 'simulation-1' },
    },
    {
      label: 'gets a simulation',
      operation: new GetOperation('simulation'),
      parameters: { simulationId: 'simulation-1' },
      method: 'get',
      response: { data: { id: 'simulation-1' } },
      expectedRequest: ['simulations/simulation-1'],
      expectedJson: { id: 'simulation-1' },
    },
    {
      label: 'lists simulation messages',
      operation: new ListMessagesOperation('simulation'),
      parameters: {
        simulationId: 'simulation-1',
        returnAll: false,
        limit: 100,
      },
      method: 'get',
      response: { data: [{ id: 'message-1' }], pagination: {} },
      expectedRequest: ['simulations/simulation-1/messages', { limit: 100 }],
      expectedJson: { data: [{ id: 'message-1' }], pagination: {} },
    },
    {
      label: 'sends a simulation message',
      operation: new SendMessageOperation('simulation'),
      parameters: {
        simulationId: 'simulation-1',
        messageText: 'Hello',
        additionalFields: { message_type: 'text' },
      },
      method: 'post',
      response: { data: { id: 'message-1' } },
      expectedRequest: [
        'simulations/simulation-1/messages',
        { message_type: 'text', message_text: 'Hello' },
      ],
      expectedJson: { id: 'message-1' },
    },
    {
      label: 'ends a simulation',
      operation: new EndOperation('simulation'),
      parameters: { simulationId: 'simulation-1' },
      method: 'post',
      response: { data: { id: 'simulation-1', state: 'completed' } },
      expectedRequest: ['simulations/simulation-1/end'],
      expectedJson: { id: 'simulation-1', state: 'completed' },
    },
  ]);

  it('registers every operation scoped to the resource', (): void => {
    const resource: SimulationResource = new SimulationResource();

    for (const name of [
      'list',
      'create',
      'get',
      'listMessages',
      'sendMessage',
      'end',
    ]) {
      expectScopedProperties(resource.getOperation(name), 'simulation');
    }
  });
});
