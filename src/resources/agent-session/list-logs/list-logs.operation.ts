import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { withOperationDisplayOptions } from '../../../utils';
import { createListProperties, getListResults } from '../../shared';
import { agentSessionIdProperty } from '../shared';

export class ListLogsOperation extends ResourceOperation {
  public readonly name: string = 'listLogs';

  public readonly displayName: string = 'List Logs';

  public readonly description: string =
    'List the debug logs of an AI agent session';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [agentSessionIdProperty, ...createListProperties(200, 100)],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const sessionId: string = this.getNodeParameter(
      'sessionId',
      itemIndex,
    ) as string;

    return {
      json: await getListResults.call(
        this,
        itemIndex,
        `agent-sessions/${sessionId}/logs`,
        {},
        200,
      ),
      pairedItem: itemIndex,
    };
  }
}
