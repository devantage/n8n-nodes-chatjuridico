import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';
import { simulationIdProperty } from '../shared';

export class ListMessagesOperation extends ResourceOperation {
  public readonly name: string = 'listMessages';

  public readonly displayName: string = 'List Messages';

  public readonly description: string =
    'List the messages of an AI agent simulation session';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [simulationIdProperty, ...createListProperties(200, 100)],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const simulationId: string = this.getNodeParameter(
      'simulationId',
      itemIndex,
    ) as string;

    return {
      json: await getListResults.call(
        this,
        itemIndex,
        `simulations/${simulationId}/messages`,
        {},
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
