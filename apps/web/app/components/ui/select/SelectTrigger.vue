<template>
  <SelectTrigger
    data-slot="select-trigger"
    v-bind="{ ...$attrs, ...forwarded }"
    :class="
      cn(
        'border-input bg-muted/58 ring-offset-background focus-visible:ring-ring data-[placeholder]:text-muted-foreground flex h-11 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-2 text-sm shadow-sm outline-hidden transition focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border/90 dark:bg-input',
        props.class,
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <Icon name="lucide:chevron-down" class="size-4 shrink-0 text-muted-foreground" />
    </SelectIcon>
  </SelectTrigger>
</template>

<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import type { SelectTriggerProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { SelectIcon, SelectTrigger, useForwardProps } from 'reka-ui';
import { cn } from '@/lib/utils';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<SelectTriggerProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegatedProps);
</script>
