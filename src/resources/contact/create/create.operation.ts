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
  splitList,
  withOperationDisplayOptions,
} from '../../../utils';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string = 'Create a contact';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'name',
        displayName: 'Name',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'phone',
        displayName: 'Phone',
        description:
          'Phone in international format without special characters (e.g. 5511999998888)',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'tags',
            displayName: 'Tags',
            description: 'Comma separated list of tags',
            type: 'string',
            default: '',
          },
          {
            name: 'stage_id',
            displayName: 'Funnel Stage Name or ID',
            description:
              'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
            type: 'options',
            typeOptions: {
              loadOptionsMethod: 'getFunnelStageOptions',
            },
            default: '',
          },
          {
            name: 'source',
            displayName: 'Source',
            description: 'Contact origin (whatsapp, api, manual, etc.)',
            type: 'string',
            default: 'api',
          },
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const name: string = this.getNodeParameter('name', itemIndex) as string;

    const phone: string = this.getNodeParameter('phone', itemIndex) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const body: IDataObject = compactObject({
      ...additionalFields,
      name,
      phone,
      tags:
        additionalFields.tags !== undefined
          ? splitList(additionalFields.tags as string)
          : undefined,
    });

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'contacts',
      body,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
