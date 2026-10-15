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
import { cnjProperty, getLawsuitPath } from '../shared';

export class GetOperation extends ResourceOperation {
  public readonly name: string = 'get';

  public readonly displayName: string = 'Get';

  public readonly description: string =
    'Get an office lawsuit by its CNJ number';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      cnjProperty,
      {
        name: 'maxMovements',
        displayName: 'Max Movements',
        description: 'Number of recent movements to include',
        type: 'number',
        typeOptions: {
          minValue: 0,
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
    const cnj: string = this.getNodeParameter('cnj', itemIndex) as string;

    const maxMovements: number = this.getNodeParameter(
      'maxMovements',
      itemIndex,
      10,
    ) as number;

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      getLawsuitPath(cnj),
      { max_movements: maxMovements },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
