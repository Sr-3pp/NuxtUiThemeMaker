<script setup lang="ts">
definePageMeta({
  middleware: ['panel-admin'],
})

usePageSeo({
  title: 'Admin Panel',
  description: 'Private admin area for managing users, palettes, and email testing.',
  path: '/panel',
  robots: 'noindex, nofollow',
})

const panelLinks = [
  {
    title: 'Users',
    description: 'Manage accounts, admin access, and password resets.',
    to: '/panel/users',
  },
  {
    title: 'Palettes',
    description: 'Review saved palettes and moderate visibility or content.',
    to: '/panel/palettes',
  },
  {
    title: 'Emails',
    description: 'Send test registration and purchase confirmation emails.',
    to: '/panel/emails',
  },
]
</script>

<template>
  <UContainer class="space-y-6 py-8">
    <div class="space-y-1">
      <h1 class="text-2xl font-semibold text-highlighted">
        Admin Panel
      </h1>
      <p class="text-sm text-muted">
        Manage the operational areas of the app from one place.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <NuxtLink
        v-for="item in panelLinks"
        :key="item.to"
        :to="item.to"
        class="rounded-3xl border border-default bg-default/50 p-6 transition hover:border-primary/50 hover:bg-default"
      >
        <p class="text-base font-semibold text-highlighted">
          {{ item.title }}
        </p>
        <p class="mt-2 text-sm text-muted">
          {{ item.description }}
        </p>
      </NuxtLink>
    </div>
  </UContainer>
</template>
