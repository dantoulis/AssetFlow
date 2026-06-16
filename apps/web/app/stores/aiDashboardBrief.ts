import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type {
  AppAsset,
  AppAssetRequest,
  AppTicket,
  AppUser,
  DashboardAiAsset,
  DashboardAiBrief,
  DashboardAiMetric,
  DashboardAiRequest,
  DashboardAiSnapshot,
  DashboardAiSnapshotStats,
  DashboardAiTicket,
} from '@/lib/app-types';

const sortNewestFirst = <T extends { createdAt?: string; updatedAt?: string }>(left: T, right: T) =>
  new Date(right.updatedAt ?? right.createdAt ?? 0).getTime() -
  new Date(left.updatedAt ?? left.createdAt ?? 0).getTime();

const truncate = (value: string | null | undefined, maxLength: number) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue.slice(0, maxLength);
};

export const useAiDashboardBriefStore = defineStore('aiDashboardBrief', () => {
  const getApi = () => useAssetFlowApi();
  const assetsStore = useAssetsStore();
  const ticketsStore = useTicketsStore();
  const assetRequestsStore = useAssetRequestsStore();
  const usersStore = useUsersStore();
  const currentUser = useState<AppUser | null>('auth.current-user', () => null);

  const brief = ref<DashboardAiBrief | null>(null);
  const briefSnapshotSignature = ref<string | null>(null);
  const isGenerating = ref(false);
  const error = ref<string | null>(null);

  const viewer = computed(() => currentUser.value);
  const isAdmin = computed(() => viewer.value?.role === 'ADMIN');

  const snapshotStats = computed<DashboardAiSnapshotStats>(() => ({
    assets: assetsStore.assets.length,
    tickets: ticketsStore.tickets.length,
    requests: assetRequestsStore.requests.length,
  }));

  const visibleMetrics = computed<DashboardAiMetric[]>(() => {
    if (isAdmin.value) {
      return [
        {
          label: 'Managed users',
          value: `${usersStore.managedUsers.length}`,
          delta: `${usersStore.admins.length} admins`,
          hint: 'Every non-admin account currently visible to the workspace.',
        },
        {
          label: 'Tracked assets',
          value: `${assetsStore.count}`,
          delta: `${assetsStore.urgentRenewals(6, 7).length} renewals due`,
          hint: 'Inventory currently assigned across the workspace.',
        },
        {
          label: 'Open tickets',
          value: `${ticketsStore.openTickets.length}`,
          delta: `${ticketsStore.pendingAdminTickets.length} waiting on admin`,
          hint: 'Tickets that still need support movement.',
        },
        {
          label: 'Pending requests',
          value: `${assetRequestsStore.pendingRequests.length}`,
          delta: `${assetRequestsStore.countsByStatus.APPROVED} approved`,
          hint: 'Asset requests still waiting for review or fulfillment.',
        },
      ];
    }

    return [
      {
        label: 'Assigned assets',
        value: `${assetsStore.count}`,
        delta: `${assetsStore.urgentRenewals(4, 7).length} due soon`,
        hint: 'Assets currently attached to your account.',
      },
      {
        label: 'Renewals soon',
        value: `${assetsStore.urgentRenewals(4, 7).length}`,
        delta: 'Next 7 days',
        hint: 'Assignments that will need attention soon.',
      },
      {
        label: 'Open tickets',
        value: `${ticketsStore.openTickets.length}`,
        delta: `${ticketsStore.pendingUserTickets.length} waiting on you`,
        hint: 'Support threads that still need movement.',
      },
      {
        label: 'Pending requests',
        value: `${assetRequestsStore.pendingRequests.length}`,
        delta: `${assetRequestsStore.countsByStatus.FULFILLED} fulfilled`,
        hint: 'Requests still waiting for review or fulfillment.',
      },
    ];
  });

  const snapshotCore = computed<Omit<DashboardAiSnapshot, 'generatedAt'> | null>(() => {
    const currentViewer = viewer.value;

    if (!currentViewer) {
      return null;
    }

    return {
      role: currentViewer.role,
      visiblePage: currentViewer.role === 'ADMIN' ? 'admin-dashboard' : 'user-dashboard',
      visibleMetrics: visibleMetrics.value,
      assets: buildAssetsSnapshot(assetsStore.assets, usersStore.findUserById),
      tickets: buildTicketsSnapshot(
        ticketsStore.tickets,
        usersStore.findUserById,
        assetsStore.findAssetById,
      ),
      requests: buildRequestsSnapshot(assetRequestsStore.requests, usersStore.findUserById),
    };
  });

  const snapshotSignature = computed(() => {
    if (!snapshotCore.value) {
      return null;
    }

    return JSON.stringify(snapshotCore.value);
  });

  const snapshot = computed<DashboardAiSnapshot | null>(() => {
    if (!snapshotCore.value) {
      return null;
    }

    return {
      ...snapshotCore.value,
      generatedAt: new Date().toISOString(),
    };
  });

  const hasBrief = computed(() => Boolean(brief.value));
  const isBriefStale = computed(
    () =>
      Boolean(brief.value) &&
      Boolean(snapshotSignature.value) &&
      briefSnapshotSignature.value !== snapshotSignature.value,
  );

  const resetStoreState = () => {
    brief.value = null;
    briefSnapshotSignature.value = null;
    isGenerating.value = false;
    error.value = null;
  };

  watch(
    () => viewer.value?.id ?? null,
    () => {
      resetStoreState();
    },
  );

  const generateBrief = async () => {
    if (!snapshot.value || !snapshotSignature.value) {
      return null;
    }

    const api = getApi();
    isGenerating.value = true;
    error.value = null;

    try {
      const nextBrief = await api.generateDashboardBrief(snapshot.value);
      brief.value = nextBrief;
      briefSnapshotSignature.value = snapshotSignature.value;
      return nextBrief;
    } catch {
      error.value = 'AI brief is unavailable right now. Check Gemini configuration or retry.';
      return null;
    } finally {
      isGenerating.value = false;
    }
  };

  return {
    brief,
    briefSnapshotSignature,
    error,
    hasBrief,
    isBriefStale,
    isGenerating,
    resetStoreState,
    generateBrief,
    snapshot,
    snapshotSignature,
    snapshotStats,
  };
});

const buildAssetsSnapshot = (
  assets: AppAsset[],
  findUserById: (id: number) => AppUser | null,
): DashboardAiAsset[] =>
  [...assets]
    .sort(sortNewestFirst)
    .slice(0, 80)
    .map((asset) => ({
      title: asset.title,
      type: asset.type,
      status: asset.status,
      vendor: asset.vendor,
      billingCycle: asset.billingCycle,
      purchasedAt: asset.purchasedAt,
      assignedAt: asset.assignedAt,
      renewalAt: asset.renewalAt,
      expiresAt: asset.expiresAt,
      seatCount: asset.seatCount,
      ownerTeam: truncate(findUserById(asset.userId)?.team, 120),
      tags: asset.tags.slice(0, 8),
    }));

const buildTicketsSnapshot = (
  tickets: AppTicket[],
  findUserById: (id: number) => AppUser | null,
  findAssetById: (id: number) => AppAsset | null,
): DashboardAiTicket[] =>
  [...tickets]
    .sort(sortNewestFirst)
    .slice(0, 80)
    .map((ticket) => ({
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      requesterTeam: truncate(findUserById(ticket.requesterId)?.team, 120),
      relatedAsset: ticket.assetId ? truncate(findAssetById(ticket.assetId)?.title, 140) : null,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    }));

const buildRequestsSnapshot = (
  requests: AppAssetRequest[],
  findUserById: (id: number) => AppUser | null,
): DashboardAiRequest[] =>
  [...requests]
    .sort(sortNewestFirst)
    .slice(0, 60)
    .map((request) => ({
      title: request.title,
      assetType: request.assetType,
      vendor: truncate(request.vendor, 100),
      justification: truncate(request.justification, 900),
      status: request.status,
      requesterTeam: truncate(findUserById(request.requesterId)?.team, 120),
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    }));
