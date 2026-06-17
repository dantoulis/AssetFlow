<template>
  <div v-if="providers.length" class="grid gap-4">
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t border-border/70" />
      </div>
      <div class="relative flex justify-center">
        <span
          class="bg-card px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
        >
          Or continue with
        </span>
      </div>
    </div>

    <div class="flex items-center gap-6">
      <a
        v-for="provider in providers"
        :key="provider.label"
        :href="provider.href"
        class="flex h-14 w-full items-center justify-center rounded-2xl border border-border/75 bg-card/92 shadow-sm transition hover:border-primary/30 hover:bg-primary/8"
      >
        <Icon :name="provider.icon" :class="provider.iconClass" />
        <span class="sr-only">{{ provider.label }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
type SocialProvider = {
  href: string;
  icon: string;
  iconClass: string;
  label: string;
};

const config = useRuntimeConfig();
const apiBase = usePublicApiBase();

const parsePublicFeatureFlag = (value: unknown): boolean => value === true || value === 'true';
const googleAuthEnabled = parsePublicFeatureFlag(config.public.googleAuthEnabled);
const githubAuthEnabled = parsePublicFeatureFlag(config.public.githubAuthEnabled);

const providers = computed<SocialProvider[]>(() => [
  ...(googleAuthEnabled
    ? [
        {
          label: 'Google',
          icon: 'simple-icons:google',
          iconClass: 'size-6 text-[#4285F4]',
          href: `${apiBase}/auth/google`,
        },
      ]
    : []),
  ...(githubAuthEnabled
    ? [
        {
          label: 'GitHub',
          icon: 'simple-icons:github',
          iconClass: 'size-6 text-foreground dark:text-white',
          href: `${apiBase}/auth/github`,
        },
      ]
    : []),
]);
</script>
