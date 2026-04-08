<script setup lang="ts">
import type { StoredPalette } from '~/types/palette-store'
import type { PaletteVersionSnapshot } from '~/types/palette-version'
import { comparePaletteVersions } from '~/utils/palette-compare'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined

const { data: palette, error: paletteError } = await useAsyncData(
  () => `palette-history-palette-${slug.value}`,
  () => $fetch<StoredPalette>(`/api/palettes/slug/${slug.value}`, {
    headers: requestHeaders,
  }),
)

if (paletteError.value) {
  throw createError({
    statusCode: paletteError.value.statusCode ?? 404,
    statusMessage: paletteError.value.statusMessage ?? 'Palette not found',
  })
}

const paletteId = computed(() => palette.value?._id ?? '')

const { data: history, error: historyError } = await useAsyncData(
  () => `palette-history-${paletteId.value}`,
  () => $fetch<PaletteVersionSnapshot[]>(`/api/palettes/${paletteId.value}/history`, {
    headers: requestHeaders,
  }),
  {
    watch: [paletteId],
    default: () => [],
    immediate: Boolean(paletteId.value),
  },
)

if (historyError.value) {
  throw createError({
    statusCode: historyError.value.statusCode ?? 403,
    statusMessage: historyError.value.statusMessage ?? 'Palette history is only available to the owner.',
  })
}

const historyEntries = computed(() => history.value ?? [])
const fromVersion = ref<number | undefined>(undefined)
const toVersion = ref<number | undefined>(undefined)

const versionOptions = computed(() => {
  return historyEntries.value.map(entry => ({
    label: `v${entry.version} · ${entry.event} · ${formatDate(entry.createdAt)}`,
    value: entry.version,
  }))
})

watch(historyEntries, (entries) => {
  if (!entries.length) {
    fromVersion.value = undefined
    toVersion.value = undefined
    return
  }

  const latestVersion = entries[0]?.version
  const previousVersion = entries[1]?.version ?? latestVersion

  if (!toVersion.value || !entries.some(entry => entry.version === toVersion.value)) {
    toVersion.value = latestVersion
  }

  if (!fromVersion.value || !entries.some(entry => entry.version === fromVersion.value)) {
    fromVersion.value = previousVersion
  }
}, { immediate: true })

const fromEntry = computed(() => {
  return historyEntries.value.find(entry => entry.version === fromVersion.value) ?? null
})

const toEntry = computed(() => {
  return historyEntries.value.find(entry => entry.version === toVersion.value) ?? null
})

const comparison = computed(() => {
  if (!fromEntry.value || !toEntry.value) {
    return null
  }

  return comparePaletteVersions(fromEntry.value.palette, toEntry.value.palette, {
    fromVersion: fromEntry.value.version,
    toVersion: toEntry.value.version,
  })
})

const groupedChanges = computed(() => {
  if (!comparison.value) {
    return []
  }

  return Object.entries(comparison.value.sectionCounts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
})

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Not published yet'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function selectForCompare(version: number, side: 'from' | 'to') {
  if (side === 'from') {
    fromVersion.value = version
    return
  }

  toVersion.value = version
}
</script>

<template>
  <UMain>
    <UContainer class="space-y-6 py-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="neutral" variant="soft">
              Version history
            </UBadge>
            <UBadge :color="palette?.lifecycleStatus === 'published' ? 'success' : 'warning'" variant="soft">
              {{ palette?.lifecycleStatus }}
            </UBadge>
            <UBadge color="neutral" variant="outline">
              v{{ palette?.version }}
            </UBadge>
          </div>

          <div class="space-y-1">
            <h1 class="text-2xl font-semibold text-highlighted">
              {{ palette?.name }}
            </h1>
            <p class="text-sm text-muted">
              Compare saved versions, review lifecycle changes, and inspect what changed before you publish again.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            :to="`/palette/${slug}`"
            color="neutral"
            variant="outline"
            icon="i-lucide-eye"
          >
            Shared preview
          </UButton>
          <UButton
            to="/"
            color="neutral"
            variant="soft"
            icon="i-lucide-wand-sparkles"
          >
            Open builder
          </UButton>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <UCard variant="outline">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">
            Saved versions
          </p>
          <p class="mt-2 text-2xl font-semibold text-highlighted">
            {{ historyEntries.length }}
          </p>
        </UCard>

        <UCard variant="outline">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">
            Updated
          </p>
          <p class="mt-2 text-sm font-medium text-highlighted">
            {{ formatDate(palette?.updatedAt) }}
          </p>
        </UCard>

        <UCard variant="outline">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">
            First published
          </p>
          <p class="mt-2 text-sm font-medium text-highlighted">
            {{ formatDate(palette?.publishedAt) }}
          </p>
        </UCard>
      </div>

      <div class="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <UCard variant="outline">
          <template #header>
            <div class="space-y-1">
              <p class="text-sm font-medium text-highlighted">
                Timeline
              </p>
              <p class="text-sm text-muted">
                Pick any two versions to compare.
              </p>
            </div>
          </template>

          <div class="space-y-3">
            <div
              v-for="entry in historyEntries"
              :key="entry.id"
              class="rounded-2xl border border-default px-4 py-4"
            >
              <div class="flex flex-wrap items-center gap-2">
                <UBadge color="neutral" variant="outline">
                  v{{ entry.version }}
                </UBadge>
                <UBadge :color="entry.lifecycleStatus === 'published' ? 'success' : 'warning'" variant="soft">
                  {{ entry.lifecycleStatus }}
                </UBadge>
                <UBadge color="neutral" variant="soft">
                  {{ entry.event }}
                </UBadge>
              </div>

              <p class="mt-3 text-sm font-medium text-highlighted">
                {{ entry.name }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ formatDate(entry.createdAt) }}
              </p>

              <div class="mt-4 flex gap-2">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="outline"
                  @click="selectForCompare(entry.version, 'from')"
                >
                  Use as from
                </UButton>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="soft"
                  @click="selectForCompare(entry.version, 'to')"
                >
                  Use as to
                </UButton>
              </div>
            </div>
          </div>
        </UCard>

        <div class="space-y-6">
          <UCard variant="outline">
            <template #header>
              <div class="space-y-1">
                <p class="text-sm font-medium text-highlighted">
                  Compare versions
                </p>
                <p class="text-sm text-muted">
                  Review the diff between two saved snapshots of the same palette.
                </p>
              </div>
            </template>

            <div class="space-y-5">
              <div class="grid gap-4 md:grid-cols-2">
                <UFormField label="From version" name="from-version">
                  <USelect
                    v-model="fromVersion"
                    :items="versionOptions"
                    value-key="value"
                    variant="outline"
                  />
                </UFormField>

                <UFormField label="To version" name="to-version">
                  <USelect
                    v-model="toVersion"
                    :items="versionOptions"
                    value-key="value"
                    variant="outline"
                  />
                </UFormField>
              </div>

              <div v-if="comparison" class="grid gap-4 md:grid-cols-4">
                <div class="rounded-2xl border border-default px-4 py-3">
                  <p class="text-xs uppercase tracking-[0.16em] text-muted">
                    Total changes
                  </p>
                  <p class="mt-2 text-xl font-semibold text-highlighted">
                    {{ comparison.totalChanges }}
                  </p>
                </div>

                <div class="rounded-2xl border border-default px-4 py-3">
                  <p class="text-xs uppercase tracking-[0.16em] text-muted">
                    Changed
                  </p>
                  <p class="mt-2 text-xl font-semibold text-highlighted">
                    {{ comparison.changedCount }}
                  </p>
                </div>

                <div class="rounded-2xl border border-default px-4 py-3">
                  <p class="text-xs uppercase tracking-[0.16em] text-muted">
                    Added
                  </p>
                  <p class="mt-2 text-xl font-semibold text-highlighted">
                    {{ comparison.addedCount }}
                  </p>
                </div>

                <div class="rounded-2xl border border-default px-4 py-3">
                  <p class="text-xs uppercase tracking-[0.16em] text-muted">
                    Removed
                  </p>
                  <p class="mt-2 text-xl font-semibold text-highlighted">
                    {{ comparison.removedCount }}
                  </p>
                </div>
              </div>

              <div
                v-if="comparison && groupedChanges.length"
                class="flex flex-wrap gap-2"
              >
                <UBadge
                  v-for="[section, count] in groupedChanges"
                  :key="section"
                  color="neutral"
                  variant="soft"
                >
                  {{ section }} · {{ count }}
                </UBadge>
              </div>
            </div>
          </UCard>

          <UCard variant="outline">
            <template #header>
              <div class="space-y-1">
                <p class="text-sm font-medium text-highlighted">
                  Diff
                </p>
                <p class="text-sm text-muted">
                  Flat token-level changes between the selected versions.
                </p>
              </div>
            </template>

            <div
              v-if="!comparison"
              class="rounded-2xl border border-default px-4 py-4 text-sm text-muted"
            >
              Select two versions to compare.
            </div>

            <div
              v-else-if="!comparison.changes.length"
              class="rounded-2xl border border-default px-4 py-4 text-sm text-muted"
            >
              No token changes between these versions.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="change in comparison.changes"
                :key="`${change.path}-${change.type}`"
                class="rounded-2xl border border-default px-4 py-4"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge color="neutral" variant="soft">
                    {{ change.section }}
                  </UBadge>
                  <UBadge
                    :color="change.type === 'added' ? 'success' : change.type === 'removed' ? 'error' : 'warning'"
                    variant="soft"
                  >
                    {{ change.type }}
                  </UBadge>
                </div>

                <p class="mt-3 break-all font-mono text-xs text-highlighted">
                  {{ change.path }}
                </p>

                <div class="mt-3 grid gap-3 lg:grid-cols-2">
                  <div class="rounded-2xl bg-muted/40 px-3 py-3">
                    <p class="text-[11px] uppercase tracking-[0.14em] text-muted">
                      From
                    </p>
                    <p class="mt-2 break-all font-mono text-xs text-highlighted">
                      {{ change.before ?? 'null' }}
                    </p>
                  </div>

                  <div class="rounded-2xl bg-muted/40 px-3 py-3">
                    <p class="text-[11px] uppercase tracking-[0.14em] text-muted">
                      To
                    </p>
                    <p class="mt-2 break-all font-mono text-xs text-highlighted">
                      {{ change.after ?? 'null' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </UContainer>
  </UMain>
</template>
