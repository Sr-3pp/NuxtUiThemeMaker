<script setup lang="ts">
import type { PreviewInteractiveProps } from '~/types/theme-preview'

const props = defineProps<PreviewInteractiveProps>()

const tabItems = [
  {
    label: 'Overview',
    value: 'overview',
    content: 'Use overview to compare general hierarchy, active states and text emphasis.'
  },
  {
    label: 'Surfaces',
    value: 'surfaces',
    content: 'Surface checks make container contrast and border visibility obvious.'
  },
  {
    label: 'States',
    value: 'states',
    content: 'State checks focus on selection, active treatments and disabled affordances.'
  }
]

const accordionItems = [
  {
    label: 'Primary accent balance',
    value: 'primary',
    content: 'Primary should feel clearly preferred without overwhelming success, info or warning usage.'
  },
  {
    label: 'Neutral surface balance',
    value: 'neutral',
    content: 'Neutrals carry the majority of the UI, so subtle token differences need to remain legible.'
  },
  {
    label: 'Error escalation',
    value: 'error',
    content: 'Error treatments should be obvious enough for validation and destructive actions.'
  }
]

const navItems = [
  { label: 'Tokens', icon: 'i-lucide-swatch-book', to: '#' },
  { label: 'Components', icon: 'i-lucide-layout-grid', to: '#', badge: '12' },
  {
    label: 'Documentation',
    icon: 'i-lucide-book-open',
    value: 'docs',
    children: [
      { label: 'Forms', description: 'Focus and validation coverage', to: '#' },
      { label: 'Feedback', description: 'Alerts, progress and loading states', to: '#' },
      { label: 'Surfaces', description: 'Cards, panels and elevation layers', to: '#' }
    ]
  }
]

const breadcrumbItems = [
  { label: 'Themes', icon: 'i-lucide-house', to: '#' },
  { label: 'Palette builder', to: '#' },
  { label: 'Preview gallery', to: '#' }
]

const currentPage = ref(3)
const stepperItems = [
  {
    title: 'Foundation',
    description: 'Select semantic accents and neutral scale.',
    icon: 'i-lucide-swatch-book'
  },
  {
    title: 'Components',
    description: 'Review button, form and overlay states.',
    icon: 'i-lucide-layout-grid'
  },
  {
    title: 'Publish',
    description: 'Validate contrast and copy the share URL.',
    icon: 'i-lucide-share-2'
  }
]
const currentStep = ref(2)
</script>

<template>
  <section class="space-y-4">
    <PreviewSectionIntro
      title="Navigation and choice"
      description="Active states, disclosure, pagination and low-level navigation helpers."
    />

    <div class="grid gap-6 xl:grid-cols-2">
      <PreviewCard title="Tabs and accordion">
        <div class="space-y-5">
          <UTabs
            :items="tabItems"
            color="primary"
            variant="pill"
            :content="true"
          />

          <UAccordion
            :items="accordionItems"
            type="multiple"
            :default-value="['primary']"
          />
        </div>
      </PreviewCard>

      <PreviewCard title="Menus, traversal and progress">
        <div class="space-y-5">
          <div class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">Breadcrumb</p>
            <UBreadcrumb :items="breadcrumbItems" />
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">Navigation menu</p>
            <UNavigationMenu
              :items="navItems"
              color="primary"
              variant="pill"
              highlight
              :highlight-color="props.disableInteractive ? 'neutral' : 'primary'"
            />
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">Pagination</p>
              <p class="text-xs text-muted">Page {{ currentPage }} of 8</p>
            </div>
            <UPagination
              v-model:page="currentPage"
              :total="64"
              :items-per-page="8"
              show-edges
              active-color="primary"
              :disabled="props.disableInteractive"
            />
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">Stepper</p>
              <p class="text-xs text-muted">Step {{ currentStep }} of {{ stepperItems.length }}</p>
            </div>
            <UStepper
              v-model="currentStep"
              :items="stepperItems"
              color="primary"
              orientation="vertical"
              :disabled="props.disableInteractive"
            />
          </div>
        </div>
      </PreviewCard>
    </div>
  </section>
</template>
