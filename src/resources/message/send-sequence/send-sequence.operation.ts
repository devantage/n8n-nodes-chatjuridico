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
  httpClient,
  parseJson,
  withOperationDisplayOptions,
} from '../../../utils';
import { conversationIdProperty } from '../../conversation/shared';

export class SendSequenceOperation extends ResourceOperation {
  public readonly name: string = 'sendSequence';

  public readonly displayName: string = 'Send Sequence';

  public readonly description: string =
    'Send immediate messages and schedule future ones in a single call';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      conversationIdProperty,
      {
        name: 'idempotencyKey',
        displayName: 'Idempotency Key',
        description:
          'Stable key of the sequence (8 to 160 characters) used to deduplicate retries',
        type: 'string',
        required: true,
        default: '',
      },
      {
        name: 'items',
        displayName: 'Items (JSON)',
        description:
          'Array of 1 to 10 items, each with a stable `client_item_id`, a `message` object (same fields as Send: `type`, `text`, `file_url`, `template`, `interactive`) and an optional `send_at` date. Items without `send_at` or with a past date are sent immediately; future dates create scheduled messages.',
        type: 'json',
        required: true,
        default:
          '[\n  {\n    "client_item_id": "confirmation",\n    "message": { "type": "text", "text": "" }\n  },\n  {\n    "client_item_id": "reminder",\n    "send_at": "2026-01-01T09:00:00Z",\n    "message": { "type": "text", "text": "" }\n  }\n]',
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

    const idempotencyKey: string = this.getNodeParameter(
      'idempotencyKey',
      itemIndex,
    ) as string;

    const items: unknown = parseJson.call(
      this,
      this.getNodeParameter('items', itemIndex),
      'Items',
      itemIndex,
    );

    if (!Array.isArray(items) || !items.length || items.length > 10) {
      throw new NodeOperationError(
        this.getNode(),
        'Items must be an array with 1 to 10 items',
        { itemIndex },
      );
    }

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `conversations/${conversationId}/message-sequence`,
      { idempotency_key: idempotencyKey, items: items as IDataObject[] },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
