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

export class CompleteOperation extends ResourceOperation {
  public readonly name: string = 'complete';

  public readonly displayName: string = 'Complete';

  public readonly description: string =
    'Force the completion of an AI agent session';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      agentSessionIdProperty,
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'completed_reason',
            displayName: 'Completed Reason',
            description:
              'Reason for completing the session (max 500 characters)',
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
    const sessionId: string = this.getNodeParameter(
      'sessionId',
      itemIndex,
    ) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `agent-sessions/${sessionId}/complete`,
      compactObject(additionalFields),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
