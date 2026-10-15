import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { httpClient, withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';

const MAX_LIMIT: number = 50;

export class ListOperation extends ResourceOperation {
  public readonly name: string = 'list';

  public readonly displayName: string = 'List';

  public readonly description: string = 'List or search the office lawsuits';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'mode',
        displayName: 'Mode',
        type: 'options',
        options: [
          {
            name: 'By Conversation',
            value: 'conversation',
            description:
              'Lawsuits bound to a conversation, with their latest movements',
          },
          {
            name: 'By Contact',
            value: 'contact',
            description:
              'Lawsuits bound to a contact, with their latest movements',
          },
          {
            name: 'Search',
            value: 'search',
            description: 'Search by party name, status and/or lawyer',
          },
        ],
        default: 'search',
      },
      {
        name: 'conversationId',
        displayName: 'Conversation ID',
        description: 'The ID (UUID) of the conversation',
        type: 'string',
        required: true,
        default: '',
        displayOptions: { show: { mode: ['conversation'] } },
      },
      {
        name: 'contactId',
        displayName: 'Contact ID',
        description: 'The ID (UUID) of the contact',
        type: 'string',
        required: true,
        default: '',
        displayOptions: { show: { mode: ['contact'] } },
      },
      {
        name: 'maxMovements',
        displayName: 'Max Movements',
        description: 'Number of recent movements to include for each lawsuit',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 20,
        },
        default: 5,
        displayOptions: { show: { mode: ['conversation', 'contact'] } },
      },
      ...createListProperties(MAX_LIMIT, 20).map(
        (curProperty: INodeProperties): INodeProperties => ({
          ...curProperty,
          displayOptions: {
            show: {
              ...curProperty.displayOptions?.show,
              mode: ['search'],
            },
          },
        }),
      ),
      {
        name: 'filters',
        displayName: 'Filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: { show: { mode: ['search'] } },
        options: [
          {
            name: 'parte',
            displayName: 'Party Name',
            description:
              'Return lawsuits where the name of one of the parties contains this text',
            type: 'string',
            default: '',
          },
          {
            name: 'status',
            displayName: 'Status',
            description: 'Operational status of the lawsuit in the office',
            type: 'options',
            options: [
              { name: 'Appeal', value: 'RECURSAL' },
              { name: 'Awaiting Closure', value: 'AGUARDANDO_BAIXA' },
              { name: 'Closed', value: 'ENCERRADO' },
              { name: 'Draft', value: 'RASCUNHO' },
              { name: 'Enforcement', value: 'EXECUCAO' },
              { name: 'Knowledge Phase', value: 'CONHECIMENTO' },
            ],
            default: 'CONHECIMENTO',
          },
          {
            name: 'advogado_id',
            displayName: 'Lawyer Name or ID',
            description:
              'Return only the lawsuits of this responsible lawyer. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            type: 'options',
            typeOptions: {
              loadOptionsMethod: 'getMemberOptions',
            },
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
    const mode: string = this.getNodeParameter('mode', itemIndex) as string;

    if (mode === 'search') {
      const filters: IDataObject = this.getNodeParameter(
        'filters',
        itemIndex,
        {},
      );

      return {
        json: await getListResults.call(
          this,
          itemIndex,
          'lawsuits',
          filters,
          MAX_LIMIT,
        ),
        pairedItem: itemIndex,
      };
    }

    const maxMovements: number = this.getNodeParameter(
      'maxMovements',
      itemIndex,
      5,
    ) as number;

    const queryParams: IDataObject =
      mode === 'conversation'
        ? {
            conversation_id: this.getNodeParameter('conversationId', itemIndex),
          }
        : {
            contact_id: this.getNodeParameter('contactId', itemIndex),
          };

    return {
      json: await httpClient.get<IDataObject>(this, 'lawsuits', {
        ...queryParams,
        max_movements: maxMovements,
      }),
      pairedItem: itemIndex,
    };
  }
}
