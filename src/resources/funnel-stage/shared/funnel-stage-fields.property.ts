import type { INodeProperties } from 'n8n-workflow';

/**
 * Optional funnel stage fields shared by the create and update operations.
 */
export const funnelStageFields: INodeProperties[] = [
  {
    name: 'color_hex',
    displayName: 'Color',
    description: 'Stage color in hex format',
    type: 'color',
    default: '#3B82F6',
  },
  {
    name: 'color_name',
    displayName: 'Color Name',
    type: 'string',
    default: '',
  },
  {
    name: 'stage_order',
    displayName: 'Stage Order',
    description: 'Stage position in the funnel',
    type: 'number',
    default: 1,
  },
  {
    name: 'funnel_id',
    displayName: 'Funnel Name or ID',
    description:
      'Funnel this stage belongs to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getFunnelOptions',
    },
    default: '',
  },
];
