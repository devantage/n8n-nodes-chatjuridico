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
import { agentIdProperty } from '../shared';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string =
    'Add one or more FAQ items to an AI agent';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      agentIdProperty,
      {
        name: 'mode',
        displayName: 'Mode',
        type: 'options',
        options: [
          {
            name: 'Single Item',
            value: 'single',
            description: 'Add one question and answer',
          },
          {
            name: 'Multiple Items (JSON)',
            value: 'bulk',
            description: 'Add up to 50 items from a JSON array',
          },
        ],
        default: 'single',
      },
      {
        name: 'question',
        displayName: 'Question',
        description: 'Frequently asked question (max 1000 characters)',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            mode: ['single'],
          },
        },
      },
      {
        name: 'answer',
        displayName: 'Answer',
        description: 'Answer to the question (max 5000 characters)',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: '',
        displayOptions: {
          show: {
            mode: ['single'],
          },
        },
      },
      {
        name: 'items',
        displayName: 'Items (JSON)',
        description:
          'Array of FAQ items, each with `question` and `answer` (1 to 50 items)',
        type: 'json',
        required: true,
        default: '[\n  {\n    "question": "",\n    "answer": ""\n  }\n]',
        displayOptions: {
          show: {
            mode: ['bulk'],
          },
        },
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const agentId: string = this.getNodeParameter(
      'agentId',
      itemIndex,
    ) as string;

    const mode: string = this.getNodeParameter('mode', itemIndex) as string;

    let body: IDataObject;

    if (mode === 'bulk') {
      const items: unknown = parseJson.call(
        this,
        this.getNodeParameter('items', itemIndex),
        'Items',
        itemIndex,
      );

      if (!Array.isArray(items) || !items.length || items.length > 50) {
        throw new NodeOperationError(
          this.getNode(),
          'Items must be an array with 1 to 50 items',
          { itemIndex },
        );
      }

      body = { items: items as IDataObject[] };
    } else {
      body = {
        question: this.getNodeParameter('question', itemIndex),
        answer: this.getNodeParameter('answer', itemIndex),
      };
    }

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `agents/${agentId}/faq`,
      body,
    );

    return {
      json: response,
      pairedItem: itemIndex,
    };
  }
}
