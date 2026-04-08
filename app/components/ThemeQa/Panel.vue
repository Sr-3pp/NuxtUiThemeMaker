<script setup lang="ts">
import type { ThemeQaPanelProps, ThemeQaSeverity, ThemeQaStatusMeta } from '~/types/theme-qa'
import { auditPaletteTheme } from '~/utils/palette-qa'

const props = withDefaults(defineProps<ThemeQaPanelProps>(), {
  compact: false,
  report: null,
  source: 'local',
  loading: false,
})

const report = computed(() => props.report ?? auditPaletteTheme(props.palette))

const statusMeta = computed<ThemeQaStatusMeta>(() => {
  if (report.value.status === 'healthy') {
    return {
      color: 'success',
      label: 'Healthy',
      description: 'Ready for export with only minor review left.',
    }
  }

  if (report.value.status === 'needs-work') {
    return {
      color: 'warning',
      label: 'Needs work',
      description: 'Usable, but there are visible risks to resolve first.',
    }
  }

  return {
    color: 'error',
    label: 'Risky',
    description: 'There are likely regressions or accessibility issues blocking publish.',
  }
})

const topIssues = computed(() => report.value.issues.slice(0, props.compact ? 3 : 6))

function getSeverityColor(severity: ThemeQaSeverity) {
  if (severity === 'critical') {
    return 'error'
  }

  if (severity === 'warning') {
    return 'warning'
  }

  return 'neutral'
}
</script>

<template>
  <UCard variant="outline" class="rounded-2xl shadow-none dark:border-white/10 dark:bg-black/40">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-highlighted">
              Theme QA
            </p>
            <UBadge color="neutral" variant="outline">
              {{ props.source === 'server' ? 'Saved on server' : 'Current draft' }}
            </UBadge>
            <UBadge :color="statusMeta.color" variant="soft">
              {{ statusMeta.label }}
            </UBadge>
          </div>
          <p class="text-xs text-muted">
            {{ statusMeta.description }}
          </p>
        </div>

        <div class="text-right">
          <p class="text-2xl font-semibold text-highlighted">
            {{ report.score }}
          </p>
          <p class="text-xs uppercase tracking-[0.18em] text-muted">
            health score
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <UAlert
        v-if="props.loading"
        color="neutral"
        variant="soft"
        icon="i-lucide-loader-circle"
        title="Refreshing QA"
        description="Loading the latest report for this palette."
      />

      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-muted">
          <span>Theme health</span>
          <span>{{ report.score }}/100</span>
        </div>
        <UProgress :model-value="report.score" :color="statusMeta.color" status />
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-error/20 bg-error/5 px-3 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Critical</p>
          <p class="mt-1 text-lg font-semibold text-highlighted">{{ report.counts.critical }}</p>
        </div>

        <div class="rounded-xl border border-warning/20 bg-warning/5 px-3 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Warnings</p>
          <p class="mt-1 text-lg font-semibold text-highlighted">{{ report.counts.warning }}</p>
        </div>

        <div class="rounded-xl border border-default/60 bg-muted/20 px-3 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Readiness</p>
          <p class="mt-1 text-lg font-semibold text-highlighted">
            {{ report.readiness.filter(item => item.passed).length }}/{{ report.readiness.length }}
          </p>
        </div>
      </div>

      <div
        v-if="!compact"
        class="grid gap-2 md:grid-cols-2"
      >
        <div
          v-for="item in report.readiness"
          :key="item.id"
          class="rounded-xl border px-3 py-3"
          :class="item.passed ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5'"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-highlighted">
                {{ item.label }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ item.description }}
              </p>
            </div>

            <UBadge :color="item.passed ? 'success' : 'warning'" variant="soft">
              {{ item.passed ? 'Pass' : 'Review' }}
            </UBadge>
          </div>
        </div>
      </div>

      <div
        v-if="topIssues.length"
        class="space-y-2"
      >
        <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          {{ compact ? 'Top risks' : 'Issues to review' }}
        </p>

        <div
          v-for="issue in topIssues"
          :key="issue.id"
          class="rounded-xl border border-default/60 bg-muted/15 px-3 py-3"
        >
          <div class="flex flex-wrap items-center gap-2">
            <UBadge :color="getSeverityColor(issue.severity)" variant="soft">
              {{ issue.severity }}
            </UBadge>
            <UBadge color="neutral" variant="outline">
              {{ issue.mode }}
            </UBadge>
            <p class="text-sm font-medium text-highlighted">
              {{ issue.title }}
            </p>
          </div>

          <p class="mt-2 text-sm text-muted">
            {{ issue.description }}
          </p>

          <div class="mt-2 flex flex-wrap gap-2">
            <UBadge
              v-for="token in issue.tokens"
              :key="token"
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ token }}
            </UBadge>
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-xl border border-success/20 bg-success/5 px-4 py-4 text-sm text-muted"
      >
        No issues were flagged by the current automated checks.
      </div>
    </div>
  </UCard>
</template>
