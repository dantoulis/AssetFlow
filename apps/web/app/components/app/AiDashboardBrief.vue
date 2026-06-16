<template>
  <Card
    class="app-surface relative overflow-hidden border-primary/20 shadow-[0_20px_80px_-50px_color-mix(in_oklab,var(--color-primary)_30%,transparent)]"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
    />
    <div
      class="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-primary/14 blur-3xl"
    />
    <CardContent class="relative grid gap-4 p-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/14 text-primary ring-1 ring-primary/25"
          >
            <Icon name="lucide:sparkles" class="size-4" />
          </div>
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                class="rounded-full border-primary/20 bg-primary/10 text-primary"
              >
                AI Insights
              </Badge>
              <Badge v-if="brief" variant="outline" :class="cn('rounded-full', severityClass)">
                {{ brief.severity }}
              </Badge>
              <Badge
                v-if="isBriefStale"
                variant="outline"
                class="rounded-full border-amber-500/25 bg-amber-500/12 text-amber-700 dark:text-amber-300"
              >
                New data available
              </Badge>
            </div>
            <div class="min-w-0">
              <CardTitle class="text-base">{{ brief?.title ?? defaultTitle }}</CardTitle>
              <CardDescription class="text-xs">
                {{ helperText }}
              </CardDescription>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button
            v-if="brief"
            variant="ghost"
            class="rounded-2xl bg-background/60"
            :aria-expanded="isExpanded"
            @click="isExpanded = !isExpanded"
          >
            <Icon :name="isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" />
            {{ isExpanded ? 'Collapse' : 'Expand' }}
          </Button>
          <Button
            class="rounded-2xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            :disabled="isGenerating || !snapshot"
            @click="generateBrief"
          >
            <Icon name="lucide:refresh-cw" :class="cn('size-4', isGenerating && 'animate-spin')" />
            {{ buttonLabel }}
          </Button>
        </div>
      </div>

      <div v-if="isGenerating" class="app-inset-panel grid gap-3 p-4">
        <div class="flex items-center gap-3 text-sm font-medium">
          <Icon name="lucide:loader-circle" class="size-4 animate-spin text-primary" />
          Gemini is analyzing the current dashboard snapshot...
        </div>
        <div class="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
        <div class="h-3 w-full animate-pulse rounded-full bg-muted" />
      </div>

      <div
        v-else-if="error"
        class="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-destructive/25 bg-destructive/8 p-4"
      >
        <div class="flex items-center gap-3">
          <Icon name="lucide:triangle-alert" class="size-4 text-destructive" />
          <p class="text-sm font-medium">
            {{ error }}
          </p>
        </div>
        <Button variant="outline" class="rounded-2xl bg-background/70" @click="generateBrief">
          Retry
        </Button>
      </div>

      <div
        v-else-if="brief && !isExpanded"
        class="app-inset-panel flex flex-wrap items-center gap-4 p-4"
      >
        <p class="line-clamp-2 max-w-4xl text-sm leading-6 text-muted-foreground">
          {{ brief.summary }}
        </p>
        <p class="text-xs text-muted-foreground">
          {{ analyzedLabel }}
        </p>
      </div>

      <div v-else-if="brief" class="grid gap-4">
        <div class="app-inset-panel p-4">
          <p class="max-w-4xl text-sm leading-6 text-foreground/90">
            {{ brief.summary }}
          </p>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <div
            v-for="section in reasoningSections"
            :key="section.title"
            class="app-inset-panel p-4"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {{ section.title }}
            </p>
            <p class="mt-2 font-semibold">{{ section.value.label }}</p>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">
              {{ section.value.reasoning }}
            </p>
            <div v-if="section.value.evidence.length" class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="item in section.value.evidence"
                :key="item"
                class="rounded-full border border-primary/20 bg-primary px-3 py-1 text-xs font-medium text-primary-foreground dark:border-primary/30 dark:text-black"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </div>

        <div
          class="grid gap-4 rounded-3xl border border-primary/20 bg-primary/10 p-4 dark:border-primary/25 dark:bg-primary/16"
        >
          <div class="flex items-center gap-3">
            <Icon name="lucide:wand-sparkles" class="size-4 text-primary" />
            <p class="text-sm font-semibold">Recommended action plan</p>
          </div>
          <div class="grid gap-3 md:grid-cols-3">
            <div
              v-for="action in brief.recommendedActions"
              :key="`${action.urgency}-${action.action}`"
              class="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm dark:border-white/10 dark:bg-background/72"
            >
              <Badge variant="outline" :class="cn('rounded-full', urgencyClass(action.urgency))">
                {{ action.urgency }}
              </Badge>
              <p class="mt-2 text-sm font-semibold">{{ action.action }}</p>
              <p class="mt-1 text-xs leading-5 text-muted-foreground">{{ action.reason }}</p>
            </div>
          </div>
          <p class="text-xs text-muted-foreground">{{ analyzedLabel }}</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { cn } from '@/lib/utils';

const aiDashboardBriefStore = useAiDashboardBriefStore();
const { brief, error, isBriefStale, isGenerating, snapshot, snapshotStats } =
  storeToRefs(aiDashboardBriefStore);

const isExpanded = ref(false);

const defaultTitle = computed(() =>
  snapshot.value?.role === 'ADMIN' ? 'AI Operations Brief' : 'AI Personal Brief',
);

const helperText = computed(() => {
  if (isBriefStale.value) {
    return 'The workflow state has changed since this brief was generated. Refresh it for the latest read.';
  }

  if (brief.value) {
    return 'AI-generated workflow brief with current risks, pressure points, and suggested next steps.';
  }

  return 'Generate a workflow brief to surface current state, operational risks, and useful next steps.';
});

const severityClass = computed(() => {
  if (brief.value?.severity === 'HIGH') {
    return 'border-red-500/25 bg-red-500/12 text-red-700 dark:text-red-300';
  }

  if (brief.value?.severity === 'MEDIUM') {
    return 'border-amber-500/25 bg-amber-500/12 text-amber-700 dark:text-amber-300';
  }

  return 'border-emerald-500/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300';
});

const buttonLabel = computed(() => {
  if (isGenerating.value) return 'Generating...';
  if (brief.value) return 'Refresh brief';
  return 'Generate brief';
});

const analyzedLabel = computed(
  () =>
    `Analyzed ${snapshotStats.value.assets} assets, ${snapshotStats.value.tickets} tickets, ${snapshotStats.value.requests} requests`,
);

const reasoningSections = computed(() => {
  if (!brief.value) {
    return [];
  }

  return [
    {
      title: 'Primary risk',
      value: brief.value.primaryRisk,
    },
    {
      title: 'Pattern detected',
      value: brief.value.patternDetected,
    },
  ];
});

const urgencyClass = (urgency: 'NOW' | 'NEXT' | 'WATCH') => {
  if (urgency === 'NOW') {
    return 'border-red-500/25 bg-red-500/12 text-red-700 dark:text-red-300';
  }

  if (urgency === 'NEXT') {
    return 'border-amber-500/25 bg-amber-500/12 text-amber-700 dark:text-amber-300';
  }

  return 'border-emerald-500/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300';
};

const generateBrief = async () => {
  const nextBrief = await aiDashboardBriefStore.generateBrief();

  if (nextBrief) {
    isExpanded.value = true;
  }
};
</script>
