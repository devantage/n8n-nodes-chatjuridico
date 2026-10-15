import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';
import { campaignIdProperty } from '../shared';

export class ListRecipientsOperation extends ResourceOperation {
  public readonly name: string = 'listRecipients';

  public readonly displayName: string = 'List Recipients';

  public readonly description: string =
    'List the recipients of a campaign with their delivery status';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [campaignIdProperty, ...createListProperties(200, 50)],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const campaignId: string = this.getNodeParameter(
      'campaignId',
      itemIndex,
    ) as string;

    return {
      json: await getListResults.call(
        this,
        itemIndex,
        `campaigns/${campaignId}/recipients`,
        {},
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
