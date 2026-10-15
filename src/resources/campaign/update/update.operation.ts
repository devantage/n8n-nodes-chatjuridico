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
  withOperationDisplayOptions,
} from '../../../utils';
import {
  buildCampaignBody,
  campaignFields,
  campaignIdProperty,
} from '../shared';

export class UpdateOperation extends ResourceOperation {
  public readonly name: string = 'update';

  public readonly displayName: string = 'Update';

  public readonly description: string = 'Update a draft or scheduled campaign';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      campaignIdProperty,
      {
        name: 'updateFields',
        displayName: 'Update Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'name',
            displayName: 'Name',
            description: 'Campaign name (1 to 255 characters)',
            type: 'string',
            default: '',
          },
          {
            name: 'scheduled_at',
            displayName: 'Scheduled At',
            description:
              'New date of a campaign with the `scheduled` status, including the timezone',
            type: 'dateTime',
            default: '',
          },
          ...campaignFields,
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const campaignId: string = this.getNodeParameter(
      'campaignId',
      itemIndex,
    ) as string;

    const body: IDataObject = buildCampaignBody(
      this.getNodeParameter('updateFields', itemIndex, {}),
    );

    if (!Object.keys(body).length) {
      throw new NodeOperationError(
        this.getNode(),
        'Please add at least one field to update',
        { itemIndex },
      );
    }

    const response: ApiResponse = await httpClient.patch<ApiResponse>(
      this,
      `campaigns/${campaignId}`,
      undefined,
      body,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
