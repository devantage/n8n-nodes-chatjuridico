import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  getIdempotencyOptions,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { campaignIdProperty } from '../shared';

export class SendOperation extends ResourceOperation {
  public readonly name: string = 'send';

  public readonly displayName: string = 'Send';

  public readonly description: string = 'Send a campaign';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'sendNotice',
        displayName:
          'The API currently answers 409 (send_from_app): campaigns are sent by opening the draft in Campaigns, in the ChatJuridico app, and confirming it',
        type: 'notice',
        default: '',
      },
      campaignIdProperty,
      {
        name: 'options',
        displayName: 'Options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            name: 'idempotencyKey',
            displayName: 'Idempotency Key',
            description:
              'Unique key that prevents the campaign from being sent twice when the request is retried',
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
    const campaignId: string = this.getNodeParameter(
      'campaignId',
      itemIndex,
    ) as string;

    const options: IDataObject = this.getNodeParameter(
      'options',
      itemIndex,
      {},
    );

    const response: IDataObject = await httpClient.post<IDataObject>(
      this,
      `campaigns/${campaignId}/send`,
      undefined,
      undefined,
      getIdempotencyOptions(options.idempotencyKey as string | undefined),
    );

    return {
      json: (response.data as IDataObject | undefined) ?? response,
      pairedItem: itemIndex,
    };
  }
}
