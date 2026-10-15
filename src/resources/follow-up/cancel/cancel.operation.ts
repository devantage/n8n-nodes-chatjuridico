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

export class CancelOperation extends ResourceOperation {
  public readonly name: string = 'cancel';

  public readonly displayName: string = 'Cancel';

  public readonly description: string =
    'Cancel a scheduled or processing follow-up';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'followUpId',
        displayName: 'Follow-Up ID',
        description: 'The ID (UUID) of the follow-up',
        type: 'string',
        required: true,
        default: '',
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const followUpId: string = this.getNodeParameter(
      'followUpId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `session-follow-ups/${followUpId}/cancel`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
