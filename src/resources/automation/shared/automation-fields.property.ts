import type { INodeProperties } from 'n8n-workflow';

/**
 * Optional automation fields shared by the create and update operations.
 */
export const automationFields: INodeProperties[] = [
  {
    name: 'description',
    displayName: 'Description',
    description: 'Automation description (up to 1000 characters)',
    type: 'string',
    default: '',
  },
  {
    name: 'flow_json',
    displayName: 'Flow (JSON)',
    description:
      'Automation flow as a React Flow graph `{version, nodes, edges}` with exactly one `trigger` node. Replaces the whole flow.',
    type: 'json',
    default: '{\n  "version": 0,\n  "nodes": [],\n  "edges": []\n}',
  },
  {
    name: 'is_active',
    displayName: 'Is Active',
    description: 'Whether the automation is active',
    type: 'boolean',
    default: false,
  },
];
