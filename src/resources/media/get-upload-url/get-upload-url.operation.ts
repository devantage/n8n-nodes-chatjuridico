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
  withOperationDisplayOptions,
} from '../../../utils';
import { mediaTypeProperty } from '../shared';

export class GetUploadUrlOperation extends ResourceOperation {
  public readonly name: string = 'getUploadUrl';

  public readonly displayName: string = 'Get Upload URL';

  public readonly description: string =
    'Get a presigned URL to upload a file directly to the storage';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'fileName',
        displayName: 'File Name',
        description: 'File name with extension (e.g. video.mp4)',
        type: 'string',
        required: true,
        default: '',
      },
      mediaTypeProperty,
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            name: 'content_type',
            displayName: 'Content Type',
            description:
              'MIME type of the file. Detected from the extension when omitted.',
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
    const fileName: string = this.getNodeParameter(
      'fileName',
      itemIndex,
    ) as string;

    const mediaType: string = this.getNodeParameter(
      'mediaType',
      itemIndex,
    ) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      'media/upload-url',
      compactObject({
        ...additionalFields,
        file_name: fileName,
        media_type: mediaType,
      }),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
