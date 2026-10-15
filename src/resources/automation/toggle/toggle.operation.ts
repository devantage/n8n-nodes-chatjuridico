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
import { automationIdProperty } from '../shared';

export class ToggleOperation extends ResourceOperation {
  public readonly name: string = 'toggle';

  public readonly displayName: string = 'Toggle';

  public readonly description: string =
    'Toggle an automation between active and inactive';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [automationIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const automationId: string = this.getNodeParameter(
      'automationId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `automations/${automationId}/toggle`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
