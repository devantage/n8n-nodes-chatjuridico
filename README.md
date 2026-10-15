![Logo](https://s3.devantage.com.br/devantage-public/logo-100x100.png)

# n8n-nodes-chatjuridico

This is an n8n community node for the ChatJuridico Public API.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Credentials](#credentials)  
[Nodes](#nodes)  
[Operations](#operations)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. The published package's name is: `@devantage/n8n-nodes-chatjuridico`

## Credentials

Create an API key in the ChatJuridico dashboard under **Settings > Developers** and use it in the **ChatJuridico API** credential. The key is sent in the `X-API-Key` header, and each operation requires the matching scope on the key (e.g. `contacts:read`, `conversations:write`).

## Nodes

- **ChatJuridico**: performs operations on the resources listed below.
- **ChatJuridico Trigger**: starts a workflow on ChatJuridico events (messages, conversations, contacts and automations). The webhook is registered in ChatJuridico when the workflow is activated, removed when it is deactivated, and every delivery is checked against its HMAC-SHA256 signature (`X-Webhook-Signature`). The API only accepts HTTPS webhook URLs.

## Operations

These are the currently available resources and their respective operations. List operations return a single item with a `data` array; enable **Return All** to follow the cursor pagination automatically.

### AI Agent

- Get Status
- Activate
- Deactivate

### AI Agent FAQ

- List
- Create
- Update
- Delete
- Generate
- Suggest From Conversations

### AI Agent Follow-Up

- List
- Cancel

### AI Agent Session

- List
- Count
- Daily Count
- Get
- Complete
- Send Feedback
- List Evaluations
- List Logs

### AI Agent Simulation

- List
- Create
- Get
- List Messages
- Send Message
- End

### Analytics

- Get Dashboard
- Get Contact Metrics
- Get Team Performance
- Get Stage Metrics
- Get Response Times
- List Interactions
- List Conversations
- Get Ad Metrics

### API Usage

- Get
- Get Rate Limits

### Asaas Customer

- List
- Sync
- Create

### Asaas Integration

- Get Status
- Activate
- Deactivate
- Detect Environment

### Automation

- List
- Get
- Create
- Update
- Delete
- Toggle
- List Executions
- Get Execution Stats

### Campaign

- List
- Get
- Create
- Update
- Delete
- List Recipients
- Get Analytics
- Send
- Cancel

### Contact

- List
- Get
- Create
- Bulk Create
- Update
- Delete
- Merge
- Find Duplicates
- Update Profile Picture

### Conversation

- List
- Search
- Count
- Get
- Create
- Update
- Transfer

### Draft

- List
- Get
- Save
- Delete

### Funnel

- List
- Get

### Funnel Stage

- List
- Get
- Create
- Update
- Delete

### Lawsuit

- List
- Get
- Create
- Update
- Unbind Conversation
- Set Active
- Clear Active

### Media

- Upload
- Get Upload URL

### Member

- List

### Message

- List
- Send
- Send Sequence
- Get
- Delete
- React
- Transcribe
- Get Media

### Note

- List
- Get
- Create
- Update
- Delete

### Payment (Asaas)

- List
- Get
- Create
- Cancel
- Acknowledge Overdue
- Schedule Reminders
- Fill Data
- Get Dashboard
- Get Time Series
- Get Funnel Values
- Get Chat Values

### Scheduled Message

- List
- Get
- Create
- Cancel

### Shortcut

- List
- Get
- Create
- Update
- Delete

### Signature Document (ZapSign)

- List
- Get
- Create and Send
- Update
- Delete
- Get Download URL
- Create Draft
- Upload Draft File
- Send Draft
- Extract Signer Data

### Tag

- List
- Get
- Create
- Update
- Delete

### Webhook

- List
- Get
- Create
- Update
- Delete
- Test

### WhatsApp Number

- List
- Get
- Get Status
- Get QR Code
- Reconnect

### WhatsApp Template

- List
- Get
- Create
- Update
- Delete

### ZapSign Integration

- Get Status
- Activate
- Deactivate
- Sync Credits

## Compatibility

The current version is compatible with n8n installations above v1.0.0.

## Usage

Instructions will be written as soon as possible.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [ChatJuridico Public API specification](https://api.jur.chat/v1/openapi.json)
