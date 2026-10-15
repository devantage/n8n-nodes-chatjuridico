import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiResponse,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { buildDashboardQuery, dashboardFilterFields } from '../shared';

export class GetDashboardOperation extends ResourceOperation {
  public readonly name: string = 'getDashboard';

  public readonly displayName: string = 'Get Dashboard';

  public readonly description: string = 'Get aggregated payment metrics';

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
          ...dashboardFilterFields,
          {
            name: 'user_id',
            displayName: 'Responsible User Name or ID',
            description:
              'Consider only payments of this user. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            type: 'options',
            typeOptions: {
              loadOptionsMethod: 'getMemberOptions',
            },
            default: '',
          },
          {
            name: 'compare',
            displayName: 'Compare',
            description:
              'Whether to include a comparison with the previous period',
            type: 'boolean',
            default: false,
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
      'payments/dashboard',
      buildDashboardQuery(filters),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
