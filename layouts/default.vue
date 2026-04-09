<script setup lang="ts">
defineOptions({
  name: 'DefaultLayout',
})
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />

    <NuxtPage />

    <PaletteLibraryDrawers />
  </UApp>
</template>
