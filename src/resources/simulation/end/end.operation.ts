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
import { simulationIdProperty } from '../shared';

export class EndOperation extends ResourceOperation {
  public readonly name: string = 'end';

  public readonly displayName: string = 'End';

  public readonly description: string =
    'End an ongoing AI agent simulation session';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [simulationIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const simulationId: string = this.getNodeParameter(
      'simulationId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `simulations/${simulationId}/end`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
