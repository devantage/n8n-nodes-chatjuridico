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
  parseJson,
  withOperationDisplayOptions,
} from '../../../utils';
import { conversationIdProperty } from '../../conversation/shared';
import { getTemplateParameters, templateParametersProperty } from '../shared';

const MEDIA_TYPES: string[] = ['image', 'document', 'audio', 'video'];

function getTemplate(this: IExecuteFunctions, itemIndex: number): IDataObject {
  const inputMode: string = this.getNodeParameter(
    'templateInputMode',
    itemIndex,
    'parameters',
  ) as string;

  const template: IDataObject = {
    name: this.getNodeParameter('templateName', itemIndex),
    language: this.getNodeParameter('templateLanguage', itemIndex, 'pt_BR'),
  };

  if (inputMode === 'components') {
    const components: unknown = parseJson.call(
      this,
      this.getNodeParameter('templateComponents', itemIndex),
      'Template Components',
      itemIndex,
    );

    if (!Array.isArray(components)) {
      throw new NodeOperationError(
        this.getNode(),
        'Template Components must be a JSON array',
        { itemIndex },
      );
    }

    template.components = components as IDataObject[];
  } else {
    template.parameters = getTemplateParameters(
      this.getNodeParameter('templateParameters', itemIndex, {}) as IDataObject,
    );
  }

  return compactObject(template);
}

export class SendOperation extends ResourceOperation {
  public readonly name: string = 'send';

  public readonly displayName: string = 'Send';

  public readonly description: string = 'Send a message in a conversation';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      conversationIdProperty,
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
              'Meta approved template, required to start conversations outside the 24h window',
          },
          {
            name: 'Interactive',
            value: 'interactive',
            description: 'Buttons, list or poll menu (uazapiGO numbers only)',
          },
        ],
        default: 'text',
      },
      {
        name: 'text',
        displayName: 'Text',
        description:
          'Message text (up to 4096 characters). Required for text messages, used as caption for media and optional for templates.',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        displayOptions: {
          hide: {
            messageType: ['interactive'],
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
        name: 'templateInputMode',
        displayName: 'Template Variables Input',
        type: 'options',
        options: [
          {
            name: 'Key-Value Parameters',
            value: 'parameters',
            description: 'Fill the variables with keys like body_1, body_2',
          },
          {
            name: 'Components (JSON)',
            value: 'components',
            description: 'Raw Meta API components (advanced)',
          },
        ],
        displayOptions: {
          show: {
            messageType: ['template'],
          },
        },
        default: 'parameters',
      },
      {
        ...templateParametersProperty,
        displayOptions: {
          show: {
            messageType: ['template'],
            templateInputMode: ['parameters'],
          },
        },
      },
      {
        name: 'templateComponents',
        displayName: 'Template Components (JSON)',
        description:
          'Array of components in the raw Meta API format. See https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates.',
        type: 'json',
        required: true,
        displayOptions: {
          show: {
            messageType: ['template'],
            templateInputMode: ['components'],
          },
        },
        default:
          '[\n  {\n    "type": "body",\n    "parameters": [\n      { "type": "text", "text": "" }\n    ]\n  }\n]',
      },
      {
        name: 'interactive',
        displayName: 'Interactive Menu (JSON)',
        description:
          'Menu object with `type` (button, list or poll) and `text`, plus `buttons` (button), `sections` (list) or `choices` (poll). Optional: `footer`, `list_button`, `selectable_count`, `image_url`.',
        type: 'json',
        required: true,
        displayOptions: {
          show: {
            messageType: ['interactive'],
          },
        },
        default:
          '{\n  "type": "button",\n  "text": "",\n  "buttons": [\n    { "title": "" }\n  ]\n}',
      },
      {
        name: 'options',
        displayName: 'Options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            name: 'instance_id',
            displayName: 'Expected WhatsApp Number Name or ID',
            description:
              'WhatsApp number the message must be sent from. The message always leaves through the conversation number; if it differs, the API refuses the send. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            type: 'options',
            typeOptions: {
              loadOptionsMethod: 'getInstanceOptions',
            },
            default: '',
          },
          {
            name: 'acting_as_human',
            displayName: 'Acting as Human',
            description:
              'Whether the send represents a human attendant taking over the conversation (clears unread count and the waiting-human flag)',
            type: 'boolean',
            default: false,
          },
          {
            name: 'idempotencyKey',
            displayName: 'Idempotency Key',
            description:
              'Unique key sent as the X-Idempotency-Key header, so retries do not send the message twice',
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

    const messageType: string = this.getNodeParameter(
      'messageType',
      itemIndex,
    ) as string;

    const { idempotencyKey, ...options }: IDataObject = this.getNodeParameter(
      'options',
      itemIndex,
      {},
    );

    const body: IDataObject = { ...options, type: messageType };

    if (messageType !== 'interactive') {
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

    if (messageType === 'template') {
      body.template = getTemplate.call(this, itemIndex);
    }

    if (messageType === 'interactive') {
      body.interactive = parseJson.call(
        this,
        this.getNodeParameter('interactive', itemIndex),
        'Interactive Menu',
        itemIndex,
      ) as IDataObject;
    }

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `conversations/${conversationId}/messages`,
      compactObject(body),
      undefined,
      getIdempotencyOptions(idempotencyKey as string | undefined),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
