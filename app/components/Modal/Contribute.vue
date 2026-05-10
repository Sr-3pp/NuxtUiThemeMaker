<script setup lang="ts">
const repositoryUrl = 'https://github.com/Sr-3pp/NuxtUiThemeMaker'
const route = useRoute()
const router = useRouter()
const { isOpen } = useModal('contribute')

const contributionActions = [
  {
    title: 'Open an issue',
    description: 'Report bugs, propose Nuxt UI theme workflows, or request export formats that would help real projects.',
    icon: 'i-lucide-circle-dot',
    label: 'Create issue',
    to: `${repositoryUrl}/issues/new`,
  },
  {
    title: 'Send a pull request',
    description: 'Improve previews, palette QA, AI generation, exports, documentation, or developer experience.',
    icon: 'i-lucide-git-pull-request',
    label: 'Open pull requests',
    to: `${repositoryUrl}/pulls`,
  },
]

const contributionAreas = [
  'Nuxt UI component coverage',
  'Theme export formats',
  'Accessibility and contrast QA',
  'AI palette generation prompts',
  'Documentation and examples',
]

watch(() => route.hash, async (hash) => {
  if (!import.meta.client || hash !== '#contribute') {
    return
  }

  isOpen.value = true
  await router.replace({ path: route.path, query: route.query, hash: '' })
}, { immediate: true })
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Contribute to Nuxt UI Theme Builder"
    description="Developers can contribute through GitHub issues and pull requests."
    :ui="{ content: 'sm:max-w-3xl' }"
  >
    <template #body>
      <div class="space-y-6">
        <div class="rounded-lg border border-default bg-muted p-4">
          <p class="text-sm leading-relaxed text-muted">
            Useful contributions include bug reports, theme examples, export improvements, accessibility fixes, and Nuxt UI component coverage.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <UCard
            v-for="action in contributionActions"
            :key="action.title"
            class="border-default bg-default"
          >
            <div class="flex h-full flex-col gap-5">
              <div class="flex items-start gap-4">
                <span class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UIcon :name="action.icon" class="size-5" />
                </span>
                <div class="space-y-2">
                  <p class="text-lg font-semibold text-highlighted">
                    {{ action.title }}
                  </p>
                  <p class="text-sm leading-relaxed text-muted">
                    {{ action.description }}
                  </p>
                </div>
              </div>

              <UButton
                :to="action.to"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                variant="soft"
                trailing-icon="i-lucide-external-link"
                class="mt-auto w-max"
              >
                {{ action.label }}
              </UButton>
            </div>
          </UCard>
        </div>

        <div class="space-y-3">
          <p class="text-sm font-semibold text-highlighted">
            Good contribution areas
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="area in contributionAreas"
              :key="area"
              color="neutral"
              variant="soft"
              size="lg"
            >
              {{ area }}
            </UBadge>
          </div>
        </div>

        <UButton
          :to="repositoryUrl"
          target="_blank"
          rel="noopener noreferrer"
          color="neutral"
          variant="outline"
          icon="i-lucide-github"
          trailing-icon="i-lucide-external-link"
        >
          View repository
        </UButton>
      </div>
    </template>
  </UModal>
</template>
