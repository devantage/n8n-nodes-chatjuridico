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
  parseJson,
  withOperationDisplayOptions,
} from '../../../utils';
import { webhookEventOptions, webhookFiltersProperty } from '../shared';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string =
    'Register a webhook (the HMAC secret is returned only once)';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'url',
        displayName: 'URL',
        description: 'Endpoint URL that receives the events (must use HTTPS)',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'https://example.com/webhook',
      },
      {
        name: 'events',
        displayName: 'Events',
        description: 'Events the webhook subscribes to',
        type: 'multiOptions',
        options: webhookEventOptions,
        required: true,
        default: [],
      },
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'description',
            displayName: 'Description',
            description: 'Webhook description',
            type: 'string',
            default: '',
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
    const url: string = this.getNodeParameter('url', itemIndex) as string;

    const events: string[] = this.getNodeParameter(
      'events',
      itemIndex,
    ) as string[];

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const body: IDataObject = compactObject({
      ...additionalFields,
      url,
      events,
      filters:
        additionalFields.filters !== undefined
          ? (parseJson.call(
              this,
              additionalFields.filters,
              'Filters',
              itemIndex,
            ) as IDataObject)
          : undefined,
    });

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'webhooks',
      body,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
