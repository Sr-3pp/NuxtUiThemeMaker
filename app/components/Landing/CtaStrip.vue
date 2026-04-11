<script setup lang="ts">
const emit = defineEmits<{
  editor: []
  regenerate: []
}>()
</script>

<template>
  <section class="rounded-[2rem] border border-default/70 bg-default/85 px-6 py-8 shadow-xl sm:px-8">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-2">
        <p class="text-xs uppercase tracking-[0.2em] text-primary">
          Keep going
        </p>
        <h2 class="text-3xl font-semibold tracking-tight text-highlighted">
          Generate again, jump into the editor, or compare plans once the workflow clicks.
        </h2>
        <p class="max-w-3xl text-sm leading-6 text-muted">
          The landing proves the palette. The editor and workspace are where you turn it into something you can actually ship.
        </p>
      </div>

      <div class="grid gap-3 sm:min-w-[260px]">
        <UButton color="primary" icon="i-lucide-refresh-cw" @click="emit('regenerate')">
          Generate another
        </UButton>
        <UButton color="neutral" variant="outline" icon="i-lucide-pencil-ruler" @click="emit('editor')">
          Open editor
        </UButton>
        <UButton color="neutral" variant="ghost" to="/pricing">
          See pricing
        </UButton>
      </div>
    </div>
  </section>
</template>
