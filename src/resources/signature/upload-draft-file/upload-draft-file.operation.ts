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
import {
  draftIdProperty,
  fileNameField,
  fileTypeField,
  fileUrlProperty,
} from '../shared';

export class UploadDraftFileOperation extends ResourceOperation {
  public readonly name: string = 'uploadDraftFile';

  public readonly displayName: string = 'Upload Draft File';

  public readonly description: string =
    'Upload the file (PDF or DOCX) of a draft document from a public URL';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      draftIdProperty,
      fileUrlProperty,
      {
        name: 'additionalFields',
        displayName: 'Additional Fields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [fileNameField, fileTypeField],
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const draftId: string = this.getNodeParameter(
      'draftId',
      itemIndex,
    ) as string;

    const fileUrl: string = this.getNodeParameter(
      'fileUrl',
      itemIndex,
    ) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
      {},
    );

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `signatures/drafts/${draftId}/upload`,
      compactObject({ ...additionalFields, file_url: fileUrl }),
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
