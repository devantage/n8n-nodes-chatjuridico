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
import { agentSessionIdProperty } from '../shared';

export class ListEvaluationsOperation extends ResourceOperation {
  public readonly name: string = 'listEvaluations';

  public readonly displayName: string = 'List Evaluations';

  public readonly description: string =
    'List the quality evaluations of an AI agent session';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [agentSessionIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const sessionId: string = this.getNodeParameter(
      'sessionId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      `agent-sessions/${sessionId}/evaluations`,
    );

    return {
      json: response,
      pairedItem: itemIndex,
    };
  }
}
