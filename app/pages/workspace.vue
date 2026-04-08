<script setup lang="ts">
import type { PaletteReviewThread } from '~/types/palette-review'
import type { StoredPalette } from '~/types/palette-store'
import type { StoredPaletteQaReport } from '~/types/theme-qa'
import type { WorkspacePaletteItem, WorkspaceRequestFetch } from '~/types/workspace'

definePageMeta({
  middleware: ['auth'],
})

function apiFetch<T>(
  url: string,
  options?: Parameters<WorkspaceRequestFetch>[1],
): Promise<T> {
  if (import.meta.server) {
    return useRequestFetch()(url, options) as Promise<T>
  }

  return $fetch<T>(url, options) as Promise<T>
}

const fetchWorkspaceApi = <T>(url: string) => {
  return apiFetch<T>(url, {
    credentials: 'include',
  })
}

const emptyReviewThread: PaletteReviewThread = {
  summary: {
    total: 0,
    approvals: 0,
    comments: 0,
    changesRequested: 0,
  },
  reviews: [],
}

const { data: workspaceItems, refresh } = await useAsyncData('workspace-palettes', async () => {
  const palettes = await fetchWorkspaceApi<StoredPalette[]>('/api/palettes/user')

  return Promise.all((palettes ?? []).map(async (palette): Promise<WorkspacePaletteItem> => {
    const [reviewThread, qa] = await Promise.all([
      fetchWorkspaceApi<PaletteReviewThread>(`/api/palettes/${palette._id}/reviews`).catch(() => emptyReviewThread),
      fetchWorkspaceApi<StoredPaletteQaReport>(`/api/palettes/${palette._id}/qa`).catch(() => null),
    ])

    return {
      palette,
      reviewThread,
      qa,
    }
  }))
}, {
  default: () => [],
})

const ownedItems = computed(() => workspaceItems.value.filter(item => item.palette.accessLevel === 'owner'))
const sharedItems = computed(() => workspaceItems.value.filter(item => item.palette.accessLevel === 'shared'))
const publishedItems = computed(() => workspaceItems.value.filter(item => item.palette.lifecycleStatus === 'published'))

const needsAttentionItems = computed(() => {
  return workspaceItems.value
    .filter((item) => {
      const hasReviewPressure = item.reviewThread.summary.changesRequested > 0
      const hasQaRisk = item.qa ? item.qa.report.status !== 'healthy' : false

      return hasReviewPressure || hasQaRisk
    })
    .sort((left, right) => {
      const leftPressure = left.reviewThread.summary.changesRequested + (left.qa?.report.counts.critical ?? 0)
      const rightPressure = right.reviewThread.summary.changesRequested + (right.qa?.report.counts.critical ?? 0)

      return rightPressure - leftPressure
    })
})

const recentItems = computed(() => {
  return [...workspaceItems.value]
    .sort((left, right) => new Date(right.palette.updatedAt).getTime() - new Date(left.palette.updatedAt).getTime())
    .slice(0, 8)
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
</script>

<template>
  <UMain>
    <UContainer class="space-y-6 py-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold text-highlighted">
            Workspace
          </h1>
          <p class="text-sm text-muted">
            Track owned palettes, shared private libraries, QA pressure, and review activity from one place.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton to="/" color="neutral" variant="outline" icon="i-lucide-wand-sparkles">
            Open builder
          </UButton>
          <UButton color="neutral" variant="soft" icon="i-lucide-refresh-cw" @click="refresh()">
            Refresh workspace
          </UButton>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-4">
        <UCard variant="outline">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">
            Owned
          </p>
          <p class="mt-2 text-2xl font-semibold text-highlighted">
            {{ ownedItems.length }}
          </p>
        </UCard>

        <UCard variant="outline">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">
            Shared with you
          </p>
          <p class="mt-2 text-2xl font-semibold text-highlighted">
            {{ sharedItems.length }}
          </p>
        </UCard>

        <UCard variant="outline">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">
            Published
          </p>
          <p class="mt-2 text-2xl font-semibold text-highlighted">
            {{ publishedItems.length }}
          </p>
        </UCard>

        <UCard variant="outline">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">
            Needs attention
          </p>
          <p class="mt-2 text-2xl font-semibold text-highlighted">
            {{ needsAttentionItems.length }}
          </p>
        </UCard>
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div class="space-y-6">
          <UCard variant="outline">
            <template #header>
              <div class="space-y-1">
                <p class="text-sm font-medium text-highlighted">
                  Needs Attention
                </p>
                <p class="text-sm text-muted">
                  Palettes with change requests or non-healthy QA status.
                </p>
              </div>
            </template>

            <div
              v-if="!needsAttentionItems.length"
              class="rounded-2xl border border-default px-4 py-4 text-sm text-muted"
            >
              No palettes are currently blocked by review pressure or QA risk.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="item in needsAttentionItems"
                :key="item.palette._id"
                class="rounded-2xl border border-default px-4 py-4"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-medium text-highlighted">
                    {{ item.palette.name }}
                  </p>
                  <UBadge :color="item.palette.accessLevel === 'owner' ? 'primary' : 'neutral'" variant="soft">
                    {{ item.palette.accessLevel }}
                  </UBadge>
                  <UBadge :color="item.palette.lifecycleStatus === 'published' ? 'success' : 'warning'" variant="soft">
                    {{ item.palette.lifecycleStatus }}
                  </UBadge>
                  <UBadge v-if="item.qa" :color="item.qa.report.status === 'healthy' ? 'success' : 'warning'" variant="outline">
                    QA: {{ item.qa.report.status }}
                  </UBadge>
                  <UBadge v-if="item.reviewThread.summary.changesRequested" color="warning" variant="soft">
                    {{ item.reviewThread.summary.changesRequested }} change request{{ item.reviewThread.summary.changesRequested === 1 ? '' : 's' }}
                  </UBadge>
                </div>

                <p class="mt-2 text-sm text-muted">
                  Updated {{ formatDate(item.palette.updatedAt) }}
                </p>

                <div class="mt-4 flex flex-wrap gap-2">
                  <UButton :to="`/palette/${item.palette.slug}`" color="neutral" variant="outline" size="sm">
                    Open share page
                  </UButton>
                  <UButton
                    v-if="item.palette.accessLevel === 'owner'"
                    :to="`/palette/${item.palette.slug}/history`"
                    color="neutral"
                    variant="soft"
                    size="sm"
                  >
                    History
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>

          <UCard variant="outline">
            <template #header>
              <div class="space-y-1">
                <p class="text-sm font-medium text-highlighted">
                  Recent Activity
                </p>
                <p class="text-sm text-muted">
                  The most recently updated owned and shared palettes.
                </p>
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="item in recentItems"
                :key="item.palette._id"
                class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-default px-4 py-4"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-highlighted">
                    {{ item.palette.name }}
                  </p>
                  <p class="truncate text-xs text-muted">
                    {{ formatDate(item.palette.updatedAt) }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <UBadge :color="item.palette.accessLevel === 'owner' ? 'primary' : 'neutral'" variant="soft">
                    {{ item.palette.accessLevel }}
                  </UBadge>
                  <UBadge color="neutral" variant="outline">
                    v{{ item.palette.version }}
                  </UBadge>
                  <UBadge v-if="item.palette.collaborators.length" color="neutral" variant="soft">
                    {{ item.palette.collaborators.length }} collaborator{{ item.palette.collaborators.length === 1 ? '' : 's' }}
                  </UBadge>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <div class="space-y-6">
          <UCard variant="outline">
            <template #header>
              <div class="space-y-1">
                <p class="text-sm font-medium text-highlighted">
                  Shared Library
                </p>
                <p class="text-sm text-muted">
                  Private palettes you can access without forking.
                </p>
              </div>
            </template>

            <div
              v-if="!sharedItems.length"
              class="rounded-2xl border border-default px-4 py-4 text-sm text-muted"
            >
              No private palettes have been shared with you yet.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="item in sharedItems"
                :key="item.palette._id"
                class="rounded-2xl border border-default px-4 py-4"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-medium text-highlighted">
                    {{ item.palette.name }}
                  </p>
                  <UBadge color="neutral" variant="soft">
                    shared
                  </UBadge>
                  <UBadge :color="item.palette.lifecycleStatus === 'published' ? 'success' : 'warning'" variant="outline">
                    {{ item.palette.lifecycleStatus }}
                  </UBadge>
                </div>

                <p class="mt-2 text-xs text-muted">
                  Last updated {{ formatDate(item.palette.updatedAt) }}
                </p>

                <div class="mt-4 flex flex-wrap gap-2">
                  <UButton :to="`/palette/${item.palette.slug}`" color="neutral" variant="outline" size="sm">
                    Open
                  </UButton>
                  <UButton :to="`/palette/${item.palette.slug}/history`" color="neutral" variant="soft" size="sm">
                    History
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>

          <UCard variant="outline">
            <template #header>
              <div class="space-y-1">
                <p class="text-sm font-medium text-highlighted">
                  Publish Readiness
                </p>
                <p class="text-sm text-muted">
                  QA summaries for palettes you can actively work on.
                </p>
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="item in workspaceItems"
                :key="`${item.palette._id}-qa`"
                class="rounded-2xl border border-default px-4 py-4"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-medium text-highlighted">
                    {{ item.palette.name }}
                  </p>
                  <UBadge
                    :color="item.qa?.report.status === 'healthy' ? 'success' : item.qa?.report.status === 'needs-work' ? 'warning' : 'error'"
                    variant="soft"
                  >
                    {{ item.qa?.report.status ?? 'unavailable' }}
                  </UBadge>
                </div>

                <p class="mt-2 text-xs text-muted">
                  {{ item.qa ? `${item.qa.report.counts.critical} critical, ${item.qa.report.counts.warning} warning` : 'QA report unavailable for this palette.' }}
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </UContainer>
  </UMain>
</template>
