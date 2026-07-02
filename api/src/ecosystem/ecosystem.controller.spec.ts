import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EcosystemController } from './ecosystem.controller';
import { EcosystemService } from './ecosystem.service';

jest.mock('./teams', () => ({
  ALL_TEAMS: [
    { id: 'team-a', name: 'Team A', deployers: [] },
    { id: 'team-b', name: 'Team B', deployers: [] },
  ],
}));

describe('EcosystemController', () => {
  let controller: EcosystemController;
  let service: {
    getLatest: jest.Mock;
    capture: jest.Mock;
    isCapturing: jest.Mock;
    getGraphqlUrl: jest.Mock;
  };
  let fetchMock: jest.Mock;

  beforeEach(async () => {
    service = {
      getLatest: jest.fn(),
      capture: jest.fn().mockResolvedValue(undefined),
      isCapturing: jest.fn().mockReturnValue(false),
      getGraphqlUrl: jest.fn().mockReturnValue('https://graphql.mainnet.iota.cafe'),
    };
    const module = await Test.createTestingModule({
      controllers: [EcosystemController],
      providers: [{ provide: EcosystemService, useValue: service }],
    }).compile();
    controller = module.get(EcosystemController);
    fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
  });

  afterEach(() => jest.restoreAllMocks());

  const mkProject = (overrides: any = {}) => ({
    slug: 'p1',
    name: 'P1',
    layer: 'L1',
    category: 'DeFi',
    description: '',
    urls: [],
    packages: 1,
    packageAddress: '0xaa',
    latestPackageAddress: '0xaa',
    packageAddresses: ['0xaa'],
    storageIota: 0,
    events: 0,
    eventsCapped: false,
    modules: ['mod'],
    tvl: null,
    logo: null,
    logoWordmark: null,
    team: { id: 'team-a', name: 'Team A' },
    disclaimer: null,
    detectedDeployers: [],
    anomalousDeployers: [],
    uniqueSenders: 0,
    attribution: null,
    ...overrides,
  });

  describe('GET /ecosystem', () => {
    it('returns the stored snapshot', async () => {
      const data = { l1: [mkProject()], l2: [], totalProjects: 1 };
      service.getLatest.mockResolvedValue(data);
      await expect(controller.getProjects()).resolves.toBe(data);
    });

    it('returns an empty structure when no snapshot exists', async () => {
      service.getLatest.mockResolvedValue(null);
      const result = await controller.getProjects();
      expect(result).toMatchObject({ l1: [], l2: [], totalProjects: 0, totalEvents: 0 });
    });
  });

  describe('GET /ecosystem/growth-ranking', () => {
    let growthRanking: jest.Mock;

    beforeEach(() => {
      growthRanking = jest.fn();
      (service as any).growthRanking = growthRanking;
    });

    it('defaults window=all and scope=all when params omitted', async () => {
      growthRanking.mockResolvedValue({ items: [] });
      await controller.growthRanking(undefined, undefined);
      const [from, to, scope] = growthRanking.mock.calls[0];
      expect(scope).toBe('all');
      // window=all maps to epoch-0 baseline → full current values as deltas
      expect(from.getTime()).toBe(0);
      // `to` should be close to now (within 5 s for test stability)
      expect(Math.abs(Date.now() - to.getTime())).toBeLessThan(5000);
    });

    it('resolves 24h / 7d / 30d window shorthands to absolute dates', async () => {
      growthRanking.mockResolvedValue({ items: [] });
      for (const [label, ms] of [['24h', 86_400_000], ['7d', 7 * 86_400_000], ['30d', 30 * 86_400_000]] as const) {
        growthRanking.mockClear();
        await controller.growthRanking(label, 'all');
        const [from, to] = growthRanking.mock.calls[0];
        const span = to.getTime() - from.getTime();
        // Allow a few ms of slop for the test clock
        expect(Math.abs(span - ms)).toBeLessThan(50);
      }
    });

    it('400s on invalid window shorthand', async () => {
      await expect(controller.growthRanking('1y', 'all')).rejects.toThrow(/window/);
    });

    it('400s on invalid scope', async () => {
      await expect(controller.growthRanking('7d', 'bogus')).rejects.toThrow(/scope/);
    });

    it('404s when the service returns null (no snapshots)', async () => {
      growthRanking.mockResolvedValue(null);
      await expect(controller.growthRanking('7d', 'all')).rejects.toThrow(/No snapshots/);
    });

    it('forwards scope to the service and returns its result', async () => {
      const result = { window: {}, baseline: null, latest: {}, items: [{ key: 'x' }] };
      growthRanking.mockResolvedValue(result);
      await expect(controller.growthRanking('7d', 'unattributed')).resolves.toBe(result);
      expect(growthRanking.mock.calls[0][2]).toBe('unattributed');
    });

    it('defaults sortBy=eventsDelta when omitted', async () => {
      growthRanking.mockResolvedValue({ items: [] });
      await controller.growthRanking('7d', 'all');
      expect(growthRanking.mock.calls[0][3]).toBe('eventsDelta');
    });

    it('forwards sortBy=transactionsDelta to the service', async () => {
      growthRanking.mockResolvedValue({ items: [] });
      await controller.growthRanking('7d', 'all', 'transactionsDelta');
      expect(growthRanking.mock.calls[0][3]).toBe('transactionsDelta');
    });

    it('400s on invalid sortBy', async () => {
      await expect(controller.growthRanking('7d', 'all', 'bogusDelta')).rejects.toThrow(/sortBy/);
    });
  });

  describe('GET /ecosystem/growth', () => {
    let computeGrowth: jest.Mock;

    beforeEach(() => {
      computeGrowth = jest.fn();
      (service as any).computeGrowth = computeGrowth;
    });

    it('400s when `from` or `to` is missing', async () => {
      await expect(controller.growth(undefined, '2026-04-20T00:00:00Z')).rejects.toThrow(/required/);
      await expect(controller.growth('2026-04-20T00:00:00Z', undefined)).rejects.toThrow(/required/);
    });

    it('400s when a date is not ISO-parsable', async () => {
      await expect(controller.growth('garbage', '2026-04-20T00:00:00Z')).rejects.toThrow(/ISO-8601/);
    });

    it('400s when `from` is after `to`', async () => {
      await expect(
        controller.growth('2026-04-20T00:00:00Z', '2026-04-13T00:00:00Z'),
      ).rejects.toThrow(/`from` must be <= `to`/);
    });

    it('404s when no snapshots cover the window', async () => {
      computeGrowth.mockResolvedValue(null);
      await expect(
        controller.growth('2026-04-13T00:00:00Z', '2026-04-20T00:00:00Z'),
      ).rejects.toThrow(/No snapshots/);
    });

    it('returns the computed growth when snapshots cover the window', async () => {
      const result = {
        from: new Date('2026-04-13T00:00:00Z'),
        to: new Date('2026-04-20T00:00:00Z'),
        baseline: { snapshotId: 'b', createdAt: new Date('2026-04-13T00:00:00Z') },
        latest: { snapshotId: 'l', createdAt: new Date('2026-04-20T00:00:00Z') },
        network: { totalEventsDelta: 10, totalStorageRebateDelta: 0, networkTxTotalDelta: 5, newPackages: 1 },
        packages: [],
      };
      computeGrowth.mockResolvedValue(result);
      await expect(
        controller.growth('2026-04-13T00:00:00Z', '2026-04-20T00:00:00Z'),
      ).resolves.toBe(result);
      expect(computeGrowth).toHaveBeenCalledWith(
        new Date('2026-04-13T00:00:00Z'),
        new Date('2026-04-20T00:00:00Z'),
      );
    });
  });

  describe('POST /ecosystem/rescan', () => {
    it('kicks off a capture when none is running and returns started=true', async () => {
      service.isCapturing.mockReturnValue(false);
      const result = await controller.rescan();
      expect(result).toEqual({ started: true, status: 'capture started' });
      expect(service.capture).toHaveBeenCalledTimes(1);
    });

    it('returns started=false when a capture is already in flight', async () => {
      service.isCapturing.mockReturnValue(true);
      const result = await controller.rescan();
      expect(result).toEqual({ started: false, status: 'already in flight' });
      expect(service.capture).not.toHaveBeenCalled();
    });

    it('swallows capture() rejections so the fire-and-forget call never crashes the response', async () => {
      service.isCapturing.mockReturnValue(false);
      service.capture.mockRejectedValue(new Error('boom'));
      await expect(controller.rescan()).resolves.toEqual({ started: true, status: 'capture started' });
    });
  });

  describe('GET /ecosystem/teams', () => {
    it('groups projects by team id', async () => {
      service.getLatest.mockResolvedValue({
        l1: [
          mkProject({ slug: 'a', name: 'A', team: { id: 'team-a' } }),
          mkProject({ slug: 'b', name: 'B', team: { id: 'team-b' } }),
        ],
        l2: [mkProject({ slug: 'c', name: 'C', layer: 'L2', team: { id: 'team-a' } })],
      });
      const result = await controller.getTeams();
      const a = result.find((t: any) => t.id === 'team-a')!;
      expect(a.projects.map((p: any) => p.slug).sort()).toEqual(['a', 'c']);
      const b = result.find((t: any) => t.id === 'team-b')!;
      expect(b.projects).toEqual([{ slug: 'b', name: 'B', category: 'DeFi', layer: 'L1' }]);
    });

    it('returns teams with empty projects when no data exists', async () => {
      service.getLatest.mockResolvedValue(null);
      const result = await controller.getTeams();
      expect(result).toHaveLength(2);
      expect(result.every((t: any) => t.projects.length === 0)).toBe(true);
    });
  });

  describe('GET /ecosystem/teams/:id', () => {
    it('returns the team with its projects', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ team: { id: 'team-a' } })],
        l2: [],
      });
      const result = await controller.getTeam('team-a');
      expect(result.id).toBe('team-a');
      expect(result.projects).toHaveLength(1);
    });

    it('404s on unknown team id', async () => {
      await expect(controller.getTeam('ghost')).rejects.toThrow(NotFoundException);
    });

    it('tolerates null snapshot when the team exists', async () => {
      service.getLatest.mockResolvedValue(null);
      const result = await controller.getTeam('team-a');
      expect(result.projects).toEqual([]);
    });
  });

  describe('GET /ecosystem/project/:slug', () => {
    it('returns the matching project', async () => {
      service.getLatest.mockResolvedValue({ l1: [mkProject()], l2: [] });
      const result = await controller.getProject('p1');
      expect(result.name).toBe('P1');
    });

    it('404s when no snapshot exists', async () => {
      service.getLatest.mockResolvedValue(null);
      await expect(controller.getProject('p1')).rejects.toThrow(NotFoundException);
    });

    it('404s when the slug is unknown', async () => {
      service.getLatest.mockResolvedValue({ l1: [mkProject()], l2: [] });
      await expect(controller.getProject('ghost')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /ecosystem/project/:slug/events', () => {
    it('404s when no snapshot exists', async () => {
      service.getLatest.mockResolvedValue(null);
      await expect(controller.getProjectEvents('p1')).rejects.toThrow(NotFoundException);
    });

    it('404s when the slug is unknown', async () => {
      service.getLatest.mockResolvedValue({ l1: [mkProject()], l2: [] });
      await expect(controller.getProjectEvents('ghost')).rejects.toThrow(NotFoundException);
    });

    it('returns empty events with a note for a project without a package', async () => {
      service.getLatest.mockResolvedValue({
        l1: [],
        l2: [mkProject({ slug: 'l2', layer: 'L2', packageAddress: null, latestPackageAddress: null, modules: [] })],
      });
      const result = await controller.getProjectEvents('l2');
      expect(result).toEqual({ events: [], module: null, note: 'No on-chain package for this project' });
    });

    it('returns the same note when modules array is empty', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ modules: [] })],
        l2: [],
      });
      const result = await controller.getProjectEvents('p1');
      expect(result.module).toBeNull();
    });

    it('fetches events newest-first, defaulting limit to 20 and capping at 50', async () => {
      service.getLatest.mockResolvedValue({ l1: [mkProject()], l2: [] });
      fetchMock.mockResolvedValue({
        json: async () => ({
          data: {
            events: {
              nodes: [
                { timestamp: '2026-01-01T00:00:00Z', type: { repr: '0x1::mod::Alpha' }, json: { a: 1 }, sender: { address: '0xs1' } },
                { timestamp: '2026-01-02T00:00:00Z', type: { repr: '0x1::mod::Beta' }, json: { a: 2 }, sender: { address: '0xs2' } },
              ],
            },
          },
        }),
      });

      const result = await controller.getProjectEvents('p1', '100');
      // limit capped at 50 in the GraphQL query
      expect(fetchMock.mock.calls[0][1].body).toMatch(/last: 50/);
      // reverses order
      expect(result.events[0].type).toBe('Beta');
      expect(result.events[1].type).toBe('Alpha');
      expect(result.events[0].sender).toBe('0xs2');
      expect(result.module).toBe('0xaa::mod');
    });

    it('uses default limit (20) when param is missing', async () => {
      service.getLatest.mockResolvedValue({ l1: [mkProject()], l2: [] });
      fetchMock.mockResolvedValue({
        json: async () => ({ data: { events: { nodes: [] } } }),
      });
      await controller.getProjectEvents('p1');
      expect(fetchMock.mock.calls[0][1].body).toMatch(/last: 20/);
    });

    it('returns the GraphQL error surface when events query errors out', async () => {
      service.getLatest.mockResolvedValue({ l1: [mkProject()], l2: [] });
      fetchMock.mockResolvedValue({
        json: async () => ({ errors: [{ message: 'bad query' }] }),
      });
      const result = await controller.getProjectEvents('p1');
      expect(result).toEqual({ events: [], module: '0xaa::mod', error: 'bad query' });
    });

    it('falls back through missing fields gracefully', async () => {
      service.getLatest.mockResolvedValue({ l1: [mkProject()], l2: [] });
      fetchMock.mockResolvedValue({
        json: async () => ({ data: { events: { nodes: [{ timestamp: null }] } } }),
      });
      const result = await controller.getProjectEvents('p1');
      expect(result.events[0]).toEqual({
        timestamp: null,
        type: 'Unknown',
        typeFull: '',
        sender: '',
        data: {},
      });
    });

    it('merges newest events across all package addresses — the active version may be mid-chain', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({
          modules: ['mod'],
          packageAddress: '0x01',
          latestPackageAddress: '0x02',
          packageAddresses: ['0x01', '0x02'],
        })],
        l2: [],
      });
      // Latest address (0x02, probed first) is empty; all events live on 0x01
      fetchMock
        .mockResolvedValueOnce({
          json: async () => ({ data: { events: { nodes: [] } } }),
        })
        .mockResolvedValueOnce({
          json: async () => ({
            data: {
              events: {
                nodes: [
                  { timestamp: '2026-01-01T00:00:00Z', type: { repr: 'a::b::Old' }, json: {}, sender: { address: '0xs' } },
                  { timestamp: '2026-01-05T00:00:00Z', type: { repr: 'a::b::New' }, json: {}, sender: { address: '0xs' } },
                ],
              },
            },
          }),
        });

      const result = await controller.getProjectEvents('p1');
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0][1].body).toMatch(/emittingModule: \\?"0x02::mod\\?"/);
      expect(fetchMock.mock.calls[1][1].body).toMatch(/emittingModule: \\?"0x01::mod\\?"/);
      // Newest first across chains; module reports the chain that carried it
      expect(result.events.map((e: any) => e.type)).toEqual(['New', 'Old']);
      expect(result.module).toBe('0x01::mod');
    });

    it('caps the merged result at the requested limit across chains', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({
          modules: ['mod'],
          packageAddress: '0x01',
          latestPackageAddress: '0x02',
          packageAddresses: ['0x01', '0x02'],
        })],
        l2: [],
      });
      fetchMock
        .mockResolvedValueOnce({
          json: async () => ({
            data: {
              events: {
                nodes: [
                  { timestamp: '2026-01-04T00:00:00Z', type: { repr: 'a::b::B' }, json: {}, sender: { address: '0xs' } },
                ],
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          json: async () => ({
            data: {
              events: {
                nodes: [
                  { timestamp: '2026-01-03T00:00:00Z', type: { repr: 'a::b::C' }, json: {}, sender: { address: '0xs' } },
                  { timestamp: '2026-01-05T00:00:00Z', type: { repr: 'a::b::A' }, json: {}, sender: { address: '0xs' } },
                ],
              },
            },
          }),
        });

      const result = await controller.getProjectEvents('p1', '2');
      expect(fetchMock.mock.calls[0][1].body).toMatch(/last: 2/);
      expect(result.events.map((e: any) => e.type)).toEqual(['A', 'B']);
    });

    it('ignores per-chain errors as long as another chain returns events', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({
          modules: ['mod'],
          packageAddress: '0x01',
          latestPackageAddress: '0x02',
          packageAddresses: ['0x01', '0x02'],
        })],
        l2: [],
      });
      fetchMock
        .mockResolvedValueOnce({
          json: async () => ({ errors: [{ message: 'bad cursor' }] }),
        })
        .mockResolvedValueOnce({
          json: async () => ({
            data: {
              events: {
                nodes: [
                  { timestamp: '2026-01-01T00:00:00Z', type: { repr: 'a::b::E' }, json: {}, sender: { address: '0xs' } },
                ],
              },
            },
          }),
        });

      const result = await controller.getProjectEvents('p1');
      expect(result.events).toHaveLength(1);
      expect((result as any).error).toBeUndefined();
    });

    it('surfaces a network failure as an error payload instead of a 500', async () => {
      service.getLatest.mockResolvedValue({ l1: [mkProject()], l2: [] });
      fetchMock.mockRejectedValue(new Error('network down'));
      const result = await controller.getProjectEvents('p1');
      expect(result).toEqual({ events: [], module: '0xaa::mod', error: 'network down' });
    });
  });

  describe('GET /ecosystem/project/:slug/activity', () => {
    it('404s when no snapshot exists', async () => {
      service.getLatest.mockResolvedValue(null);
      await expect(controller.getProjectActivity('p1')).rejects.toThrow(NotFoundException);
    });

    it('404s when the slug is unknown', async () => {
      service.getLatest.mockResolvedValue({ l1: [mkProject()], l2: [] });
      await expect(controller.getProjectActivity('ghost')).rejects.toThrow(NotFoundException);
    });

    it('returns empty buckets for an L2 project without a package', async () => {
      service.getLatest.mockResolvedValue({
        l1: [],
        l2: [mkProject({ slug: 'l2', layer: 'L2', packageAddress: null, latestPackageAddress: null, modules: [], tvl: null })],
      });
      const result = await controller.getProjectActivity('l2');
      expect(result).toEqual({
        eventsPerDay: [],
        eventTypes: [],
        sendersPerDay: [],
        cumulativeEvents: [],
        tvlHistory: [],
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('aggregates events per day, types, senders, and cumulative count', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ modules: ['modA'] })],
        l2: [],
      });
      fetchMock.mockResolvedValue({
        json: async () => ({
          data: {
            events: {
              nodes: [
                { timestamp: '2026-01-01T12:00:00Z', type: { repr: 'a::b::Swap' }, sender: { address: '0xs1' } },
                { timestamp: '2026-01-01T13:00:00Z', type: { repr: 'a::b::Swap' }, sender: { address: '0xs1' } },
                { timestamp: '2026-01-02T00:00:00Z', type: { repr: 'a::b::Deposit' }, sender: { address: '0xs2' } },
                { timestamp: '2026-01-02T05:00:00Z', type: { repr: 'a::b::Swap' }, sender: { address: '0xs3' } },
              ],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        }),
      });

      const result = await controller.getProjectActivity('p1');
      expect(result.eventsPerDay).toEqual([
        { date: '2026-01-01', count: 2 },
        { date: '2026-01-02', count: 2 },
      ]);
      expect(result.sendersPerDay).toEqual([
        { date: '2026-01-01', count: 1 },
        { date: '2026-01-02', count: 2 },
      ]);
      expect(result.cumulativeEvents).toEqual([
        { date: '2026-01-01', count: 2 },
        { date: '2026-01-02', count: 4 },
      ]);
      expect(result.eventTypes[0]).toEqual({ type: 'Swap', count: 3 });
      expect(result.eventTypes[1]).toEqual({ type: 'Deposit', count: 1 });
    });

    it('paginates newest-first, walking before-cursors until hasPreviousPage=false', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ modules: ['modA'] })],
        l2: [],
      });
      fetchMock
        .mockResolvedValueOnce({
          json: async () => ({
            data: {
              events: {
                nodes: [{ timestamp: '2026-01-02T00:00:00Z', type: { repr: 'x::y::E' }, sender: { address: '0xs' } }],
                pageInfo: { hasPreviousPage: true, startCursor: 'cur1' },
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          json: async () => ({
            data: {
              events: {
                nodes: [{ timestamp: '2026-01-01T00:00:00Z', type: { repr: 'x::y::E' }, sender: { address: '0xs' } }],
                pageInfo: { hasPreviousPage: false, startCursor: null },
              },
            },
          }),
        });

      const result = await controller.getProjectActivity('p1');
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0][1].body).toMatch(/last: 50/);
      expect(fetchMock.mock.calls[0][1].body).not.toMatch(/before:/);
      expect(fetchMock.mock.calls[1][1].body).toMatch(/before: \\?"cur1\\?"/);
      expect(result.eventsPerDay).toEqual([
        { date: '2026-01-01', count: 1 },
        { date: '2026-01-02', count: 1 },
      ]);
      expect(result.window).toEqual({ from: '2026-01-01', truncated: false });
    });

    it('trims the partial oldest day and anchors cumulative when a chain hits the page cap', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ modules: ['modA'], events: 100 })],
        l2: [],
      });
      // 10 pages (the cap), each an earlier day, all claiming more history —
      // day 2026-01-01 is only partially fetched and must be trimmed.
      for (let i = 0; i < 10; i++) {
        const day = `2026-01-${String(10 - i).padStart(2, '0')}`;
        fetchMock.mockResolvedValueOnce({
          json: async () => ({
            data: {
              events: {
                nodes: [
                  { timestamp: `${day}T10:00:00Z`, type: { repr: 'x::y::E' }, sender: { address: '0xs' } },
                  { timestamp: `${day}T11:00:00Z`, type: { repr: 'x::y::E' }, sender: { address: '0xs' } },
                ],
                pageInfo: { hasPreviousPage: true, startCursor: `cur${i}` },
              },
            },
          }),
        });
      }

      const result = await controller.getProjectActivity('p1');
      expect(fetchMock).toHaveBeenCalledTimes(10);
      expect(result.window).toEqual({ from: '2026-01-02', truncated: true });
      expect(result.eventsPerDay).toHaveLength(9);
      expect(result.eventsPerDay[0]).toEqual({ date: '2026-01-02', count: 2 });
      // 18 visible events anchored to the lifetime total of 100
      expect(result.cumulativeEvents[0]).toEqual({ date: '2026-01-02', count: 84 });
      expect(result.cumulativeEvents[8]).toEqual({ date: '2026-01-10', count: 100 });
      expect(result.eventTypes).toEqual([{ type: 'E', count: 18 }]);
    });

    it('keeps partial data when trimming would empty the chart', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ modules: ['modA'] })],
        l2: [],
      });
      // Every page is the same single day, so the only day is partial.
      fetchMock.mockResolvedValue({
        json: async () => ({
          data: {
            events: {
              nodes: [
                { timestamp: '2026-01-05T10:00:00Z', type: { repr: 'x::y::E' }, sender: { address: '0xs' } },
                { timestamp: '2026-01-05T11:00:00Z', type: { repr: 'x::y::E' }, sender: { address: '0xs' } },
              ],
              pageInfo: { hasPreviousPage: true, startCursor: 'c' },
            },
          },
        }),
      });

      const result = await controller.getProjectActivity('p1');
      expect(result.eventsPerDay).toEqual([{ date: '2026-01-05', count: 20 }]);
      expect(result.window).toEqual({ from: '2026-01-05', truncated: true });
    });

    it('anchors cumulative to the snapshot lifetime total even without truncation', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ modules: ['modA'], events: 50 })],
        l2: [],
      });
      fetchMock.mockResolvedValue({
        json: async () => ({
          data: {
            events: {
              nodes: [
                { timestamp: '2026-01-01T10:00:00Z', type: { repr: 'x::y::E' }, sender: { address: '0xs' } },
                { timestamp: '2026-01-01T11:00:00Z', type: { repr: 'x::y::E' }, sender: { address: '0xs' } },
              ],
              pageInfo: { hasPreviousPage: false, startCursor: null },
            },
          },
        }),
      });

      const result = await controller.getProjectActivity('p1');
      expect(result.cumulativeEvents).toEqual([{ date: '2026-01-01', count: 50 }]);
      expect(result.window).toEqual({ from: '2026-01-01', truncated: false });
    });

    it('breaks pagination when a GraphQL error is returned', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ modules: ['modA'] })],
        l2: [],
      });
      fetchMock.mockResolvedValueOnce({
        json: async () => ({ errors: [{ message: 'boom' }] }),
      });

      const result = await controller.getProjectActivity('p1');
      expect(result.eventsPerDay).toEqual([]);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      // A page-0 failure means the chain may hold unseen history — never
      // report it as complete-and-empty
      expect(result.window).toEqual({ from: null, truncated: true });
    });

    it('breaks pagination when fetch itself throws', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ modules: ['modA'] })],
        l2: [],
      });
      fetchMock.mockRejectedValueOnce(new Error('network'));
      const result = await controller.getProjectActivity('p1');
      expect(result.eventsPerDay).toEqual([]);
      expect(result.window).toEqual({ from: null, truncated: true });
    });

    it('skips the lifetime anchor and flags truncation when modules exceed the probe cap', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ modules: ['m1', 'm2', 'm3', 'm4'], events: 50 })],
        l2: [],
      });
      fetchMock
        .mockResolvedValueOnce({
          json: async () => ({
            data: {
              events: {
                nodes: [
                  { timestamp: '2026-01-01T10:00:00Z', type: { repr: 'x::y::E' }, sender: { address: '0xs' } },
                  { timestamp: '2026-01-01T11:00:00Z', type: { repr: 'x::y::E' }, sender: { address: '0xs' } },
                ],
                pageInfo: { hasPreviousPage: false, startCursor: null },
              },
            },
          }),
        })
        .mockResolvedValue({
          json: async () => ({ data: { events: { nodes: [], pageInfo: { hasPreviousPage: false, startCursor: null } } } }),
        });

      const result = await controller.getProjectActivity('p1');
      // Unprobed module m4 could hold in-window events, so the lifetime
      // total (50) must not be smeared into the pre-window baseline
      expect(result.cumulativeEvents).toEqual([{ date: '2026-01-01', count: 2 }]);
      expect(result.window).toEqual({ from: '2026-01-01', truncated: true });
    });

    it('falls back to "unknown" day when event timestamp is missing', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ modules: ['modA'] })],
        l2: [],
      });
      fetchMock.mockResolvedValue({
        json: async () => ({
          data: {
            events: {
              nodes: [{ timestamp: null, type: { repr: null }, sender: null }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        }),
      });
      const result = await controller.getProjectActivity('p1');
      expect(result.eventsPerDay).toEqual([{ date: 'unknown', count: 1 }]);
      expect(result.eventTypes[0]).toEqual({ type: 'Unknown', count: 1 });
    });

    it('only scans up to 3 modules per project', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ modules: ['a', 'b', 'c', 'd', 'e'] })],
        l2: [],
      });
      fetchMock.mockResolvedValue({
        json: async () => ({ data: { events: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } } }),
      });
      await controller.getProjectActivity('p1');
      // 3 modules × 1 page each = 3 fetch calls (no TVL → no DefiLlama)
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('iterates the full upgrade chain — events from older package addresses union with the latest', async () => {
      // Multi-package project simulating TWIN ImmutableProof's 6-version
      // upgrade chain: emittingModule is strict per address, so older
      // packages emit events that the latest's filter misses.
      service.getLatest.mockResolvedValue({
        l1: [mkProject({
          modules: ['mod'],
          packageAddress: '0x01',
          latestPackageAddress: '0x03',
          packageAddresses: ['0x01', '0x02', '0x03'],
        })],
        l2: [],
      });
      fetchMock
        .mockResolvedValueOnce({
          json: async () => ({
            data: {
              events: {
                nodes: [{ timestamp: '2026-01-01T00:00:00Z', type: { repr: 'a::b::E1' }, sender: { address: '0xs' } }],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          json: async () => ({
            data: {
              events: {
                nodes: [{ timestamp: '2026-01-02T00:00:00Z', type: { repr: 'a::b::E2' }, sender: { address: '0xs' } }],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          json: async () => ({
            data: {
              events: {
                nodes: [{ timestamp: '2026-01-03T00:00:00Z', type: { repr: 'a::b::E3' }, sender: { address: '0xs' } }],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          }),
        });

      const result = await controller.getProjectActivity('p1');

      // 3 packages × 1 module × 1 page each = 3 fetch calls
      expect(fetchMock).toHaveBeenCalledTimes(3);
      // Each call hits a different emittingModule; the latest address is
      // probed first so the address bound can never cut it off
      const bodies = fetchMock.mock.calls.map((c: any) => c[1].body);
      expect(bodies[0]).toMatch(/emittingModule: \\?"0x03::mod\\?"/);
      expect(bodies[1]).toMatch(/emittingModule: \\?"0x01::mod\\?"/);
      expect(bodies[2]).toMatch(/emittingModule: \\?"0x02::mod\\?"/);
      // Events from all 3 packages are unioned
      expect(result.eventsPerDay).toEqual([
        { date: '2026-01-01', count: 1 },
        { date: '2026-01-02', count: 1 },
        { date: '2026-01-03', count: 1 },
      ]);
      expect(result.eventTypes.map((e: any) => e.type).sort()).toEqual(['E1', 'E2', 'E3']);
    });

    it('caps the probed addresses at 40 so aggregate deployer buckets stay bounded', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({
          modules: ['mod'],
          packageAddresses: Array.from({ length: 45 }, (_, i) => `0x${String(i + 1).padStart(2, '0')}`),
        })],
        l2: [],
      });
      fetchMock.mockResolvedValue({
        json: async () => ({ data: { events: { nodes: [], pageInfo: { hasPreviousPage: false, startCursor: null } } } }),
      });
      const result = await controller.getProjectActivity('p1');
      // 40 packages × 1 module × 1 page each (cap at 40, not 45; the default
      // latest/anchor address 0xaa counts as the first probed slot)
      expect(fetchMock).toHaveBeenCalledTimes(40);
      // Unprobed addresses mean the window can't claim completeness
      expect(result.window.truncated).toBe(true);
    });

    it('probes latest and anchor addresses when packageAddresses is empty (legacy / unattributed shape)', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({
          modules: ['mod'],
          packageAddress: '0xfirst',
          latestPackageAddress: '0xlatest',
          packageAddresses: [],
        })],
        l2: [],
      });
      fetchMock.mockResolvedValue({
        json: async () => ({ data: { events: { nodes: [], pageInfo: { hasPreviousPage: false, startCursor: null } } } }),
      });
      await controller.getProjectActivity('p1');
      // Both distinct addresses probed, latest first
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0][1].body).toMatch(/emittingModule: \\?"0xlatest::mod\\?"/);
      expect(fetchMock.mock.calls[1][1].body).toMatch(/emittingModule: \\?"0xfirst::mod\\?"/);
    });

    it('falls back to packageAddress when latestPackageAddress is null', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({
          modules: ['mod'],
          packageAddress: '0xanchor',
          latestPackageAddress: null,
          packageAddresses: [],
        })],
        l2: [],
      });
      fetchMock.mockResolvedValue({
        json: async () => ({ data: { events: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } } }),
      });
      await controller.getProjectActivity('p1');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][1].body).toMatch(/emittingModule: \\?"0xanchor::mod\\?"/);
    });

    it('pulls TVL history from DefiLlama for projects with tvl', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ tvl: 500, modules: [] })],
        l2: [],
      });
      fetchMock.mockResolvedValueOnce({
        json: async () => ({
          chainTvls: {
            IOTA: {
              tvl: [
                { date: 1_700_000_000, totalLiquidityUSD: 100 },
                { date: 1_700_086_400, totalLiquidityUSD: 110 },
              ],
            },
          },
        }),
      });
      const result = await controller.getProjectActivity('p1');
      expect(result.tvlHistory).toHaveLength(2);
      expect(result.tvlHistory[0].tvl).toBe(100);
      expect(result.tvlHistory[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('uses the IOTA EVM chain bucket for L2 projects', async () => {
      service.getLatest.mockResolvedValue({
        l1: [],
        l2: [mkProject({ slug: 'evm-dex', layer: 'L2', tvl: 500, modules: [], packageAddress: null, latestPackageAddress: null })],
      });
      fetchMock.mockResolvedValueOnce({
        json: async () => ({
          chainTvls: {
            'IOTA EVM': { tvl: [{ date: 1_700_000_000, totalLiquidityUSD: 50 }] },
          },
        }),
      });
      const result = await controller.getProjectActivity('evm-dex');
      expect(result.tvlHistory).toEqual([{ date: expect.any(String), tvl: 50 }]);
      expect(fetchMock.mock.calls[0][0]).toContain('/protocol/dex');
    });

    it('swallows DefiLlama failures and leaves tvlHistory empty', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ tvl: 500, modules: [] })],
        l2: [],
      });
      fetchMock.mockRejectedValueOnce(new Error('llama down'));
      const result = await controller.getProjectActivity('p1');
      expect(result.tvlHistory).toEqual([]);
    });

    it('falls back to legacy flat tvl array when chainTvls key is missing', async () => {
      service.getLatest.mockResolvedValue({
        l1: [mkProject({ tvl: 500, modules: [] })],
        l2: [],
      });
      fetchMock.mockResolvedValueOnce({
        json: async () => ({
          tvl: [{ date: 1_700_000_000, totalLiquidityUSD: 42 }],
        }),
      });
      const result = await controller.getProjectActivity('p1');
      expect(result.tvlHistory).toEqual([{ date: expect.any(String), tvl: 42 }]);
    });
  });
});
