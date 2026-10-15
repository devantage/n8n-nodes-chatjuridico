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

  public readonly description: string =
    'Open the conversation of a contact on its WhatsApp number';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'contactId',
        displayName: 'Contact ID',
        description:
          'The ID (UUID) of the contact. If the contact already has a conversation, it is returned.',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'instanceId',
        displayName: 'WhatsApp Number Name or ID',
        description:
          'WhatsApp number the contact belongs to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getInstanceOptions',
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
    const contactId: string = this.getNodeParameter(
      'contactId',
      itemIndex,
    ) as string;

    const instanceId: string = this.getNodeParameter(
      'instanceId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'conversations',
      { contact_id: contactId, instance_id: instanceId },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
