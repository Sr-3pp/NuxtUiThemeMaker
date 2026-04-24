<script setup lang="ts">
const emit = defineEmits<{
  editor: []
  regenerate: []
}>()
</script>

<template>
  <section class="rounded-3xl border border-default bg-elevated px-6 py-10 shadow-2xl sm:px-10 lg:py-12">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex-1 space-y-3">
        <p class="text-sm font-semibold uppercase tracking-widest text-primary">
          Keep going
        </p>
        <h2 class="text-3xl font-bold tracking-tight text-highlighted lg:text-4xl">
          Generate again, jump into the editor, or compare plans once the workflow clicks.
        </h2>
        <p class="max-w-3xl text-base leading-relaxed text-muted lg:text-lg">
          The landing proves the palette. The editor and workspace are where you turn it into something you can actually ship.
        </p>
      </div>

      <div class="grid gap-3 sm:min-w-72 lg:min-w-80">
        <UButton color="primary" size="xl" icon="i-lucide-refresh-cw" @click="emit('regenerate')">
          Generate another
        </UButton>
        <UButton color="neutral" variant="outline" size="xl" icon="i-lucide-pencil-ruler" @click="emit('editor')">
          Open editor
        </UButton>
        <UButton color="neutral" variant="ghost" size="xl" to="/pricing">
          See pricing
        </UButton>
      </div>
    </div>
  </section>
</template>
