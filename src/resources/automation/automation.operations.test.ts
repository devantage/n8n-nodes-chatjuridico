import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import { NodeOperationError } from 'n8n-workflow';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { AutomationResource } from './automation.resource';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { GetOperation } from './get';
import { GetExecutionStatsOperation } from './get-execution-stats';
import { ListOperation } from './list';
import { ListExecutionsOperation } from './list-executions';
import { ToggleOperation } from './toggle';
import { UpdateOperation } from './update';

const flowJson: object = {
  version: 0,
  nodes: [
    { id: 'trigger', type: 'trigger', position: { x: 0, y: 0 }, data: {} },
  ],
  edges: [],
};

describe('automation operations', (): void => {
  describeOperationCases([
    {
      label: 'lists automations with filters',
      operation: new ListOperation('automation'),
      parameters: {
        returnAll: false,
        limit: 20,
        filters: { instance_id: 'instance-1', is_active: false },
      },
      method: 'get',
      response: { data: [{ id: 'automation-1' }], pagination: {} },
      expectedRequest: [
        'automations',
        { instance_id: 'instance-1', is_active: false, limit: 20 },
      ],
      expectedJson: { data: [{ id: 'automation-1' }], pagination: {} },
    },
    {
      label: 'gets an automation',
      operation: new GetOperation('automation'),
      parameters: { automationId: 'automation-1' },
      method: 'get',
      response: { data: { id: 'automation-1' } },
      expectedRequest: ['automations/automation-1'],
      expectedJson: { id: 'automation-1' },
    },
    {
      label: 'creates an automation',
      operation: new CreateOperation('automation'),
      parameters: {
        name: 'Boas-vindas',
        instanceId: 'instance-1',
        additionalFields: {
          description: '',
          flow_json: JSON.stringify(flowJson),
          is_active: false,
        },
      },
      method: 'post',
      response: { data: { id: 'automation-1' } },
      expectedRequest: [
        'automations',
        {
          name: 'Boas-vindas',
          instance_id: 'instance-1',
          flow_json: flowJson,
          is_active: false,
        },
      ],
      expectedJson: { id: 'automation-1' },
    },
    {
      label: 'updates an automation',
      operation: new UpdateOperation('automation'),
      parameters: {
        automationId: 'automation-1',
        updateFields: { name: 'Nova', is_active: true },
      },
      method: 'patch',
      response: { data: { id: 'automation-1' } },
      expectedRequest: [
        'automations/automation-1',
        undefined,
        { name: 'Nova', is_active: true },
      ],
      expectedJson: { id: 'automation-1' },
    },
    {
      label: 'deletes an automation returning a body',
      operation: new DeleteOperation('automation'),
      parameters: { automationId: 'automation-1' },
      method: 'delete',
      response: { data: { deleted: true, id: 'automation-1' } },
      expectedRequest: ['automations/automation-1'],
      expectedJson: { deleted: true, id: 'automation-1' },
    },
    {
      label: 'deletes an automation without a response body',
      operation: new DeleteOperation('automation'),
      parameters: { automationId: 'automation-1' },
      method: 'delete',
      response: undefined,
      expectedRequest: ['automations/automation-1'],
      expectedJson: { deleted: true },
    },
    {
      label: 'toggles an automation',
      operation: new ToggleOperation('automation'),
      parameters: { automationId: 'automation-1' },
      method: 'post',
      response: { data: { id: 'automation-1', is_active: true } },
      expectedRequest: ['automations/automation-1/toggle'],
      expectedJson: { id: 'automation-1', is_active: true },
    },
    {
      label: 'lists the automation executions',
      operation: new ListExecutionsOperation('automation'),
      parameters: { automationId: 'automation-1', returnAll: false, limit: 5 },
      method: 'get',
      response: { data: [{ id: 'execution-1' }], pagination: {} },
      expectedRequest: ['automations/automation-1/executions', { limit: 5 }],
      expectedJson: { data: [{ id: 'execution-1' }], pagination: {} },
    },
    {
      label: 'gets the automation execution stats',
      operation: new GetExecutionStatsOperation('automation'),
      parameters: { automationId: 'automation-1' },
      method: 'get',
      response: { data: { total_executions: 10, successful: 9 } },
      expectedRequest: ['automations/automation-1/executions/stats'],
      expectedJson: { total_executions: 10, successful: 9 },
    },
  ]);

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        automationId: 'automation-1',
        updateFields: { description: '' },
      });

    await expect(
      new UpdateOperation('automation').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });

  it('rejects an invalid flow JSON', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        automationId: 'automation-1',
        updateFields: { flow_json: '{invalid' },
      });

    await expect(
      new UpdateOperation('automation').execute.call(context as never, 0),
    ).rejects.toThrow(NodeOperationError);
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: AutomationResource = new AutomationResource();

    for (const name of [
      'list',
      'get',
      'create',
      'update',
      'delete',
      'toggle',
      'listExecutions',
      'getExecutionStats',
    ]) {
      expectScopedProperties(resource.getOperation(name), 'automation');
    }
  });
});
