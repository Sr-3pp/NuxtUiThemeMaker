<script setup lang="ts">
import type { AppNavigationEmits, AppNavigationProps } from '~/types/navigation'

const props = defineProps<AppNavigationProps>()

const emit = defineEmits<AppNavigationEmits>()

const accountItems = computed(() => {
  const summaryItems: Array<Record<string, unknown>> = [
    {
      label: props.isAuthenticated ? props.sessionEmail ?? 'Signed in' : 'Guest session',
      icon: props.isAuthenticated ? 'i-lucide-user' : 'i-lucide-user-round-plus',
      type: 'label'
    }
  ]
  const items: Array<Array<Record<string, unknown>>> = [summaryItems]

  if (props.activeOwnedPaletteSlug) {
    summaryItems.push({
      label: `Active palette: ${props.activeOwnedPaletteSlug}`,
      icon: 'i-lucide-swatch-book',
      disabled: true
    })
  }

  if (!props.isAuthenticated) {
    items.push([
      {
        label: 'Sign in',
        icon: 'i-lucide-log-in',
        onSelect: () => navigateTo('/login?redirect=%2F')
      },
      {
        label: 'Sign up',
        icon: 'i-lucide-user-plus',
        onSelect: () => navigateTo('/register?redirect=%2F')
      }
    ])

    return items
  }

  if (props.activeOwnedPaletteSlug) {
    items.push([
      {
        label: props.activeOwnedPalettePublic ? 'Make Private' : 'Make Public',
        icon: props.activeOwnedPalettePublic ? 'i-lucide-lock' : 'i-lucide-globe',
        disabled: props.isWorking,
        onSelect: () => emit('persistVisibility', !props.activeOwnedPalettePublic)
      },
      {
        label: 'Copy Share URL',
        icon: 'i-lucide-link',
        disabled: props.isWorking || !props.activeOwnedPalettePublic,
        onSelect: () => emit('copyShareUrl')
      },
      {
        label: 'Delete Palette',
        icon: 'i-lucide-trash-2',
        color: 'error',
        disabled: props.isWorking,
        onSelect: () => emit('deletePalette')
      }
    ])
  }

  items.push([
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      disabled: props.isWorking,
      onSelect: () => emit('signOut')
    }
  ])

  return items
})
</script>

<template>
    <header class="border-b border-white/10 bg-black/95 fixed w-full top-0 z-10">
        <div class="flex flex-col gap-4 px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4cd964] text-black shadow-[0_10px_30px_rgba(76,217,100,0.35)]">
              <UIcon name="i-lucide-palette" class="h-5 w-5" />
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <p class="font-semibold text-white">
                  Nuxt UI Theme Builder
                </p>
                <span class="hidden text-white/20 md:inline">|</span>
                <p class="text-white/55">
                  Palette:
                  <span class="ml-1 font-medium text-white">{{ currentEditablePalette.name }}</span>
                </p>
                <UBadge :color="currentPalette ? 'primary' : 'neutral'" :variant="currentPalette ? 'soft' : 'outline'">
                  {{ currentPaletteStatus }}
                </UBadge>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-sun-medium" class="h-4 w-4" />
                <span class="capitalize">{{ currentMode }}</span>
              </div>
            </div>

            <UColorModeSwitch />

            <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-hand" class="h-4 w-4" />
                <span>{{ disableInteractivePreviews ? 'Disable component states' : 'Enable component states' }}</span>
              </div>
              <USwitch
                :model-value="disableInteractivePreviews"
                size="sm"
                color="neutral"
                @update:model-value="$emit('toggleInteractivePreviews', $event)"
              />
            </div>

            <UButton color="neutral" variant="ghost" class="text-white/80 hover:text-white" @click="$emit('resetCurrentPalette')">
              <UIcon name="i-lucide-rotate-ccw" class="h-4 w-4" />
              Reset
            </UButton>

            <UButton color="neutral" variant="ghost" class="text-white/80 hover:text-white" @click="$emit('openPaletteImport')">
              <UIcon name="i-lucide-import" class="h-4 w-4" />
              Import
            </UButton>

            <UButton color="neutral" variant="ghost" class="text-white/80 hover:text-white" @click="$emit('openTokensEditor')">
              <UIcon name="i-lucide-sliders-horizontal" class="h-4 w-4" />
              Tokens
            </UButton>

            <UButton color="primary" class="bg-[#4cd964] text-black hover:bg-[#65e27c]" @click="$emit('openExport')">
              <UIcon name="i-lucide-download" class="h-4 w-4" />
              Export
            </UButton>

            <UDropdownMenu :items="accountItems">
              <UButton color="neutral" variant="outline" trailing-icon="i-lucide-chevron-down" class="border-white/10 bg-white/5 text-white/90 hover:bg-white/10">
                <UIcon name="i-lucide-circle-user-round" class="h-4 w-4" />
                {{ isAuthenticated ? (sessionEmail ?? 'Account') : 'Account' }}
              </UButton>
            </UDropdownMenu>
          </div>
        </div>
      </header>
</template>
