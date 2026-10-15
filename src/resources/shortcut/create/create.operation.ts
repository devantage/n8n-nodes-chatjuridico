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

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string = 'Create a message shortcut';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'trigger',
        displayName: 'Trigger',
        description: 'Shortcut trigger, 1 to 50 characters (e.g. /greeting)',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'message',
        displayName: 'Message',
        description: 'Message text, 1 to 2000 characters',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: '',
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const trigger: string = this.getNodeParameter(
      'trigger',
      itemIndex,
    ) as string;

    const message: string = this.getNodeParameter(
      'message',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'shortcuts',
      { trigger, message },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
