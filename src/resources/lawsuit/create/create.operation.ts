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
import { clientPoloField, cnjProperty } from '../shared';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string =
    'Register a lawsuit in the office and optionally bind it to a conversation';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        ...cnjProperty,
        description:
          'Lawsuit CNJ number, formatted (NNNNNNN-DD.AAAA.J.TR.OOOO) or with 20 digits. It is looked up in the public database (paid query).',
      },
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'conversation_id',
            displayName: 'Conversation ID',
            description: 'Bind the lawsuit to this conversation',
            type: 'string',
            default: '',
          },
          {
            name: 'contact_id',
            displayName: 'Contact ID',
            description:
              'Bind the lawsuit to the main conversation of this contact',
            type: 'string',
            default: '',
          },
          clientPoloField,
          {
            name: 'monitoring_frequency',
            displayName: 'Monitoring Frequency',
            description:
              'Monitoring frequency of the lawsuit. Monitoring is not available for every office yet, check the `monitoring` field of the response.',
            type: 'options',
            options: [
              { name: 'High', value: 'ALTA' },
              { name: 'Medium', value: 'MEDIA' },
              { name: 'Low', value: 'BAIXA' },
            ],
            default: 'MEDIA',
          },
          {
            name: 'set_as_active',
            displayName: 'Set as Active',
            description:
              'Whether to set the lawsuit as the active one of the bound conversation',
            type: 'boolean',
            default: false,
          },
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const cnj: string = this.getNodeParameter('cnj', itemIndex) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'lawsuits',
      compactObject({ ...additionalFields, cnj: cnj.trim() }),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
