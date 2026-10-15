import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiResponse,
  compactObject,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { agentSessionFilters } from '../shared';

export class CountOperation extends ResourceOperation {
  public readonly name: string = 'count';

  public readonly displayName: string = 'Count';

  public readonly description: string =
    'Get the exact number of AI agent sessions matching the filters';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'filters',
        displayName: 'Filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        options: agentSessionFilters,
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const filters: IDataObject = this.getNodeParameter(
      'filters',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'agent-sessions/count',
      compactObject(filters),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
