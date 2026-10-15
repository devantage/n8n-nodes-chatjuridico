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
import { agentSessionIdProperty } from '../shared';

export class SendFeedbackOperation extends ResourceOperation {
  public readonly name: string = 'sendFeedback';

  public readonly displayName: string = 'Send Feedback';

  public readonly description: string =
    'Rate an AI agent session and send feedback';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      agentSessionIdProperty,
      {
        name: 'rating',
        displayName: 'Rating',
        description: 'Rating from 1 to 5',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 5,
        },
        required: true,
        default: 5,
      },
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'user_feedback',
            displayName: 'User Feedback',
            description: 'Feedback text (max 5000 characters)',
            type: 'string',
            typeOptions: {
              rows: 4,
            },
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
    const sessionId: string = this.getNodeParameter(
      'sessionId',
      itemIndex,
    ) as string;

    const rating: number = this.getNodeParameter('rating', itemIndex) as number;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `agent-sessions/${sessionId}/feedback`,
      compactObject({ ...additionalFields, rating }),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
