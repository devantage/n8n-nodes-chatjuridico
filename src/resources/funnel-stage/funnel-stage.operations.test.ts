import { TestUtil } from '@devantage/n8n-custom-nodes-framework';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { httpClient } from '../../utils';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { FunnelStageResource } from './funnel-stage.resource';
import { GetOperation } from './get';
import { ListOperation } from './list';
import { getFunnelStageOptions } from './shared';
import { UpdateOperation } from './update';

describe('funnel stage operations', (): void => {
  describeOperationCases([
    {
      label: 'lists funnel stages of a funnel',
      operation: new ListOperation('funnelStage'),
      parameters: { filters: { funnel_id: 'funnel-1' } },
      method: 'get',
      response: { data: [{ id: 'stage-1' }] },
      expectedRequest: ['funnel-stages', { funnel_id: 'funnel-1' }],
      expectedJson: { data: [{ id: 'stage-1' }] },
    },
    {
      label: 'gets a funnel stage',
      operation: new GetOperation('funnelStage'),
      parameters: { stageId: 'stage-1' },
      method: 'get',
      response: { data: { id: 'stage-1' } },
      expectedRequest: ['funnel-stages/stage-1'],
      expectedJson: { id: 'stage-1' },
    },
    {
      label: 'creates a funnel stage',
      operation: new CreateOperation('funnelStage'),
      parameters: {
        name: 'Qualificação',
        additionalFields: { color_hex: '#3B82F6', funnel_id: '' },
      },
      method: 'post',
      response: { data: { id: 'stage-1' } },
      expectedRequest: [
        'funnel-stages',
        { name: 'Qualificação', color_hex: '#3B82F6' },
      ],
      expectedJson: { id: 'stage-1' },
    },
    {
      label: 'updates a funnel stage',
      operation: new UpdateOperation('funnelStage'),
      parameters: { stageId: 'stage-1', updateFields: { is_active: false } },
      method: 'patch',
      response: { data: { id: 'stage-1' } },
      expectedRequest: [
        'funnel-stages/stage-1',
        undefined,
        { is_active: false },
      ],
      expectedJson: { id: 'stage-1' },
    },
    {
      label: 'deletes a funnel stage',
      operation: new DeleteOperation('funnelStage'),
      parameters: { stageId: 'stage-1' },
      method: 'delete',
      response: { data: { deleted: true } },
      expectedRequest: ['funnel-stages/stage-1'],
      expectedJson: { deleted: true },
    },
  ]);

  it('requires at least one field to update', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        stageId: 'stage-1',
        updateFields: {},
      });

    await expect(
      new UpdateOperation('funnelStage').execute.call(context as never, 0),
    ).rejects.toThrow('Please add at least one field to update');
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: FunnelStageResource = new FunnelStageResource();

    for (const name of ['list', 'get', 'create', 'update', 'delete']) {
      expectScopedProperties(resource.getOperation(name), 'funnelStage');
    }
  });

  it('loads the funnel stage options', async (): Promise<void> => {
    jest
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce({ data: [{ id: 'stage-1', name: 'Novo Lead' }] });

    await expect(getFunnelStageOptions.call({} as never)).resolves.toEqual([
      { name: 'Novo Lead', value: 'stage-1' },
    ]);
  });
});
