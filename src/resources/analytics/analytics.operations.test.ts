import { TestUtil } from '@devantage/n8n-custom-nodes-framework';

import { describeOperationCases, expectScopedProperties } from '../../testing';
import { httpClient } from '../../utils';
import { AnalyticsResource } from './analytics.resource';
import { GetAdMetricsOperation } from './get-ad-metrics';
import { GetContactMetricsOperation } from './get-contact-metrics';
import { GetDashboardOperation } from './get-dashboard';
import { GetResponseTimesOperation } from './get-response-times';
import { GetStageMetricsOperation } from './get-stage-metrics';
import { GetTeamPerformanceOperation } from './get-team-performance';
import { ListConversationsOperation } from './list-conversations';
import { ListInteractionsOperation } from './list-interactions';
import { createAnalyticsFiltersProperty } from './shared';

describe('analytics operations', (): void => {
  describeOperationCases([
    {
      label: 'gets the dashboard',
      operation: new GetDashboardOperation('analytics'),
      parameters: {
        filters: {
          start_date: '2026-01-01T00:00:00',
          end_date: '',
          instance_id: 'instance-1',
        },
        options: { compare: true },
      },
      method: 'get',
      response: { data: { total_interactions: 10 } },
      expectedRequest: [
        'analytics/dashboard',
        {
          start_date: '2026-01-01T00:00:00',
          instance_id: 'instance-1',
          compare: true,
        },
      ],
      expectedJson: { total_interactions: 10 },
    },
    {
      label: 'gets the contact metrics',
      operation: new GetContactMetricsOperation('analytics'),
      parameters: {
        view: 'tags',
        filters: { period: 'month', tag_ids: ['tag-1', 'tag-2'] },
      },
      method: 'get',
      response: { data: { tags: [] } },
      expectedRequest: [
        'analytics/contacts',
        { period: 'month', tag_ids: 'tag-1,tag-2', view: 'tags' },
      ],
      expectedJson: { tags: [] },
    },
    {
      label: 'gets the contact metrics with tags from an expression',
      operation: new GetContactMetricsOperation('analytics'),
      parameters: { view: 'overview', filters: { tag_ids: 'tag-1, tag-2' } },
      method: 'get',
      response: { data: {} },
      expectedRequest: [
        'analytics/contacts',
        { tag_ids: 'tag-1,tag-2', view: 'overview' },
      ],
      expectedJson: {},
    },
    {
      label: 'gets the team performance',
      operation: new GetTeamPerformanceOperation('analytics'),
      parameters: { filters: { user_id: 'user-1' } },
      method: 'get',
      response: { data: { members: [] } },
      expectedRequest: ['analytics/team', { user_id: 'user-1' }],
      expectedJson: { members: [] },
    },
    {
      label: 'gets the stage metrics',
      operation: new GetStageMetricsOperation('analytics'),
      parameters: { filters: {} },
      method: 'get',
      response: { data: { stages: [] } },
      expectedRequest: ['analytics/stages', {}],
      expectedJson: { stages: [] },
    },
    {
      label: 'gets the response times',
      operation: new GetResponseTimesOperation('analytics'),
      parameters: {
        filters: { period: 'quarter' },
        options: { group_by: 'week', business_hours_only: true },
      },
      method: 'get',
      response: { data: { summary: {} } },
      expectedRequest: [
        'analytics/response-times',
        { period: 'quarter', group_by: 'week', business_hours_only: true },
      ],
      expectedJson: { summary: {} },
    },
    {
      label: 'lists the interactions',
      operation: new ListInteractionsOperation('analytics'),
      parameters: {
        returnAll: false,
        limit: 100,
        filters: { chat_id: 'chat-1', interaction_type: 'tag_add' },
      },
      method: 'get',
      response: { data: [{ id: 'interaction-1' }], pagination: {} },
      expectedRequest: [
        'analytics/interactions',
        { chat_id: 'chat-1', interaction_type: 'tag_add', limit: 100 },
      ],
      expectedJson: { data: [{ id: 'interaction-1' }], pagination: {} },
    },
    {
      label: 'lists a page of conversations',
      operation: new ListConversationsOperation('analytics'),
      parameters: {
        returnAll: false,
        limit: 20,
        filters: { stage_id: 'stage-1', tag_ids: [] },
      },
      method: 'get',
      response: { data: { items: [{ id: 'chat-1' }] }, pagination: {} },
      expectedRequest: [
        'analytics/conversations',
        { stage_id: 'stage-1', limit: 20 },
      ],
      expectedJson: { data: { items: [{ id: 'chat-1' }] }, pagination: {} },
    },
    {
      label: 'gets the ad metrics',
      operation: new GetAdMetricsOperation('analytics'),
      parameters: { filters: { period: 'year' } },
      method: 'get',
      response: { data: { total_ad_contacts: 3 } },
      expectedRequest: ['analytics/ads', { period: 'year' }],
      expectedJson: { total_ad_contacts: 3 },
    },
  ]);

  it('merges every page of conversations', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        returnAll: true,
        filters: { period: 'month' },
      });
    const getSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce({
        data: { items: [{ id: 'chat-1' }], period: { start: 'a', end: 'b' } },
        pagination: { has_more: true, next_cursor: 'cursor-1', limit: 200 },
      })
      .mockResolvedValueOnce({
        data: { items: [{ id: 'chat-2' }], period: { start: 'a', end: 'b' } },
        pagination: { has_more: false, next_cursor: null, limit: 200 },
      });

    await expect(
      new ListConversationsOperation('analytics').execute.call(
        context as never,
        0,
      ),
    ).resolves.toEqual({
      json: {
        data: {
          items: [{ id: 'chat-1' }, { id: 'chat-2' }],
          period: { start: 'a', end: 'b' },
        },
      },
      pairedItem: 0,
    });

    expect(getSpy).toHaveBeenNthCalledWith(
      1,
      context,
      'analytics/conversations',
      { period: 'month', limit: 200 },
    );
    expect(getSpy).toHaveBeenNthCalledWith(
      2,
      context,
      'analytics/conversations',
      { period: 'month', limit: 200, cursor: 'cursor-1' },
    );
  });

  it('stops merging conversations without pagination metadata', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({ returnAll: true, filters: {} });

    jest.spyOn(httpClient, 'get').mockResolvedValueOnce({
      data: { items: [{ id: 'chat-1' }] },
    });

    await expect(
      new ListConversationsOperation('analytics').execute.call(
        context as never,
        0,
      ),
    ).resolves.toEqual({
      json: { data: { items: [{ id: 'chat-1' }] } },
      pairedItem: 0,
    });
  });

  it('builds the filters collection with or without the WhatsApp number', (): void => {
    const names = (includeInstance: boolean): string[] =>
      (
        createAnalyticsFiltersProperty([], includeInstance).options as {
          name: string;
        }[]
      ).map(({ name }: { name: string }): string => name);

    expect(names(true)).toEqual([
      'start_date',
      'end_date',
      'period',
      'instance_id',
    ]);
    expect(names(false)).toEqual(['start_date', 'end_date', 'period']);
  });

  it('registers every operation scoped to the resource', (): void => {
    const resource: AnalyticsResource = new AnalyticsResource();

    for (const name of [
      'getDashboard',
      'getContactMetrics',
      'getTeamPerformance',
      'getStageMetrics',
      'getResponseTimes',
      'listInteractions',
      'listConversations',
      'getAdMetrics',
    ]) {
      expectScopedProperties(resource.getOperation(name), 'analytics');
    }
  });
});
