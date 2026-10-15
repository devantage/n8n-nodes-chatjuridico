import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import {
  type ApiResponse,
  httpClient,
  withOperationDisplayOptions,
} from '../../../utils';
import { documentIdProperty } from '../shared';

export class GetDownloadUrlOperation extends ResourceOperation {
  public readonly name: string = 'getDownloadUrl';

  public readonly displayName: string = 'Get Download URL';

  public readonly description: string =
    'Get the download URL of the original or signed document';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      documentIdProperty,
      {
        name: 'type',
        displayName: 'File',
        type: 'options',
        options: [
          {
            name: 'Original',
            value: 'original',
            description: 'The uploaded document',
          },
          {
            name: 'Signed',
            value: 'signed',
            description: 'The signed document (only after completion)',
          },
        ],
        default: 'original',
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const documentId: string = this.getNodeParameter(
      'documentId',
      itemIndex,
    ) as string;

    const type: string = this.getNodeParameter('type', itemIndex) as string;

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      `signatures/${documentId}/download`,
      { type },
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
