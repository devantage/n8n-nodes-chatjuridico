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
import { formatDate } from '../shared';

export class GetFunnelValuesOperation extends ResourceOperation {
  public readonly name: string = 'getFunnelValues';

  public readonly displayName: string = 'Get Funnel Values';

  public readonly description: string =
    'Get payment values aggregated by funnel stage';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'filters',
        displayName: 'Filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        options: [
          {
            name: 'start_date',
            displayName: 'Start Date',
            type: 'dateTime',
            default: '',
          },
          {
            name: 'end_date',
            displayName: 'End Date',
            type: 'dateTime',
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
    const filters: IDataObject = this.getNodeParameter(
      'filters',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      'payments/funnel-values',
      compactObject({
        start_date: formatDate(filters.start_date),
        end_date: formatDate(filters.end_date),
      }),
    );

    return {
      json: response,
      pairedItem: itemIndex,
    };
  }
}
