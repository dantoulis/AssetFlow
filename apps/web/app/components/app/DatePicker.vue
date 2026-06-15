<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        :id="id"
        variant="outline"
        class="h-11 w-full justify-between rounded-2xl border-border/70 bg-muted/58 px-4 text-left font-normal shadow-none dark:border-border/90 dark:bg-input"
        :class="!modelValue && 'text-muted-foreground'"
      >
        <span>{{ displayLabel }}</span>
        <Icon name="lucide:calendar-days" class="size-4 opacity-65" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" class="w-auto p-0">
      <Calendar v-model="calendarValue" locale="en" class="rounded-3xl p-4" initial-focus />
      <div class="flex items-center justify-between border-t border-border/70 px-4 py-3">
        <p class="text-xs text-muted-foreground">
          {{ helperText }}
        </p>
        <Button v-if="modelValue" variant="ghost" size="sm" class="rounded-full" @click="clearDate">
          Clear
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { getLocalTimeZone, parseDate } from '@internationalized/date';
import type { DateValue } from 'reka-ui';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const props = defineProps<{
  modelValue: string;
  id?: string;
  placeholder: string;
  helperText?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const open = ref(false);
const timeZone = getLocalTimeZone();

const calendarValue = computed<DateValue | undefined>({
  get: () => (props.modelValue ? parseDate(props.modelValue) : undefined),
  set: (value) => {
    emit('update:modelValue', value ? value.toString() : '');
    open.value = false;
  },
});

const displayLabel = computed(() => {
  if (!props.modelValue) {
    return props.placeholder;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parseDate(props.modelValue).toDate(timeZone));
});

const helperText = computed(() => props.helperText ?? 'Pick a date from the calendar.');

const clearDate = () => {
  emit('update:modelValue', '');
  open.value = false;
};
</script>
