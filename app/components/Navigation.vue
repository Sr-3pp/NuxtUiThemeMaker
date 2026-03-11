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
  <UDashboardGroup :ui="{ base: 'contents' }">
    <UDashboardSidebar
      :toggle="false"
      mode="slideover"
      :ui="{
        root: '!hidden',
        content: 'lg:hidden max-w-[88vw] border-white/10 bg-black/95',
        overlay: 'lg:hidden bg-black/70 backdrop-blur-sm',
        body: 'space-y-5 px-4 py-4 sm:px-5',
        header: 'border-b border-white/10 px-4 py-3 sm:px-5',
        footer: 'border-t border-white/10 px-4 py-3 sm:px-5'
      }"
    >
      <template #header>
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4cd964] text-black shadow-[0_10px_30px_rgba(76,217,100,0.35)]">
            <UIcon name="i-lucide-palette" class="h-5 w-5" />
          </div>

          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-white">
              Nuxt UI Theme Builder
            </p>
            <p class="truncate text-xs text-white/55">
              {{ currentEditablePalette.name }}
            </p>
          </div>
        </div>
      </template>

      <template #default>
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-sun-medium" class="h-4 w-4" />
              <span class="capitalize">{{ currentMode }}</span>
            </div>
            <UColorModeSwitch />
          </div>

          <div class="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            <div class="min-w-0 flex items-center gap-2">
              <UIcon name="i-lucide-hand" class="h-4 w-4 shrink-0" />
              <span class="truncate">{{ disableInteractivePreviews ? 'Disable component states' : 'Enable component states' }}</span>
            </div>
            <USwitch
              :model-value="disableInteractivePreviews"
              size="sm"
              color="neutral"
              @update:model-value="$emit('toggleInteractivePreviews', $event)"
            />
          </div>
        </div>

        <div class="grid gap-2">
          <UButton color="neutral" variant="ghost" block class="justify-start text-white/80 hover:text-white" @click="$emit('resetCurrentPalette')">
            <UIcon name="i-lucide-rotate-ccw" class="h-4 w-4" />
            Reset
          </UButton>

          <UButton color="neutral" variant="ghost" block class="justify-start text-white/80 hover:text-white" @click="$emit('openPaletteImport')">
            <UIcon name="i-lucide-import" class="h-4 w-4" />
            Import
          </UButton>

          <UButton color="neutral" variant="ghost" block class="justify-start text-white/80 hover:text-white" @click="$emit('openTokensEditor')">
            <UIcon name="i-lucide-sliders-horizontal" class="h-4 w-4" />
            Tokens
          </UButton>

          <UButton color="primary" block class="justify-start bg-[#4cd964] text-black hover:bg-[#65e27c]" @click="$emit('openExport')">
            <UIcon name="i-lucide-download" class="h-4 w-4" />
            Export
          </UButton>
        </div>
      </template>

      <template #footer>
        <UDropdownMenu :items="accountItems">
          <UButton color="neutral" variant="outline" block trailing-icon="i-lucide-chevron-down" class="justify-between border-white/10 bg-white/5 text-white/90 hover:bg-white/10">
            <span class="flex min-w-0 items-center gap-2">
              <UIcon name="i-lucide-circle-user-round" class="h-4 w-4 shrink-0" />
              <span class="truncate">{{ isAuthenticated ? (sessionEmail ?? 'Account') : 'Account' }}</span>
            </span>
          </UButton>
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <UDashboardNavbar
      :toggle="false"
      :ui="{
        root: 'fixed inset-x-0 top-0 z-10 !h-auto min-h-16 items-start gap-4 border-white/10 bg-black/95 px-4 py-3 xl:items-center',
        left: 'min-w-0 flex-1 flex-wrap items-center gap-3 w-full',
        title: 'hidden',
        right: 'flex-1 flex-wrap items-center justify-end gap-2 hidden sm:flex'
      }"
    >
      <template #left>
        <UDashboardSidebarToggle class="lg:hidden" />

        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4cd964] text-black shadow-[0_10px_30px_rgba(76,217,100,0.35)]">
          <UIcon name="i-lucide-palette" class="h-5 w-5" />
        </div>

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <p class="font-semibold text-white">
              Nuxt UI Theme Builder
            </p>
            <span class="hidden text-white/20 lg:inline">|</span>
            <p class="hidden text-white/55 sm:block">
              Palette:
              <span class="ml-1 font-medium text-white">{{ currentEditablePalette.name }}</span>
            </p>
            <UBadge :color="currentPalette ? 'primary' : 'neutral'" :variant="currentPalette ? 'soft' : 'outline'" class="hidden sm:inline-flex">
              {{ currentPaletteStatus }}
            </UBadge>
          </div>
          <p class="mt-1 truncate text-xs text-white/55 sm:hidden">
            {{ currentEditablePalette.name }}
          </p>
        </div>
      </template>

      <template #right>
        <div class="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 lg:block">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-sun-medium" class="h-4 w-4" />
            <span class="capitalize">{{ currentMode }}</span>
          </div>
        </div>

        <UColorModeSwitch class="hidden lg:inline-flex" />

        <div class="hidden items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 lg:flex">
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

        <UButton color="neutral" variant="ghost" class="hidden text-white/80 hover:text-white lg:inline-flex" @click="$emit('resetCurrentPalette')">
          <UIcon name="i-lucide-rotate-ccw" class="h-4 w-4" />
          Reset
        </UButton>

        <UButton color="neutral" variant="ghost" class="hidden text-white/80 hover:text-white lg:inline-flex" @click="$emit('openPaletteImport')">
          <UIcon name="i-lucide-import" class="h-4 w-4" />
          Import
        </UButton>

        <UButton color="neutral" variant="ghost" class="hidden text-white/80 hover:text-white lg:inline-flex" @click="$emit('openTokensEditor')">
          <UIcon name="i-lucide-sliders-horizontal" class="h-4 w-4" />
          Tokens
        </UButton>

        <UButton color="primary" class="hidden bg-[#4cd964] text-black hover:bg-[#65e27c] lg:inline-flex" @click="$emit('openExport')">
          <UIcon name="i-lucide-download" class="h-4 w-4" />
          Export
        </UButton>

        <UDropdownMenu :items="accountItems">
          <UButton color="neutral" variant="outline" trailing-icon="i-lucide-chevron-down" class="hidden border-white/10 bg-white/5 text-white/90 hover:bg-white/10 lg:inline-flex">
            <UIcon name="i-lucide-circle-user-round" class="h-4 w-4" />
            {{ isAuthenticated ? (sessionEmail ?? 'Account') : 'Account' }}
          </UButton>
        </UDropdownMenu>
      </template>
    </UDashboardNavbar>
  </UDashboardGroup>
</template>
