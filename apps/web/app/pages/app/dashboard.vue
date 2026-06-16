<template>
  <div v-if="viewer" class="space-y-6">
    <PageIntro
      eyebrow="Workspace overview"
      :title="`Welcome back, ${displayName}.`"
      description="See your assigned assets, current support threads, and request activity without leaving your workspace."
    >
      <template #actions>
        <Button as-child class="rounded-2xl">
          <NuxtLink to="/app/tickets">Open a ticket</NuxtLink>
        </Button>
        <Button variant="outline" as-child class="rounded-2xl">
          <NuxtLink to="/app/requests">Request an asset</NuxtLink>
        </Button>
      </template>
    </PageIntro>

    <AiDashboardBrief />

    <section class="grid gap-4 xl:grid-cols-4">
      <MetricCard
        v-for="(metric, index) in metrics"
        :key="metric.label"
        :title="metric.label"
        :value="metric.value"
        :delta="metric.delta"
        :hint="metric.hint"
        :tone="index === 1 ? 'warning' : index === 3 ? 'success' : 'primary'"
      >
        <template #icon>
          <Icon :name="metricIcons[index]!" class="size-5" />
        </template>
      </MetricCard>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader class="gap-4 md:flex-row md:items-start md:justify-between">
          <div class="space-y-1">
            <CardTitle>{{ trendTitle }}</CardTitle>
            <CardDescription>
              Flip between asset assignments, ticket creation, and request activity over time.
            </CardDescription>
          </div>
          <div class="flex flex-wrap gap-2">
            <AppSelectField
              v-model="trendMetric"
              :options="trendMetricOptions"
              placeholder="Select metric"
              trigger-class="min-w-44"
            />
            <ChartPeriodPicker v-model="trendPeriod" v-model:range="customTrendRange" />
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-sm text-muted-foreground">{{ trendValueLabel }}</p>
              <p class="text-4xl font-semibold tracking-[-0.05em]">{{ trendTotal }}</p>
            </div>
            <Badge
              variant="outline"
              class="rounded-full border-primary/15 bg-primary/10 px-3 py-1 text-primary"
            >
              {{ trendSummary }}
            </Badge>
          </div>
          <TrendChart
            :points="trendPoints"
            stroke="var(--color-chart-2)"
            fill="color-mix(in oklab, var(--color-chart-2) 18%, transparent)"
          />
        </CardContent>
      </Card>

      <Card class="app-surface overflow-hidden">
        <CardHeader class="gap-4 md:flex-row md:items-start md:justify-between">
          <div class="space-y-1">
            <CardTitle>{{ distributionTitle }}</CardTitle>
            <CardDescription>
              Re-balance the view between your assets, ticket queue, and request flow.
            </CardDescription>
          </div>
          <AppSelectField
            v-model="distributionMode"
            :options="distributionModeOptions"
            placeholder="Select breakdown"
            trigger-class="min-w-44"
          />
        </CardHeader>
        <CardContent>
          <DistributionDonut
            :segments="distributionSegments"
            :center-label="distributionCenterLabel"
            :center-value="distributionCenterValue"
          />
        </CardContent>
      </Card>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Upcoming renewals</CardTitle>
          <CardDescription>
            Assets that are approaching renewal or expiry on your account.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <NuxtLink
            v-for="asset in renewals"
            :key="asset.id"
            :to="`/app/assets/${asset.id}`"
            class="app-list-item"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <StatusBadge :status="asset.status" />
                  <StatusBadge :status="asset.type" />
                </div>
                <div>
                  <p class="font-semibold">{{ asset.title }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ asset.vendor }} | {{ formatRelativeDate(getAssetNextDate(asset)) }}
                  </p>
                </div>
              </div>
              <span class="text-xs text-muted-foreground">{{ asset.reference }}</span>
            </div>
          </NuxtLink>

          <div v-if="!renewals.length" class="app-empty-state">
            Nothing is expiring soon. Your current assignments are in a healthy state.
          </div>
        </CardContent>
      </Card>

      <div class="grid gap-4">
        <Card class="app-surface overflow-hidden">
          <CardHeader>
            <CardTitle>Recent support activity</CardTitle>
            <CardDescription>The latest movement on your active ticket threads.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <NuxtLink
              v-for="ticket in recentTickets"
              :key="ticket.id"
              :to="`/app/tickets/${ticket.id}`"
              class="app-list-item"
            >
              <div class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <StatusBadge :status="ticket.status" />
                  <StatusBadge :status="ticket.priority" />
                </div>
                <div>
                  <p class="font-semibold">{{ ticket.subject }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ humanizeEnum(ticket.category) }} | Updated
                    {{ formatRelativeDate(ticket.updatedAt) }}
                  </p>
                </div>
              </div>
            </NuxtLink>

            <div v-if="!recentTickets.length" class="app-empty-state">
              You do not have any tickets yet.
            </div>
          </CardContent>
        </Card>

        <Card class="app-surface overflow-hidden">
          <CardHeader>
            <CardTitle>Latest asset requests</CardTitle>
            <CardDescription>Track the current status of requests you opened.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <NuxtLink
              v-for="request in recentRequests"
              :key="request.id"
              to="/app/requests"
              class="app-list-item"
            >
              <div class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <StatusBadge :status="request.status" />
                  <StatusBadge v-if="request.assetType" :status="request.assetType" />
                </div>
                <div>
                  <p class="font-semibold">{{ request.title }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ request.vendor || 'No preferred vendor' }} |
                    {{ formatDate(request.createdAt) }}
                  </p>
                </div>
              </div>
            </NuxtLink>

            <div v-if="!recentRequests.length" class="app-empty-state">
              No asset requests yet. Start one whenever you need a new tool or device.
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { getLocalTimeZone, today } from '@internationalized/date';
import {
  buildDailySeriesForRange,
  buildHourlySeriesForDay,
  buildMonthlySeriesForRange,
} from '@/lib/app-analytics';
import {
  formatDate,
  formatRelativeDate,
  getAssetNextDate,
  getDisplayName,
  humanizeEnum,
} from '@/lib/app-formatters';
import type {
  ChartPeriodPreset,
  ChartPoint,
  DashboardMetric,
  DistributionSegment,
} from '@/lib/app-types';

type TrendGranularity = 'hour' | 'day' | 'month';
type TrendRange = {
  start: Date;
  end: Date;
  granularity: TrendGranularity;
};
type ChartDateValue = {
  toDate: (timeZone: string) => Date;
};
type CustomTrendRange = {
  start?: ChartDateValue;
  end?: ChartDateValue;
};
type TrendMetric = 'ASSETS' | 'TICKETS' | 'REQUESTS';
type DistributionMode = 'ASSET_TYPES' | 'ASSET_STATUS' | 'TICKET_STATUS' | 'REQUEST_STATUS';

definePageMeta({
  layout: 'user',
});

useHead({
  title: 'My Dashboard',
});

const assetsStore = useAssetsStore();
const assetRequestsStore = useAssetRequestsStore();
const ticketsStore = useTicketsStore();
const { currentUser, refreshSession } = useAuth();

if (!currentUser.value) {
  await refreshSession();
}

const viewer = computed(() => currentUser.value);

if (!viewer.value) {
  throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
}

const viewerId = viewer.value.id;

await Promise.all([assetsStore.fetchAll(), ticketsStore.fetchAll(), assetRequestsStore.fetchAll()]);

const metricIcons = [
  'lucide:boxes',
  'lucide:timer-reset',
  'lucide:message-square-more',
  'lucide:clipboard-list',
];
const displayName = computed(() => getDisplayName(viewer.value));
const renewals = computed(() => assetsStore.urgentRenewals(4, 7));
const recentTickets = computed(() => ticketsStore.recent(4));
const recentRequests = computed(() => assetRequestsStore.recentByRequester(viewerId, 4));

const metrics = computed<DashboardMetric[]>(() => [
  {
    label: 'Assigned assets',
    value: `${assetsStore.count}`,
    delta: `${renewals.value.length} due soon`,
    hint: 'Assets currently attached to your account.',
  },
  {
    label: 'Renewals soon',
    value: `${renewals.value.length}`,
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
]);

const trendMetric = ref<TrendMetric>('TICKETS');
const trendMetricOptions: Array<{
  label: string;
  value: TrendMetric;
}> = [
  { label: 'Asset assignments', value: 'ASSETS' },
  { label: 'Tickets opened', value: 'TICKETS' },
  { label: 'Requests submitted', value: 'REQUESTS' },
];
const trendPeriod = ref<ChartPeriodPreset>('7D');
const timeZone = getLocalTimeZone();
const currentDay = today(timeZone);
const customTrendRange = ref<CustomTrendRange>({
  start: currentDay.subtract({ days: 13 }),
  end: currentDay,
});

const countItemsInRange = <T,>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  start: Date,
  end: Date,
) =>
  items.filter((item) => {
    const dateValue = getDate(item);
    if (!dateValue) return false;

    const current = new Date(dateValue);
    return current >= start && current <= end;
  }).length;

const resolvedTrendRange = computed<TrendRange>(() => {
  const now = new Date();

  if (trendPeriod.value === 'TODAY') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { start, end: now, granularity: 'hour' };
  }

  if (trendPeriod.value === '7D') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end: now, granularity: 'day' };
  }

  if (trendPeriod.value === '30D') {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start, end: now, granularity: 'day' };
  }

  const fallbackStart = new Date(now);
  fallbackStart.setDate(fallbackStart.getDate() - 13);
  fallbackStart.setHours(0, 0, 0, 0);

  const start = customTrendRange.value?.start?.toDate(timeZone) ?? fallbackStart;
  const end = customTrendRange.value?.end?.toDate(timeZone) ?? now;
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const daySpan = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  return {
    start,
    end,
    granularity: daySpan > 62 ? 'month' : 'day',
  };
});

const buildTrendSeries = <T,>(items: T[], getDate: (item: T) => string | null | undefined) => {
  if (resolvedTrendRange.value.granularity === 'hour') {
    return buildHourlySeriesForDay(items, getDate, resolvedTrendRange.value.end);
  }

  if (resolvedTrendRange.value.granularity === 'month') {
    return buildMonthlySeriesForRange(
      items,
      getDate,
      resolvedTrendRange.value.start,
      resolvedTrendRange.value.end,
    );
  }

  return buildDailySeriesForRange(
    items,
    getDate,
    resolvedTrendRange.value.start,
    resolvedTrendRange.value.end,
  );
};

const trendPoints = computed<ChartPoint[]>(() => {
  if (trendMetric.value === 'ASSETS') {
    return buildTrendSeries(assetsStore.assets, (asset) => asset.assignedAt ?? asset.createdAt);
  }

  if (trendMetric.value === 'REQUESTS') {
    return buildTrendSeries(assetRequestsStore.requests, (request) => request.createdAt);
  }

  return buildTrendSeries(ticketsStore.tickets, (ticket) => ticket.createdAt);
});

const trendTitle = computed(() => {
  if (trendMetric.value === 'ASSETS') return 'Assignment timeline';
  if (trendMetric.value === 'REQUESTS') return 'Request activity';
  return 'Ticket activity';
});

const trendValueLabel = computed(() => {
  if (trendMetric.value === 'ASSETS') return 'Assets assigned';
  if (trendMetric.value === 'REQUESTS') return 'Requests submitted';
  return 'Tickets opened';
});

const trendTotal = computed(() => {
  if (trendMetric.value === 'ASSETS') {
    return `${countItemsInRange(
      assetsStore.assets,
      (asset) => asset.assignedAt ?? asset.createdAt,
      resolvedTrendRange.value.start,
      resolvedTrendRange.value.end,
    )}`;
  }

  if (trendMetric.value === 'REQUESTS') {
    return `${countItemsInRange(
      assetRequestsStore.requests,
      (request) => request.createdAt,
      resolvedTrendRange.value.start,
      resolvedTrendRange.value.end,
    )}`;
  }

  return `${countItemsInRange(
    ticketsStore.tickets,
    (ticket) => ticket.createdAt,
    resolvedTrendRange.value.start,
    resolvedTrendRange.value.end,
  )}`;
});

const trendSummary = computed(() => {
  const latestValue = trendPoints.value.at(-1)?.value ?? 0;
  const label =
    trendMetric.value === 'ASSETS'
      ? 'assignments'
      : trendMetric.value === 'REQUESTS'
        ? 'requests'
        : 'tickets';
  const periodLabel =
    trendPeriod.value === 'TODAY'
      ? 'today'
      : trendPeriod.value === '7D'
        ? 'in the last 7 days'
        : trendPeriod.value === '30D'
          ? 'in the last 30 days'
          : 'in the selected range';

  return `${latestValue} ${label} ${periodLabel}`;
});

const distributionMode = ref<DistributionMode>('ASSET_TYPES');
const distributionModeOptions: Array<{
  label: string;
  value: DistributionMode;
}> = [
  { label: 'Asset types', value: 'ASSET_TYPES' },
  { label: 'Asset status', value: 'ASSET_STATUS' },
  { label: 'Ticket status', value: 'TICKET_STATUS' },
  { label: 'Request status', value: 'REQUEST_STATUS' },
];

const distributionSegments = computed<DistributionSegment[]>(() => {
  if (distributionMode.value === 'ASSET_STATUS') {
    return assetsStore.statusDistribution;
  }

  if (distributionMode.value === 'TICKET_STATUS') {
    return ticketsStore.statusDistribution;
  }

  if (distributionMode.value === 'REQUEST_STATUS') {
    return assetRequestsStore.statusDistribution;
  }

  return assetsStore.typeDistribution;
});

const distributionTitle = computed(() => {
  if (distributionMode.value === 'ASSET_STATUS') return 'Asset status mix';
  if (distributionMode.value === 'TICKET_STATUS') return 'Ticket status mix';
  if (distributionMode.value === 'REQUEST_STATUS') return 'Request status mix';
  return 'Asset type mix';
});

const distributionCenterLabel = computed(() =>
  distributionMode.value === 'REQUEST_STATUS'
    ? 'Requests'
    : distributionMode.value === 'TICKET_STATUS'
      ? 'Tickets'
      : 'Assets',
);
const distributionCenterValue = computed(() =>
  distributionMode.value === 'REQUEST_STATUS'
    ? `${assetRequestsStore.count}`
    : distributionMode.value === 'TICKET_STATUS'
      ? `${ticketsStore.count}`
      : `${assetsStore.count}`,
);
</script>
