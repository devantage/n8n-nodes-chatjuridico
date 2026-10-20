import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IDataObject,
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

export class GetPropertiesOperation extends ResourceOperation {
  public readonly name: string = 'getProperties';

  public readonly displayName: string = 'Get Properties';

  public readonly description: string =
    'Get the custom property values of a contact';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      contactIdProperty,
      {
        name: 'returnAsJson',
        displayName: 'Return as JSON',
        description: 'Return properties as a JSON instead of an array',
        type: 'boolean',
        required: false,
        default: false,
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const contactId: string = this.getNodeParameter(
      'contactId',
      itemIndex,
    ) as string;

    const returnAsJson: boolean = this.getNodeParameter(
      'returnAsJson',
      itemIndex,
    ) as boolean;

    const response: ApiResponse = await httpClient.get<ApiResponse>(
      this,
      `contacts/${contactId}/properties`,
    );

    let responseData: IDataObject = response.data;

    if (returnAsJson && Array.isArray(responseData)) {
      responseData = responseData.reduce(
        (previous: IDataObject, current: IDataObject) => ({
          ...previous,
          [current.key as string]: current.value,
        }),
        {},
      ) as IDataObject;
    }

    return {
      json: responseData,
      pairedItem: itemIndex,
    };
  }
}
