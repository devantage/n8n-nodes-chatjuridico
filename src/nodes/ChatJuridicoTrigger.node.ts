import { createHmac, timingSafeEqual } from 'crypto';
import {
  type IDataObject,
  type IHookFunctions,
  type INodeType,
  type INodeTypeDescription,
  type IWebhookFunctions,
  type IWebhookResponseData,
  NodeApiError,
  NodeConnectionTypes,
  NodeOperationError,
} from 'n8n-workflow';

import {
  type ApiResponse,
  CHATJURIDICO_CREDENTIAL_TYPE,
  compactObject,
  httpClient,
} from '../utils';

type WebhookStaticData = IDataObject & {
  webhookId?: string;
  webhookSecret?: string;
};

type CreatedWebhook = {
  id: string;
  secret: string;
};

export const CHATJURIDICO_WEBHOOK_EVENTS: string[] = [
  'message.received',
  'message.sent',
  'message.status_changed',
  'conversation.created',
  'conversation.updated',
  'contact.created',
  'contact.updated',
  'automation.executed',
  'automation.activated',
  'automation.deactivated',
];

function isNotFoundError(error: unknown): boolean {
  return error instanceof NodeApiError && error.httpCode === '404';
}

/**
 * Compares the `X-Webhook-Signature` header with the HMAC-SHA256 hex digest of
 * the raw request body signed with the webhook secret.
 */
export function isValidSignature(
  payload: Buffer,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!signature) {
    return false;
  }

  const expected: Buffer = Buffer.from(
    createHmac('sha256', secret).update(payload).digest('hex'),
  );

  const received: Buffer = Buffer.from(signature.replace(/^sha256=/, ''));

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export class ChatJuridicoTrigger implements INodeType {
  public readonly description: INodeTypeDescription = {
    displayName: 'ChatJuridico Trigger',
    name: 'chatJuridicoTrigger',
    icon: 'file:../icons/icon.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["events"].join(", ")}}',
    description: 'Starts the workflow when ChatJuridico events occur',
    defaults: {
      name: 'ChatJuridico Trigger',
    },
    inputs: [],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: CHATJURIDICO_CREDENTIAL_TYPE,
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        name: 'events',
        displayName: 'Events',
        description: 'The events that trigger the workflow',
        type: 'multiOptions',
        required: true,
        options: [
          {
            name: 'Automation Activated',
            value: 'automation.activated',
          },
          {
            name: 'Automation Deactivated',
            value: 'automation.deactivated',
          },
          {
            name: 'Automation Executed',
            value: 'automation.executed',
          },
          { name: 'Contact Created', value: 'contact.created' },
          { name: 'Contact Updated', value: 'contact.updated' },
          { name: 'Conversation Created', value: 'conversation.created' },
          {
            name: 'Conversation Updated',
            value: 'conversation.updated',
            description: 'Tags, stage or assignee changed',
          },
          {
            name: 'Message Received',
            value: 'message.received',
            description: 'New message from a contact',
          },
          {
            name: 'Message Sent',
            value: 'message.sent',
            description: 'Message sent by the office',
          },
          {
            name: 'Message Status Changed',
            value: 'message.status_changed',
            description: 'Sent → delivered → read',
          },
        ],
        default: ['message.received'],
      },
      {
        name: 'options',
        displayName: 'Options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            name: 'description',
            displayName: 'Webhook Description',
            description:
              'Description of the webhook registered in ChatJuridico',
            type: 'string',
            default: '',
          },
          {
            name: 'filters',
            displayName: 'Message Filters (JSON)',
            description:
              'Optional filters applied to `message.*` events before delivery (`message_types`, `direction`, `text`, `interactive`)',
            type: 'json',
            default: '{\n  "direction": "inbound"\n}',
          },
          {
            name: 'verifySignature',
            displayName: 'Verify Signature',
            description:
              'Whether to reject deliveries whose `X-Webhook-Signature` does not match the webhook secret',
            type: 'boolean',
            default: true,
          },
        ],
      },
    ],
  };

  public readonly webhookMethods: INodeType['webhookMethods'] = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const staticData: WebhookStaticData =
          this.getWorkflowStaticData('node');

        if (!staticData.webhookId) {
          return false;
        }

        try {
          await httpClient.get<ApiResponse>(
            this,
            `webhooks/${staticData.webhookId}`,
          );

          return true;
        } catch (error: unknown) {
          if (!isNotFoundError(error)) {
            throw error;
          }

          delete staticData.webhookId;
          delete staticData.webhookSecret;

          return false;
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl: string | undefined =
          this.getNodeWebhookUrl('default');

        if (!webhookUrl) {
          throw new NodeOperationError(
            this.getNode(),
            'Unable to resolve the webhook URL',
          );
        }

        const events: string[] = this.getNodeParameter('events') as string[];

        const options: IDataObject = this.getNodeParameter(
          'options',
          {},
        ) as IDataObject;

        let filters: unknown = options.filters;

        if (typeof filters === 'string') {
          try {
            filters = JSON.parse(filters) as unknown;
          } catch {
            throw new NodeOperationError(
              this.getNode(),
              "'Message Filters (JSON)' must be a valid JSON",
            );
          }
        }

        const response: ApiResponse<CreatedWebhook> = await httpClient.post<
          ApiResponse<CreatedWebhook>
        >(
          this,
          'webhooks',
          compactObject({
            url: webhookUrl,
            events,
            description:
              options.description ||
              `n8n workflow ${this.getWorkflow().id ?? ''}`.trim(),
            filters: filters as IDataObject | undefined,
          }),
        );

        const staticData: WebhookStaticData =
          this.getWorkflowStaticData('node');

        staticData.webhookId = response.data.id;
        staticData.webhookSecret = response.data.secret;

        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const staticData: WebhookStaticData =
          this.getWorkflowStaticData('node');

        if (staticData.webhookId) {
          try {
            await httpClient.delete<ApiResponse>(
              this,
              `webhooks/${staticData.webhookId}`,
            );
          } catch (error: unknown) {
            if (!isNotFoundError(error)) {
              return false;
            }
          }

          delete staticData.webhookId;
          delete staticData.webhookSecret;
        }

        return true;
      },
    },
  };

  public async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const options: IDataObject = this.getNodeParameter(
      'options',
      {},
    ) as IDataObject;

    const staticData: WebhookStaticData = this.getWorkflowStaticData('node');

    const body: IDataObject = this.getBodyData();

    if (options.verifySignature !== false && staticData.webhookSecret) {
      const signatureHeader: string | string[] | undefined =
        this.getHeaderData()['x-webhook-signature'];

      const signature: string | undefined = Array.isArray(signatureHeader)
        ? signatureHeader[0]
        : signatureHeader;

      // `rawBody` is only populated by n8n when the body was buffered
      const rawBody: unknown = this.getRequestObject().rawBody;

      const payload: Buffer = Buffer.isBuffer(rawBody)
        ? rawBody
        : Buffer.from(JSON.stringify(body));

      if (!isValidSignature(payload, signature, staticData.webhookSecret)) {
        this.getResponseObject()
          .status(401)
          .send('Invalid webhook signature')
          .end();

        return Promise.resolve({ noWebhookResponse: true });
      }
    }

    const events: string[] = this.getNodeParameter('events', []) as string[];

    if (typeof body.event === 'string' && !events.includes(body.event)) {
      return Promise.resolve({});
    }

    return Promise.resolve({
      workflowData: [this.helpers.returnJsonArray(body)],
    });
  }
}
