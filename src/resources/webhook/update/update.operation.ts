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
  compactObject,
  httpClient,
  parseJson,
  withOperationDisplayOptions,
} from '../../../utils';
import {
  webhookEventOptions,
  webhookFiltersProperty,
  webhookIdProperty,
} from '../shared';

export class UpdateOperation extends ResourceOperation {
  public readonly name: string = 'update';

  public readonly displayName: string = 'Update';

  public readonly description: string = 'Update a webhook';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      webhookIdProperty,
      {
        name: 'updateFields',
        displayName: 'Update Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'url',
            displayName: 'URL',
            description: 'New endpoint URL (must use HTTPS)',
            type: 'string',
            default: '',
          },
          {
            name: 'events',
            displayName: 'Events',
            description: 'Events to subscribe to. Replaces the current events.',
            type: 'multiOptions',
            options: webhookEventOptions,
            default: [],
          },
          {
            name: 'description',
            displayName: 'Description',
            description: 'Webhook description',
            type: 'string',
            default: '',
          },
          {
            name: 'is_active',
            displayName: 'Is Active',
            description: 'Whether the webhook is active',
            type: 'boolean',
            default: true,
          },
          webhookFiltersProperty,
        ],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const webhookId: string = this.getNodeParameter(
      'webhookId',
      itemIndex,
    ) as string;

    const updateFields: IDataObject = this.getNodeParameter(
      'updateFields',
      itemIndex,
      {},
    );

    const events: string[] | undefined = updateFields.events as
      string[] | undefined;

    const body: IDataObject = compactObject({
      ...updateFields,
      events: events?.length ? events : undefined,
      filters:
        updateFields.filters !== undefined
          ? (parseJson.call(
              this,
              updateFields.filters,
              'Filters',
              itemIndex,
            ) as IDataObject)
          : undefined,
    });

    if (!Object.keys(body).length) {
      throw new NodeOperationError(
        this.getNode(),
        'Please add at least one field to update',
        { itemIndex },
      );
    }

    const response: ApiResponse = await httpClient.patch<ApiResponse>(
      this,
      `webhooks/${webhookId}`,
      undefined,
      body,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
