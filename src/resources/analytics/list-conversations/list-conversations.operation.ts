import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  compactObject,
  httpClient,
  type Pagination,
  withOperationDisplayOptions,
} from '../../../utils';
import { createListProperties } from '../../shared';
import {
  analyticsTagIdsField,
  createAnalyticsFiltersProperty,
  getAnalyticsQuery,
} from '../shared';

const MAX_LIMIT: number = 200;

type ConversationAnalyticsResponse = {
  data: {
    items: IDataObject[];
    period?: IDataObject;
  };
  pagination?: Pagination;
};

export class ListConversationsOperation extends ResourceOperation {
  public readonly name: string = 'listConversations';

  public readonly displayName: string = 'List Conversations';

  public readonly description: string =
    'List conversations with their analytics metrics';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      ...createListProperties(MAX_LIMIT, 50),
      createAnalyticsFiltersProperty([
        analyticsTagIdsField,
        {
          name: 'stage_id',
          displayName: 'Funnel Stage Name or ID',
          description:
            'Return only the conversations in this funnel stage. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
          type: 'options',
          typeOptions: {
            loadOptionsMethod: 'getFunnelStageOptions',
          },
          default: '',
        },
      ]),
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const queryParams: IDataObject = getAnalyticsQuery.call(this, itemIndex);

    const returnAll: boolean = this.getNodeParameter(
      'returnAll',
      itemIndex,
      false,
    );

    if (!returnAll) {
      const limit: number = this.getNodeParameter('limit', itemIndex, 50);

      return {
        json: await httpClient.get<IDataObject>(
          this,
          'analytics/conversations',
          compactObject({ ...queryParams, limit }),
        ),
        pairedItem: itemIndex,
      };
    }

    // The items are nested in `data.items`, so the pages are merged here
    // instead of using the generic `getListResults` helper.
    const items: IDataObject[] = [];

    let period: IDataObject | undefined;

    let cursor: string | undefined;

    do {
      const response: ConversationAnalyticsResponse =
        await httpClient.get<ConversationAnalyticsResponse>(
          this,
          'analytics/conversations',
          compactObject({ ...queryParams, limit: MAX_LIMIT, cursor }),
        );

      items.push(...response.data.items);

      period = response.data.period ?? period;

      cursor = response.pagination?.has_more
        ? (response.pagination.next_cursor ?? undefined)
        : undefined;
    } while (cursor);

    return {
      json: { data: compactObject({ items, period }) },
      pairedItem: itemIndex,
    };
  }
}
