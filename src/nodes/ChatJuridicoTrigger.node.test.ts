import { createHmac } from 'crypto';
import {
  type IDataObject,
  type INode,
  type IWebhookResponseData,
  NodeApiError,
} from 'n8n-workflow';

import { httpClient } from '../utils';
import {
  CHATJURIDICO_WEBHOOK_EVENTS,
  ChatJuridicoTrigger,
  isValidSignature,
} from './ChatJuridicoTrigger.node';

type HookMethod = (this: unknown) => Promise<boolean>;

type ContextOptions = {
  staticData?: IDataObject;
  parameters?: Record<string, unknown>;
  body?: IDataObject;
  headers?: Record<string, string | string[]>;
  rawBody?: Buffer;
};

type ResponseMock = {
  status: jest.Mock;
  send: jest.Mock;
  end: jest.Mock;
};

const NODE: INode = {
  id: '1',
  name: 'ChatJuridico Trigger',
  type: 'chatJuridicoTrigger',
  typeVersion: 1,
  position: [0, 0],
  parameters: {},
};

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function createContext({
  staticData = {},
  parameters = {},
  body = {},
  headers = {},
  rawBody,
}: ContextOptions = {}): Record<string, unknown> & {
  staticData: IDataObject;
  response: ResponseMock;
} {
  const response: ResponseMock = {
    status: jest.fn(),
    send: jest.fn(),
    end: jest.fn(),
  };

  response.status.mockReturnValue(response);
  response.send.mockReturnValue(response);

  return {
    staticData,
    response,
    getNode: (): INode => NODE,
    getWorkflow: (): { id: string } => ({ id: 'workflow-1' }),
    getWorkflowStaticData: (): IDataObject => staticData,
    getNodeWebhookUrl: (): string => 'https://n8n.example.com/webhook/abc',
    getNodeParameter: (name: string, fallback?: unknown): unknown =>
      parameters[name] ?? fallback,
    getBodyData: (): IDataObject => body,
    getHeaderData: (): Record<string, string | string[]> => headers,
    getRequestObject: (): { rawBody?: Buffer } => ({ rawBody }),
    getResponseObject: (): ResponseMock => response,
    helpers: {
      returnJsonArray: (data: IDataObject): IDataObject[] => [{ json: data }],
    },
  };
}

function getHookMethod(name: 'checkExists' | 'create' | 'delete'): HookMethod {
  const trigger: ChatJuridicoTrigger = new ChatJuridicoTrigger();

  return trigger.webhookMethods?.default?.[name] as unknown as HookMethod;
}

describe('ChatJuridicoTrigger', (): void => {
  afterEach((): void => {
    jest.restoreAllMocks();
  });

  it('describes a webhook trigger with the supported events', (): void => {
    const trigger: ChatJuridicoTrigger = new ChatJuridicoTrigger();
    const eventsProperty: IDataObject = trigger.description
      .properties[0] as unknown as IDataObject;

    expect(trigger.description.name).toBe('chatJuridicoTrigger');
    expect(trigger.description.group).toEqual(['trigger']);
    expect(trigger.description.credentials).toEqual([
      { name: 'chatJuridicoApi', required: true },
    ]);
    expect(
      (eventsProperty.options as IDataObject[])
        .map(({ value }: IDataObject): unknown => value)
        .sort(),
    ).toEqual([...CHATJURIDICO_WEBHOOK_EVENTS].sort());
  });

  describe('checkExists', (): void => {
    it('returns false when no webhook was registered', async (): Promise<void> => {
      await expect(
        getHookMethod('checkExists').call(createContext()),
      ).resolves.toBe(false);
    });

    it('returns true when the registered webhook still exists', async (): Promise<void> => {
      const context: ReturnType<typeof createContext> = createContext({
        staticData: { webhookId: 'webhook-1' },
      });
      const getSpy: jest.SpyInstance = jest
        .spyOn(httpClient, 'get')
        .mockResolvedValueOnce({ data: { id: 'webhook-1' } });

      await expect(getHookMethod('checkExists').call(context)).resolves.toBe(
        true,
      );
      expect(getSpy).toHaveBeenCalledWith(context, 'webhooks/webhook-1');
    });

    it('forgets the webhook when the API returns 404', async (): Promise<void> => {
      const context: ReturnType<typeof createContext> = createContext({
        staticData: { webhookId: 'webhook-1', webhookSecret: 'secret' },
      });

      jest
        .spyOn(httpClient, 'get')
        .mockRejectedValueOnce(new NodeApiError(NODE, {}, { httpCode: '404' }));

      await expect(getHookMethod('checkExists').call(context)).resolves.toBe(
        false,
      );
      expect(context.staticData).toEqual({});
    });

    it('rethrows other errors', async (): Promise<void> => {
      jest
        .spyOn(httpClient, 'get')
        .mockRejectedValueOnce(new NodeApiError(NODE, {}, { httpCode: '500' }));

      await expect(
        getHookMethod('checkExists').call(
          createContext({ staticData: { webhookId: 'webhook-1' } }),
        ),
      ).rejects.toThrow(NodeApiError);
    });
  });

  describe('create', (): void => {
    it('registers the webhook and stores its id and secret', async (): Promise<void> => {
      const context: ReturnType<typeof createContext> = createContext({
        parameters: {
          events: ['message.received'],
          options: { filters: '{"direction":"inbound"}' },
        },
      });
      const postSpy: jest.SpyInstance = jest
        .spyOn(httpClient, 'post')
        .mockResolvedValueOnce({
          data: { id: 'webhook-1', secret: 'whsec_123' },
        });

      await expect(getHookMethod('create').call(context)).resolves.toBe(true);

      expect(postSpy).toHaveBeenCalledWith(context, 'webhooks', {
        url: 'https://n8n.example.com/webhook/abc',
        events: ['message.received'],
        description: 'n8n workflow workflow-1',
        filters: { direction: 'inbound' },
      });
      expect(context.staticData).toEqual({
        webhookId: 'webhook-1',
        webhookSecret: 'whsec_123',
      });
    });

    it('rejects invalid filters', async (): Promise<void> => {
      await expect(
        getHookMethod('create').call(
          createContext({
            parameters: {
              events: ['message.received'],
              options: { filters: '{invalid' },
            },
          }),
        ),
      ).rejects.toThrow("'Message Filters (JSON)' must be a valid JSON");
    });
  });

  describe('delete', (): void => {
    it('removes the registered webhook', async (): Promise<void> => {
      const context: ReturnType<typeof createContext> = createContext({
        staticData: { webhookId: 'webhook-1', webhookSecret: 'secret' },
      });
      const deleteSpy: jest.SpyInstance = jest
        .spyOn(httpClient, 'delete')
        .mockResolvedValueOnce({ data: { deleted: true } });

      await expect(getHookMethod('delete').call(context)).resolves.toBe(true);
      expect(deleteSpy).toHaveBeenCalledWith(context, 'webhooks/webhook-1');
      expect(context.staticData).toEqual({});
    });

    it('treats an already deleted webhook as removed', async (): Promise<void> => {
      const context: ReturnType<typeof createContext> = createContext({
        staticData: { webhookId: 'webhook-1' },
      });

      jest
        .spyOn(httpClient, 'delete')
        .mockRejectedValueOnce(new NodeApiError(NODE, {}, { httpCode: '404' }));

      await expect(getHookMethod('delete').call(context)).resolves.toBe(true);
      expect(context.staticData).toEqual({});
    });

    it('reports failures other than 404', async (): Promise<void> => {
      jest
        .spyOn(httpClient, 'delete')
        .mockRejectedValueOnce(new NodeApiError(NODE, {}, { httpCode: '500' }));

      await expect(
        getHookMethod('delete').call(
          createContext({ staticData: { webhookId: 'webhook-1' } }),
        ),
      ).resolves.toBe(false);
    });
  });

  describe('webhook', (): void => {
    const body: IDataObject = {
      event: 'message.received',
      data: { id: 'message-1' },
      timestamp: '2026-04-12T14:30:00Z',
    };
    const rawBody: string = JSON.stringify(body);

    async function runWebhook(
      context: ReturnType<typeof createContext>,
    ): Promise<IWebhookResponseData> {
      return new ChatJuridicoTrigger().webhook.call(context as never);
    }

    it('emits deliveries with a valid signature', async (): Promise<void> => {
      const context: ReturnType<typeof createContext> = createContext({
        staticData: { webhookSecret: 'secret' },
        parameters: { events: ['message.received'] },
        body,
        rawBody: Buffer.from(rawBody),
        headers: { 'x-webhook-signature': sign(rawBody, 'secret') },
      });

      await expect(runWebhook(context)).resolves.toEqual({
        workflowData: [[{ json: body }]],
      });
    });

    it('rejects deliveries with an invalid signature', async (): Promise<void> => {
      const context: ReturnType<typeof createContext> = createContext({
        staticData: { webhookSecret: 'secret' },
        parameters: { events: ['message.received'] },
        body,
        rawBody: Buffer.from(rawBody),
        headers: { 'x-webhook-signature': ['invalid'] },
      });

      await expect(runWebhook(context)).resolves.toEqual({
        noWebhookResponse: true,
      });
      expect(context.response.status).toHaveBeenCalledWith(401);
    });

    it('skips the verification when disabled', async (): Promise<void> => {
      const context: ReturnType<typeof createContext> = createContext({
        staticData: { webhookSecret: 'secret' },
        parameters: {
          events: ['message.received'],
          options: { verifySignature: false },
        },
        body,
      });

      await expect(runWebhook(context)).resolves.toEqual({
        workflowData: [[{ json: body }]],
      });
    });

    it('ignores events that were not selected', async (): Promise<void> => {
      const context: ReturnType<typeof createContext> = createContext({
        staticData: { webhookSecret: 'secret' },
        parameters: { events: ['contact.created'] },
        body,
        headers: { 'x-webhook-signature': sign(rawBody, 'secret') },
      });

      await expect(runWebhook(context)).resolves.toEqual({});
    });
  });

  describe('isValidSignature', (): void => {
    it('accepts signatures prefixed with the algorithm', (): void => {
      expect(
        isValidSignature(
          Buffer.from('payload'),
          `sha256=${sign('payload', 'secret')}`,
          'secret',
        ),
      ).toBe(true);
    });

    it('rejects missing signatures', (): void => {
      expect(
        isValidSignature(Buffer.from('payload'), undefined, 'secret'),
      ).toBe(false);
    });
  });
});
