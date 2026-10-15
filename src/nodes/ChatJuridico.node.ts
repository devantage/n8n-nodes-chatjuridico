import { ResourceNode } from '@devantage/n8n-custom-nodes-framework';
import type { INodeType } from 'n8n-workflow';

import { resourceRegistry } from '../resources';
import { getFunnelOptions } from '../resources/funnel';
import { getFunnelStageOptions } from '../resources/funnel-stage';
import { getInstanceOptions } from '../resources/instance';
import { getMemberOptions } from '../resources/member';
import { getTagOptions } from '../resources/tag';
import { CHATJURIDICO_CREDENTIAL_TYPE } from '../utils';

export class ChatJuridico extends ResourceNode {
  public readonly methods: INodeType['methods'] = {
    loadOptions: {
      getFunnelOptions,
      getFunnelStageOptions,
      getInstanceOptions,
      getMemberOptions,
      getTagOptions,
    },
  };

  public constructor() {
    super(resourceRegistry, {
      displayName: 'ChatJuridico',
      name: 'chatJuridico',
      icon: 'file:../icons/icon.svg',
      version: 1,
      subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
      description: 'n8n community nodes for ChatJuridico Public API',
      credentials: [
        {
          name: CHATJURIDICO_CREDENTIAL_TYPE,
          required: true,
        },
      ],
    });
  }
}
