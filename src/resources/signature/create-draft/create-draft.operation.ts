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
import {
  fileNameField,
  fileTypeField,
  parseSignersJson,
  providerField,
  signersJsonDescription,
} from '../shared';

export class CreateDraftOperation extends ResourceOperation {
  public readonly name: string = 'createDraft';

  public readonly displayName: string = 'Create Draft';

  public readonly description: string =
    'Create or update a draft document without sending it for signature';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'name',
        displayName: 'Name',
        description: 'Name of the document',
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
        name: 'chatId',
        displayName: 'Conversation ID',
        description: 'The ID (UUID) of the conversation',
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
            name: 'draft_id',
            displayName: 'Draft ID',
            description:
              'ID of an existing draft to update instead of creating a new one. Its signers are replaced when signers are given.',
            type: 'string',
            default: '',
          },
          {
            name: 'file_url',
            displayName: 'File URL',
            description:
              'Public URL of the file (PDF or DOCX). It can also be uploaded later.',
            type: 'string',
            default: '',
          },
          fileNameField,
          fileTypeField,
          providerField,
          {
            name: 'signers',
            displayName: 'Signers (JSON)',
            description: signersJsonDescription,
            type: 'json',
            default: '[]',
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

    const chatId: string = this.getNodeParameter('chatId', itemIndex) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const signers: IDataObject[] | undefined =
      additionalFields.signers !== undefined && additionalFields.signers !== ''
        ? parseSignersJson.call(this, additionalFields.signers, itemIndex)
        : undefined;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'signatures/drafts',
      compactObject({
        ...additionalFields,
        name,
        contact_id: contactId,
        chat_id: chatId,
        signers: signers?.length ? signers : undefined,
      }),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
