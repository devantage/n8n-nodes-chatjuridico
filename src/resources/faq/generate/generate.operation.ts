import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiResponse,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { agentIdProperty } from '../shared';

export class GenerateOperation extends ResourceOperation {
  public readonly name: string = 'generate';

  public readonly displayName: string = 'Generate';

  public readonly description: string =
    'Generate FAQ items with AI from a service description (items are not saved)';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      agentIdProperty,
      {
        name: 'prompt',
        displayName: 'Prompt',
        description:
          'Description of the service or context used to generate the FAQ (10 to 5000 characters)',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: '',
      },
      {
        name: 'count',
        displayName: 'Count',
        description: 'Number of questions to generate',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 30,
        },
        default: 10,
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

    const prompt: string = this.getNodeParameter('prompt', itemIndex) as string;

    const count: number = this.getNodeParameter('count', itemIndex) as number;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `agents/${agentId}/faq/generate`,
      { prompt, count },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
