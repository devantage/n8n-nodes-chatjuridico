import { ResourceRegistry } from '@devantage/n8n-custom-nodes-framework';

import { AgentSessionResource } from './agent-session';
import { AiAgentResource } from './ai-agent';
import { AnalyticsResource } from './analytics';
import { AnnotationResource } from './annotation';
import { AsaasCustomerResource } from './asaas-customer';
import { AsaasIntegrationResource } from './asaas-integration';
import { AutomationResource } from './automation';
import { CampaignResource } from './campaign';
import { ContactResource } from './contact';
import { ConversationResource } from './conversation';
import { DraftResource } from './draft';
import { FaqResource } from './faq';
import { FollowUpResource } from './follow-up';
import { FunnelResource } from './funnel';
import { FunnelStageResource } from './funnel-stage';
import { InstanceResource } from './instance';
import { LawsuitResource } from './lawsuit';
import { MediaResource } from './media';
import { MemberResource } from './member';
import { MessageResource } from './message';
import { PaymentResource } from './payment';
import { ScheduledMessageResource } from './scheduled-message';
import { ShortcutResource } from './shortcut';
import { SignatureResource } from './signature';
import { SimulationResource } from './simulation';
import { TagResource } from './tag';
import { TemplateResource } from './template';
import { UsageResource } from './usage';
import { WebhookResource } from './webhook';
import { ZapSignIntegrationResource } from './zapsign-integration';

export const resourceRegistry: ResourceRegistry = new ResourceRegistry(
  new AiAgentResource(),
  new FaqResource(),
  new FollowUpResource(),
  new AgentSessionResource(),
  new SimulationResource(),
  new AnalyticsResource(),
  new UsageResource(),
  new AsaasCustomerResource(),
  new AsaasIntegrationResource(),
  new AutomationResource(),
  new CampaignResource(),
  new ContactResource(),
  new ConversationResource(),
  new DraftResource(),
  new FunnelResource(),
  new FunnelStageResource(),
  new LawsuitResource(),
  new MediaResource(),
  new MemberResource(),
  new MessageResource(),
  new AnnotationResource(),
  new PaymentResource(),
  new ScheduledMessageResource(),
  new ShortcutResource(),
  new SignatureResource(),
  new TagResource(),
  new WebhookResource(),
  new InstanceResource(),
  new TemplateResource(),
  new ZapSignIntegrationResource(),
);
