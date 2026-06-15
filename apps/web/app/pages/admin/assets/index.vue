<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Inventory"
      title="Assets, subscriptions, and renewal pressure."
      description="Scan the inventory, filter by type or status, and drill into anything that needs attention."
    >
      <template #actions>
        <Dialog v-model:open="createDialogOpen">
          <DialogTrigger as-child>
            <Button class="rounded-2xl">
              <Icon name="lucide:boxes" class="size-4" />
              Assign asset
            </Button>
          </DialogTrigger>
          <DialogScrollContent
            :show-close-button="false"
            class="rounded-3xl border-border/80 bg-white text-foreground shadow-[0_30px_120px_-50px_color-mix(in_oklab,var(--color-primary)_30%,transparent)] dark:bg-card sm:max-w-3xl"
          >
            <DialogHeader>
              <DialogTitle>Create and assign asset</DialogTitle>
              <DialogDescription>
                Provision a new asset record and assign it directly to an available user.
              </DialogDescription>
            </DialogHeader>
            <AssetEditor
              embedded
              submit-label="Create asset"
              :owner-options="ownerOptions"
              :saving="creating"
              :show-owner-select="true"
              secondary-action-label="Close"
              secondary-action-mode="close"
              @cancel="createDialogOpen = false"
              @submit="createAsset"
            />
          </DialogScrollContent>
        </Dialog>
      </template>
    </PageIntro>

    <section class="grid gap-4 xl:grid-cols-4">
      <MetricCard
        title="Total assets"
        :value="`${assets.length}`"
        delta="All categories"
        hint="Every hardware and software asset currently tracked."
      >
        <template #icon><Icon name="lucide:boxes" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Active"
        :value="`${activeAssets.length}`"
        delta="Healthy inventory"
        hint="Assets currently in a healthy operational state."
        tone="success"
      >
        <template #icon><Icon name="lucide:circle-check-big" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Renewing soon"
        :value="`${renewingSoon.length}`"
        delta="21-day window"
        hint="Assets likely to need follow-up soon."
        tone="warning"
      >
        <template #icon><Icon name="lucide:calendar-clock" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Repair queue"
        :value="`${inRepairAssets.length}`"
        delta="Hardware"
        hint="Assets currently blocked or being serviced."
        tone="neutral"
      >
        <template #icon><Icon name="lucide:wrench" class="size-5" /></template>
      </MetricCard>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader class="gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Asset directory</CardTitle>
          <CardDescription>Filter by type and status to focus the inventory view.</CardDescription>
        </div>
        <div class="grid gap-3 md:grid-cols-[auto_repeat(2,minmax(0,1fr))]">
          <AppSelectField
            v-model="typeFilter"
            :options="typeFilterOptions"
            placeholder="All asset types"
            trigger-class="min-w-44"
          />
          <AppSelectField
            v-model="statusFilter"
            :options="statusFilterOptions"
            placeholder="All statuses"
            trigger-class="min-w-44"
          />
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <NuxtLink
          v-for="asset in filteredAssets"
          :key="asset.id"
          :to="`/admin/assets/${asset.id}`"
          class="app-list-item"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2">
                <StatusBadge :status="asset.type" />
                <StatusBadge :status="asset.status" />
              </div>
              <div>
                <p class="font-semibold">{{ asset.title }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ asset.vendor }} · {{ ownerName(asset.userId) }} ·
                  {{ formatRelativeDate(getAssetNextDate(asset)) }}
                </p>
              </div>
            </div>
            <span class="text-xs text-muted-foreground">{{ asset.reference }}</span>
          </div>
        </NuxtLink>

        <div v-if="!filteredAssets.length" class="app-empty-state">
          No assets match the current filters.
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { toast } from 'vue-sonner';
import {
  formatRelativeDate,
  getAssetNextDate,
  getDisplayName,
  humanizeEnum,
} from '@/lib/app-formatters';
import type { AssetCreatePayload, AssetStatus, AssetType } from '@/lib/app-types';

definePageMeta({
  layout: 'admin',
});

useHead({
  title: 'Assets',
});

const assetsStore = useAssetsStore();
const usersStore = useUsersStore();

await Promise.all([assetsStore.fetchAll(), usersStore.fetchAll()]);

const { activeAssets, assets, inRepairAssets } = storeToRefs(assetsStore);
const assetTypes: AssetType[] = ['LAPTOP', 'SUBSCRIPTION', 'LICENSE', 'PERIPHERAL'];
const statuses: AssetStatus[] = ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'IN_REPAIR'];
const typeFilter = ref<'ALL' | AssetType>('ALL');
const statusFilter = ref<'ALL' | AssetStatus>('ALL');
const createDialogOpen = ref(false);
const creating = ref(false);
const typeFilterOptions: Array<{ label: string; value: 'ALL' | AssetType }> = [
  { label: 'All asset types', value: 'ALL' },
  ...assetTypes.map((type) => ({ label: humanizeEnum(type), value: type })),
];
const statusFilterOptions: Array<{ label: string; value: 'ALL' | AssetStatus }> = [
  { label: 'All statuses', value: 'ALL' },
  ...statuses.map((status) => ({ label: humanizeEnum(status), value: status })),
];

const ownerName = (userId: number) => getDisplayName(usersStore.findUserById(userId));
const ownerOptions = computed(() =>
  [...usersStore.managedUsers]
    .sort((left, right) => getDisplayName(left).localeCompare(getDisplayName(right)))
    .map((user) => ({
      label: `${getDisplayName(user)} | ${user.team || 'No team'} | ${user.username}`,
      value: user.id,
    })),
);
const renewingSoon = computed(() => assetsStore.renewingWithin(21));
const filteredAssets = computed(() =>
  assets.value.filter((asset) => {
    if (typeFilter.value !== 'ALL' && asset.type !== typeFilter.value) return false;
    if (statusFilter.value !== 'ALL' && asset.status !== statusFilter.value) return false;
    return true;
  }),
);

const createAsset = async (payload: AssetCreatePayload) => {
  creating.value = true;

  try {
    const createdAsset = await assetsStore.createAsset(payload);
    createDialogOpen.value = false;
    toast.success('Asset assigned');
    await navigateTo(`/admin/assets/${createdAsset.id}`);
  } catch {
    toast.error('Unable to create asset');
  } finally {
    creating.value = false;
  }
};
</script>
