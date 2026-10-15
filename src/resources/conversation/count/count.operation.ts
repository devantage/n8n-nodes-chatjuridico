import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiResponse,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { conversationCountFilters, getConversationQuery } from '../shared';

export class CountOperation extends ResourceOperation {
  public readonly name: string = 'count';

  public readonly displayName: string = 'Count';

  public readonly description: string =
    'Count the conversations matching the filters';

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
        options: conversationCountFilters,
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
      'conversations/count',
      getConversationQuery(filters),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
