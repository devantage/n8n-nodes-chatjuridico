import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { compactObject, withOperationDisplayOptions } from '../../../utils';
import { conversationIdProperty } from '../../conversation/shared';
import { createListProperties, getListResults } from '../../shared';

export class ListOperation extends ResourceOperation {
  public readonly name: string = 'list';

  public readonly displayName: string = 'List';

  public readonly description: string =
    'List the messages of a conversation, newest first';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      conversationIdProperty,
      ...createListProperties(200, 100),
      {
        name: 'filters',
        displayName: 'Filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        options: [
          {
            name: 'from_me',
            displayName: 'From Me',
            description:
              'Whether to return only sent (true) or only received (false) messages',
            type: 'boolean',
            default: true,
          },
          {
            name: 'search',
            displayName: 'Search',
            description:
              'Search messages by text content (minimum 2 characters)',
            type: 'string',
            default: '',
          },
          {
            name: 'type',
            displayName: 'Type',
            type: 'options',
            options: [
              { name: 'Audio', value: 'audio' },
              { name: 'Document', value: 'document' },
              { name: 'Image', value: 'image' },
              { name: 'Interactive', value: 'interactive' },
              { name: 'Sticker', value: 'sticker' },
              { name: 'Template', value: 'template' },
              { name: 'Text', value: 'text' },
              { name: 'Video', value: 'video' },
            ],
            default: 'text',
          },
          {
            name: 'after',
            displayName: 'Created After',
            description: 'Return messages created from this date on',
            type: 'dateTime',
            default: '',
          },
          {
            name: 'before',
            displayName: 'Created Before',
            description: 'Return messages created up to this date',
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
    const conversationId: string = this.getNodeParameter(
      'conversationId',
      itemIndex,
    ) as string;

    const filters: IDataObject = this.getNodeParameter(
      'filters',
      itemIndex,
      {},
    );

    return {
      json: await getListResults.call(
        this,
        itemIndex,
        `conversations/${conversationId}/messages`,
        compactObject(filters),
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
