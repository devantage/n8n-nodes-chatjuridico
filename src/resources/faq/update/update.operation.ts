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
  withOperationDisplayOptions,
} from '../../../utils';
import { agentIdProperty, faqItemIdProperty } from '../shared';

export class UpdateOperation extends ResourceOperation {
  public readonly name: string = 'update';

  public readonly displayName: string = 'Update';

  public readonly description: string = 'Update an FAQ item of an AI agent';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      agentIdProperty,
      faqItemIdProperty,
      {
        name: 'updateFields',
        displayName: 'Update Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'question',
            displayName: 'Question',
            description: 'New question (max 1000 characters)',
            type: 'string',
            default: '',
          },
          {
            name: 'answer',
            displayName: 'Answer',
            description: 'New answer (max 5000 characters)',
            type: 'string',
            typeOptions: {
              rows: 4,
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
    const agentId: string = this.getNodeParameter(
      'agentId',
      itemIndex,
    ) as string;

    const itemId: string = this.getNodeParameter('itemId', itemIndex) as string;

    const updateFields: IDataObject = this.getNodeParameter(
      'updateFields',
      itemIndex,
      {},
    );

    const body: IDataObject = compactObject(updateFields);

    if (!Object.keys(body).length) {
      throw new NodeOperationError(
        this.getNode(),
        'Please add at least one field to update',
        { itemIndex },
      );
    }

    const response: ApiResponse = await httpClient.put<ApiResponse>(
      this,
      `agents/${agentId}/faq/${itemId}`,
      undefined,
      body,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
