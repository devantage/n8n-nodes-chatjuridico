import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import {
  type IBinaryData,
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
import type { UploadUrl } from '../models';
import { mediaTypeProperty } from '../shared';

export class UploadOperation extends ResourceOperation {
  public readonly name: string = 'upload';

  public readonly displayName: string = 'Upload';

  public readonly description: string =
    'Upload a binary file and get a public URL to send it in messages';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'binaryPropertyName',
        displayName: 'Input Binary Field',
        description: 'Name of the input binary field containing the file',
        type: 'string',
        required: true,
        default: 'data',
      },
      mediaTypeProperty,
      {
        name: 'uploadMethod',
        displayName: 'Upload Method',
        type: 'options',
        options: [
          {
            name: 'Direct (Base64)',
            value: 'direct',
            description:
              'Send the file through the API. Best for files up to ~4.5MB.',
          },
          {
            name: 'Presigned URL',
            value: 'presigned',
            description:
              'Upload the file straight to the storage. Supports large files (up to 100MB for documents).',
          },
        ],
        default: 'direct',
      },
      {
        name: 'options',
        displayName: 'Options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            name: 'file_name',
            displayName: 'File Name',
            description:
              'File name with extension (e.g. contract.pdf). Defaults to the binary file name.',
            type: 'string',
            default: '',
          },
          {
            name: 'content_type',
            displayName: 'Content Type',
            description:
              'MIME type of the file, used by the presigned URL method. Defaults to the binary MIME type.',
            type: 'string',
            displayOptions: {
              show: {
                '/uploadMethod': ['presigned'],
              },
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
    const binaryPropertyName: string = this.getNodeParameter(
      'binaryPropertyName',
      itemIndex,
      'data',
    );

    const mediaType: string = this.getNodeParameter(
      'mediaType',
      itemIndex,
    ) as string;

    const uploadMethod: string = this.getNodeParameter(
      'uploadMethod',
      itemIndex,
      'direct',
    ) as string;

    const options: IDataObject = this.getNodeParameter(
      'options',
      itemIndex,
      {},
    );

    const binaryData: IBinaryData = this.helpers.assertBinaryData(
      itemIndex,
      binaryPropertyName,
    );

    const fileName: string | undefined =
      (options.file_name as string | undefined) || binaryData.fileName;

    if (!fileName) {
      throw new NodeOperationError(
        this.getNode(),
        'The binary file has no name. Please set the "File Name" option.',
        { itemIndex },
      );
    }

    const buffer: Buffer = await this.helpers.getBinaryDataBuffer(
      itemIndex,
      binaryPropertyName,
    );

    if (uploadMethod !== 'presigned') {
      const response: ApiResponse = await httpClient.post<ApiResponse>(
        this,
        'media/upload',
        {
          file_name: fileName,
          media_type: mediaType,
          data: buffer.toString('base64'),
        },
      );

      return {
        json: response.data,
        pairedItem: itemIndex,
      };
    }

    const response: ApiResponse<UploadUrl> = await httpClient.post<
      ApiResponse<UploadUrl>
    >(
      this,
      'media/upload-url',
      compactObject({
        file_name: fileName,
        media_type: mediaType,
        content_type: options.content_type || binaryData.mimeType,
      }),
    );

    await this.helpers.httpRequest({
      method: 'PUT',
      url: response.data.upload_url,
      body: buffer,
      headers: {
        'Content-Type': response.data.content_type,
      },
    });

    return {
      json: {
        media_url: response.data.media_url,
        media_type: mediaType,
        content_type: response.data.content_type,
        file_size: buffer.length,
        file_name: fileName,
      },
      pairedItem: itemIndex,
    };
  }
}
