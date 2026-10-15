import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiListResponse,
  compactObject,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { createListProperties } from '../../shared';
import { parseSearchFilterValue, SEARCH_FILTER_FIELDS } from '../shared';

const MAX_LIMIT: number = 200;

export class SearchOperation extends ResourceOperation {
  public readonly name: string = 'search';

  public readonly displayName: string = 'Search';

  public readonly description: string =
    'Search conversations with advanced filters and sorting';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      ...createListProperties(MAX_LIMIT, 50),
      {
        name: 'filters',
        displayName: 'Filters',
        description: 'Conditions combined with AND',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        placeholder: 'Add Filter',
        default: {},
        options: [
          {
            name: 'filter',
            displayName: 'Filter',
            values: [
              {
                name: 'field',
                displayName: 'Field',
                type: 'options',
                options: SEARCH_FILTER_FIELDS,
                default: 'last_message_at',
              },
              {
                name: 'operator',
                displayName: 'Operator',
                type: 'options',
                options: [
                  { name: 'Equals', value: 'eq' },
                  { name: 'Not Equals', value: 'neq' },
                  { name: 'Greater Than', value: 'gt' },
                  { name: 'Greater Than or Equal', value: 'gte' },
                  { name: 'Less Than', value: 'lt' },
                  { name: 'Less Than or Equal', value: 'lte' },
                  { name: 'In List', value: 'in' },
                  { name: 'Overlaps', value: 'overlaps' },
                  { name: 'Matches Pattern (ILIKE)', value: 'ilike' },
                  { name: 'Is Null', value: 'is_null' },
                ],
                default: 'eq',
              },
              {
                name: 'value',
                displayName: 'Value',
                description:
                  'Value to compare. Use a comma separated list for "In List" and "Overlaps", true/false for boolean fields and "Is Null", and % wildcards for "Matches Pattern".',
                type: 'string',
                default: '',
              },
            ],
          },
        ],
      },
      {
        name: 'sort',
        displayName: 'Sort',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        placeholder: 'Add Sort Rule',
        default: {},
        options: [
          {
            name: 'rule',
            displayName: 'Rule',
            values: [
              {
                name: 'field',
                displayName: 'Field',
                type: 'options',
                options: [
                  { name: 'Last Message At', value: 'last_message_at' },
                  { name: 'Created At', value: 'created_at' },
                  {
                    name: 'Unread Messages Count',
                    value: 'unread_messages_count',
                  },
                ],
                default: 'last_message_at',
              },
              {
                name: 'direction',
                displayName: 'Direction',
                type: 'options',
                options: [
                  { name: 'Descending', value: 'desc' },
                  { name: 'Ascending', value: 'asc' },
                ],
                default: 'desc',
              },
            ],
          },
        ],
      },
      {
        name: 'options',
        displayName: 'Options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            name: 'cursor',
            displayName: 'Cursor',
            description:
              'Cursor of the page to start from (value of `pagination.next_cursor`)',
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
    const returnAll: boolean = this.getNodeParameter(
      'returnAll',
      itemIndex,
      false,
    );

    const filtersUi: IDataObject = this.getNodeParameter(
      'filters',
      itemIndex,
      {},
    );

    const sortUi: IDataObject = this.getNodeParameter(
      'sort',
      itemIndex,
      {},
    ) as IDataObject;

    const options: IDataObject = this.getNodeParameter(
      'options',
      itemIndex,
      {},
    );

    const filters: IDataObject[] = (
      (filtersUi.filter as IDataObject[] | undefined) ?? []
    ).map((curFilter: IDataObject): IDataObject => ({
      field: curFilter.field,
      operator: curFilter.operator,
      value: parseSearchFilterValue(
        curFilter.field as string,
        curFilter.operator as string,
        curFilter.value,
      ),
    }));

    const sort: IDataObject[] = (
      (sortUi.rule as IDataObject[] | undefined) ?? []
    ).map((curRule: IDataObject): IDataObject => ({
      field: curRule.field,
      direction: curRule.direction,
    }));

    const body: IDataObject = compactObject({
      filters: filters.length ? filters : undefined,
      sort: sort.length ? sort : undefined,
      cursor: options.cursor,
    });

    if (!returnAll) {
      const limit: number = this.getNodeParameter('limit', itemIndex, 50);

      return {
        json: await httpClient.post<IDataObject>(this, 'conversations/search', {
          ...body,
          limit,
        }),
        pairedItem: itemIndex,
      };
    }

    const data: IDataObject[] = [];

    let cursor: string | undefined = body.cursor as string | undefined;

    do {
      const response: ApiListResponse = await httpClient.post<ApiListResponse>(
        this,
        'conversations/search',
        compactObject({ ...body, limit: MAX_LIMIT, cursor }),
      );

      data.push(...response.data);

      cursor = response.pagination?.has_more
        ? (response.pagination.next_cursor ?? undefined)
        : undefined;
    } while (cursor);

    return {
      json: { data },
      pairedItem: itemIndex,
    };
  }
}
