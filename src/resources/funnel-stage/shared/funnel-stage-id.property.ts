import type { INodeProperties } from 'n8n-workflow';

export const funnelStageIdProperty: INodeProperties = {
  name: 'stageId',
  displayName: 'Funnel Stage Name or ID',
  description:
    'The funnel stage. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'getFunnelStageOptions',
  },
  required: true,
  default: '',
};
