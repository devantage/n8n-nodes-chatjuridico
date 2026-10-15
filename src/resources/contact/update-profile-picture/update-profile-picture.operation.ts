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
import { contactIdProperty } from '../shared';

export class UpdateProfilePictureOperation extends ResourceOperation {
  public readonly name: string = 'updateProfilePicture';

  public readonly displayName: string = 'Update Profile Picture';

  public readonly description: string =
    'Fetch and update the contact profile picture from WhatsApp';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [contactIdProperty],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const contactId: string = this.getNodeParameter(
      'contactId',
      itemIndex,
    ) as string;

    const response: ApiResponse = await httpClient.post<ApiResponse>(
      this,
      `contacts/${contactId}/profile-picture`,
    );

    return {
      json: response.data,
      pairedItem: itemIndex,
    };
  }
}
