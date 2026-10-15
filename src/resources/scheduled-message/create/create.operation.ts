import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import {
  type IDataObject,
  type IExecuteFunctions,
  type INodeExecutionData,
  type INodeProperties,
  NodeOperationError,
} from 'n8n-workflow';

import {
  type ApiResponse,
  compactObject,
  getIdempotencyOptions,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { conversationIdProperty } from '../../conversation/shared';
import {
  getTemplateParameters,
  templateParametersProperty,
} from '../../message/shared';

const MEDIA_TYPES: string[] = ['image', 'document', 'audio', 'video'];

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string =
    'Schedule a message to be sent in a conversation';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      conversationIdProperty,
      {
        name: 'scheduledAt',
        displayName: 'Scheduled At',
        description: 'When to send the message (must be in the future)',
        type: 'dateTime',
        required: true,
        default: '',
      },
      {
        name: 'messageType',
        displayName: 'Type',
        type: 'options',
        options: [
          { name: 'Text', value: 'text' },
          { name: 'Image', value: 'image' },
          { name: 'Document', value: 'document' },
          { name: 'Audio', value: 'audio' },
          { name: 'Video', value: 'video' },
          {
            name: 'Template',
            value: 'template',
            description:
              'Meta approved template, required to send after the 24h window closes on Meta numbers',
          },
        ],
        default: 'text',
      },
      {
        name: 'text',
        displayName: 'Text',
        description:
          'Message text. Required for text messages and used as caption for media.',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        displayOptions: {
          hide: {
            messageType: ['template'],
          },
        },
        default: '',
      },
      {
        name: 'fileUrl',
        displayName: 'File URL',
        description:
          'Public URL of the media file (e.g. the `media_url` returned by Media > Upload)',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            messageType: MEDIA_TYPES,
          },
        },
        default: '',
      },
      {
        name: 'templateName',
        displayName: 'Template Name',
        description: 'Name of the template approved by Meta',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            messageType: ['template'],
          },
        },
        default: '',
      },
      {
        name: 'templateLanguage',
        displayName: 'Template Language',
        description: 'Language code of the template (e.g. pt_BR, en_US)',
        type: 'string',
        displayOptions: {
          show: {
            messageType: ['template'],
          },
        },
        default: 'pt_BR',
      },
      {
        ...templateParametersProperty,
        displayOptions: {
          show: {
            messageType: ['template'],
          },
        },
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
              'Unique key sent as the X-Idempotency-Key header, so retries do not schedule the message twice',
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
    const conversationId: string = this.getNodeParameter(
      'conversationId',
      itemIndex,
    ) as string;

    const scheduledAt: string = this.getNodeParameter(
      'scheduledAt',
      itemIndex,
    ) as string;

    const messageType: string = this.getNodeParameter(
      'messageType',
      itemIndex,
    ) as string;

    const options: IDataObject = this.getNodeParameter(
      'options',
      itemIndex,
      {},
    );

    const body: IDataObject = {
      conversation_id: conversationId,
      scheduled_at: scheduledAt,
      message_type: messageType,
    };

    if (messageType === 'template') {
      body.template_name = this.getNodeParameter('templateName', itemIndex);
      body.template_language = this.getNodeParameter(
        'templateLanguage',
        itemIndex,
        'pt_BR',
      );
      body.template_parameters = getTemplateParameters(
        this.getNodeParameter(
          'templateParameters',
          itemIndex,
          {},
        ) as IDataObject,
      );
    } else {
      body.text = this.getNodeParameter('text', itemIndex, '');
    }

    if (messageType === 'text' && !body.text) {
      throw new NodeOperationError(
        this.getNode(),
        'Text is required for text messages',
        { itemIndex },
      );
    }

    if (MEDIA_TYPES.includes(messageType)) {
      body.file_url = this.getNodeParameter('fileUrl', itemIndex);
    }

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'scheduled-messages',
      compactObject(body),
      undefined,
      getIdempotencyOptions(options.idempotencyKey as string | undefined),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
