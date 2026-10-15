import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiResponse,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { tagIdProperty } from '../shared';

export class GetOperation extends ResourceOperation {
  public readonly name: string = 'get';

  public readonly displayName: string = 'Get';

  public readonly description: string = 'Get a tag';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [tagIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const tagId: string = this.getNodeParameter('tagId', itemIndex) as string;

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      `tags/${tagId}`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
