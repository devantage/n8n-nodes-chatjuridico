import type { INodeProperties } from 'n8n-workflow';

export const simulationIdProperty: INodeProperties = {
  name: 'simulationId',
  displayName: 'Simulation ID',
  description: 'The ID (UUID) of the simulation session',
  type: 'string',
  required: true,
  default: '',
};
