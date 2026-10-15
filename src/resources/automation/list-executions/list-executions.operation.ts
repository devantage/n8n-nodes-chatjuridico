import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';
import { automationIdProperty } from '../shared';

export class ListExecutionsOperation extends ResourceOperation {
  public readonly name: string = 'listExecutions';

  public readonly displayName: string = 'List Executions';

  public readonly description: string =
    'List the execution history of an automation';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [automationIdProperty, ...createListProperties(200, 50)],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const automationId: string = this.getNodeParameter(
      'automationId',
      itemIndex,
    ) as string;

    return {
      json: await getListResults.call(
        this,
        itemIndex,
        `automations/${automationId}/executions`,
        {},
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
