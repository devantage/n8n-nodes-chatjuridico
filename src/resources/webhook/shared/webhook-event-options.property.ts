import type { INodePropertyOptions } from 'n8n-workflow';

/**
 * Events a webhook can subscribe to.
 */
export const webhookEventOptions: INodePropertyOptions[] = [
  { name: 'Automation Activated', value: 'automation.activated' },
  { name: 'Automation Deactivated', value: 'automation.deactivated' },
  { name: 'Automation Executed', value: 'automation.executed' },
  { name: 'Contact Created', value: 'contact.created' },
  { name: 'Contact Updated', value: 'contact.updated' },
  { name: 'Conversation Created', value: 'conversation.created' },
  { name: 'Conversation Updated', value: 'conversation.updated' },
  { name: 'Message Received', value: 'message.received' },
  { name: 'Message Sent', value: 'message.sent' },
  { name: 'Message Status Changed', value: 'message.status_changed' },
];
