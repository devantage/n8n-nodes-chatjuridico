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
  getIdempotencyOptions,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import {
  fileNameField,
  fileTypeField,
  fileUrlProperty,
  getSigners,
  providerField,
  signerInputProperties,
} from '../shared';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create and Send';

  public readonly description: string =
    'Create a document and send it for signature';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'name',
        displayName: 'Name',
        description:
          'Name of the document. An identical request within 24 hours returns the previous document instead of creating a new one, so change the name to send a new document.',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'contactId',
        displayName: 'Contact ID',
        description: 'The ID (UUID) of the contact (client)',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'instanceId',
        displayName: 'WhatsApp Number Name or ID',
        description:
          'WhatsApp number used to resolve the conversation. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getInstanceOptions',
        },
        required: true,
        default: '',
      },
      fileUrlProperty,
      ...signerInputProperties,
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [fileNameField, fileTypeField, providerField],
      },
      {
        name: 'options',
        displayName: 'Options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            name: 'idempotencyKey',
            displayName: 'Idempotency Key',
            description:
              'Unique key that prevents the document from being created twice when the request is retried',
            type: 'string',
            default: '',
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

    const contactId: string = this.getNodeParameter(
      'contactId',
      itemIndex,
    ) as string;

    const instanceId: string = this.getNodeParameter(
      'instanceId',
      itemIndex,
    ) as string;

    const fileUrl: string = this.getNodeParameter(
      'fileUrl',
      itemIndex,
    ) as string;

    const signers: IDataObject[] = getSigners.call(this, itemIndex);

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const options: IDataObject = this.getNodeParameter(
      'options',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'signatures',
      compactObject({
        ...additionalFields,
        name,
        contact_id: contactId,
        instance_id: instanceId,
        file_url: fileUrl,
        signers,
      }),
      undefined,
      getIdempotencyOptions(options.idempotencyKey as string | undefined),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
