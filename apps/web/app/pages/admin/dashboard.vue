<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Operations overview"
      title="Live workspace visibility for the whole asset operation."
      description="Track people, inventory, request demand, and support traffic from the same control surface."
    >
      <template #actions>
        <Button as-child class="rounded-2xl">
          <NuxtLink to="/admin/requests">Review requests</NuxtLink>
        </Button>
        <Button variant="outline" as-child class="rounded-2xl">
          <NuxtLink to="/admin/tickets">Open ticket queue</NuxtLink>
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
        :tone="index === 1 ? 'success' : index === 3 ? 'warning' : 'primary'"
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
              Switch between assets, tickets, and requests to understand how workload is changing.
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
          <TrendChart :points="trendPoints" />
        </CardContent>
      </Card>

      <Card class="app-surface overflow-hidden">
        <CardHeader class="gap-4 md:flex-row md:items-start md:justify-between">
          <div class="space-y-1">
            <CardTitle>{{ distributionTitle }}</CardTitle>
            <CardDescription>
              Re-balance the breakdown to inspect inventory, support, requests, or team coverage.
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

    <section class="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Urgent renewals due in the next 7 days</CardTitle>
          <CardDescription>
            The assets that need action first, without forcing you into a wide table.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-if="!renewals.length" class="app-empty-state">
            Nothing is due inside the next 7 days.
          </div>
          <NuxtLink
            v-for="asset in renewals"
            v-else
            :key="asset.id"
            :to="`/admin/assets/${asset.id}`"
            class="app-list-item"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="space-y-3">
                <div class="flex flex-wrap gap-2">
                  <StatusBadge :status="asset.status" />
                  <StatusBadge :status="asset.type" />
                </div>
                <div>
                  <p class="font-semibold">{{ asset.title }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ asset.vendor }} | {{ userName(asset.userId) }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p
                  class="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                >
                  {{ formatRelativeDate(getAssetNextDate(asset)) }}
                </p>
              </div>
            </div>
            <div class="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div class="space-y-1">
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  Due date
                </p>
                <p class="font-medium text-foreground">
                  {{ formatDate(getAssetNextDate(asset)) }}
                </p>
              </div>
              <div class="space-y-1">
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  Reference
                </p>
                <p class="font-medium text-foreground">{{ asset.reference }}</p>
              </div>
            </div>
          </NuxtLink>
        </CardContent>
      </Card>

      <div class="grid gap-4">
        <Card class="app-surface overflow-hidden">
          <CardHeader>
            <CardTitle>Tickets needing attention</CardTitle>
            <CardDescription>Most recent unresolved tickets across the workspace.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <NuxtLink
              v-for="ticket in queueTickets"
              :key="ticket.id"
              :to="`/admin/tickets/${ticket.id}`"
              class="app-list-item"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-2">
                  <div class="flex flex-wrap gap-2">
                    <StatusBadge :status="ticket.status" />
                    <StatusBadge :status="ticket.priority" />
                  </div>
                  <div>
                    <p class="font-semibold">{{ ticket.subject }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ userName(ticket.requesterId) }} | {{ humanizeEnum(ticket.category) }}
                    </p>
                  </div>
                </div>
                <p class="text-xs text-muted-foreground">
                  {{ formatRelativeDate(ticket.updatedAt) }}
                </p>
              </div>
            </NuxtLink>

            <div v-if="!queueTickets.length" class="app-empty-state">
              No active tickets are waiting in the queue.
            </div>
          </CardContent>
        </Card>

        <Card class="app-surface overflow-hidden">
          <CardHeader>
            <CardTitle>Request queue</CardTitle>
            <CardDescription
              >Pending and approved requests that still need admin action.</CardDescription
            >
          </CardHeader>
          <CardContent class="space-y-3">
            <NuxtLink
              v-for="request in queueRequests"
              :key="request.id"
              to="/admin/requests"
              class="app-list-item"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-2">
                  <div class="flex flex-wrap gap-2">
                    <StatusBadge :status="request.status" />
                    <StatusBadge v-if="request.assetType" :status="request.assetType" />
                  </div>
                  <div>
                    <p class="font-semibold">{{ request.title }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ userName(request.requesterId) }} |
                      {{ request.vendor || 'No vendor preference' }}
                    </p>
                  </div>
                </div>
                <p class="text-xs text-muted-foreground">
                  {{ formatDate(request.createdAt) }}
                </p>
              </div>
            </NuxtLink>

            <div v-if="!queueRequests.length" class="app-empty-state">
              No pending or approved requests need action right now.
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
type DistributionMode =
  | 'ASSET_TYPES'
  | 'ASSET_STATUS'
  | 'TICKET_STATUS'
  | 'REQUEST_STATUS'
  | 'TEAM_MIX';

definePageMeta({
  layout: 'admin',
});

useHead({
  title: 'Admin Dashboard',
});

const assetsStore = useAssetsStore();
const assetRequestsStore = useAssetRequestsStore();
const ticketsStore = useTicketsStore();
const usersStore = useUsersStore();

await Promise.all([
  usersStore.fetchAll(),
  assetsStore.fetchAll(),
  ticketsStore.fetchAll(),
  assetRequestsStore.fetchAll(),
]);

const metricIcons = [
  'lucide:users-round',
  'lucide:boxes',
  'lucide:message-square-dot',
  'lucide:clipboard-list',
];
const chartColors: string[] = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
];

const buildNamedDistribution = (counts: Record<string, number>): DistributionSegment[] =>
  Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([label, value], index) => ({
      label,
      value,
      color: chartColors[index % chartColors.length]!,
    }));

const renewals = computed(() => assetsStore.urgentRenewals(6, 7));
const queueTickets = computed(() => ticketsStore.attentionQueue(4));
const queueRequests = computed(() => assetRequestsStore.reviewQueue(4));

const metrics = computed<DashboardMetric[]>(() => [
  {
    label: 'Managed users',
    value: `${usersStore.managedUsers.length}`,
    delta: `${usersStore.admins.length} admins`,
    hint: 'Every non-admin account currently visible to the workspace.',
  },
  {
    label: 'Tracked assets',
    value: `${assetsStore.count}`,
    delta: `${renewals.value.length} renewals due`,
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
]);

const trendMetric = ref<TrendMetric>('TICKETS');
const trendMetricOptions: Array<{
  label: string;
  value: TrendMetric;
}> = [
  { label: 'Assets created', value: 'ASSETS' },
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
    return buildTrendSeries(assetsStore.assets, (asset) => asset.createdAt);
  }

  if (trendMetric.value === 'REQUESTS') {
    return buildTrendSeries(assetRequestsStore.requests, (request) => request.createdAt);
  }

  return buildTrendSeries(ticketsStore.tickets, (ticket) => ticket.createdAt);
});

const trendTitle = computed(() => {
  if (trendMetric.value === 'ASSETS') return 'Asset creation trend';
  if (trendMetric.value === 'REQUESTS') return 'Request submission trend';
  return 'Ticket intake trend';
});

const trendValueLabel = computed(() => {
  if (trendMetric.value === 'ASSETS') return 'Assets recorded';
  if (trendMetric.value === 'REQUESTS') return 'Requests submitted';
  return 'Tickets opened';
});

const trendTotal = computed(() => {
  if (trendMetric.value === 'ASSETS') {
    return `${countItemsInRange(
      assetsStore.assets,
      (asset) => asset.createdAt,
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
      ? 'new assets'
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
  { label: 'Team mix', value: 'TEAM_MIX' },
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

  if (distributionMode.value === 'TEAM_MIX') {
    return buildNamedDistribution(usersStore.teamCounts);
  }

  return assetsStore.typeDistribution;
});

const distributionTitle = computed(() => {
  if (distributionMode.value === 'ASSET_STATUS') return 'Asset status mix';
  if (distributionMode.value === 'TICKET_STATUS') return 'Ticket status mix';
  if (distributionMode.value === 'REQUEST_STATUS') return 'Request status mix';
  if (distributionMode.value === 'TEAM_MIX') return 'Team coverage';
  return 'Asset type mix';
});

const distributionCenterLabel = computed(() => {
  if (distributionMode.value === 'TEAM_MIX') return 'Teams';
  if (distributionMode.value === 'REQUEST_STATUS') return 'Requests';
  if (distributionMode.value === 'TICKET_STATUS') return 'Tickets';
  return 'Assets';
});

const distributionCenterValue = computed(() => {
  if (distributionMode.value === 'REQUEST_STATUS') return `${assetRequestsStore.count}`;
  if (distributionMode.value === 'TICKET_STATUS') return `${ticketsStore.count}`;
  if (distributionMode.value === 'TEAM_MIX') return `${Object.keys(usersStore.teamCounts).length}`;
  return `${assetsStore.count}`;
});

const userName = (userId: number) => getDisplayName(usersStore.findUserById(userId));
</script>
