<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '~/types/ui-local'

const {
  openOwnPalettes,
  openDefaultPresets,
  openCommunityPalettes
} = useDrawers()

const { currentPalette, resetCurrentPalette } = usePaletteState()
const { open: openImportModal } = useModal('import-palette')
const { open: openExportModal } = useModal('export-palette')

function handleExportOpen() {
  if (!currentPalette.value) {
    return
  }

  openExportModal()
}

const { signOut, user } = useAuth()

const { palettesSidebarSw } = useSidebar()

function toggleSidebar() {
  palettesSidebarSw.value = !palettesSidebarSw.value
}

const authItems = computed<DropdownMenuItem[][]>(() => {
  if (!user.value) {
    return []
  }

  return [
    [
      {
        label: user.value.name || user.value.email,
        type: 'label'
      }
    ],
    [
      {
        label: 'My Palettes',
        icon: 'i-lucide-inbox',
        onSelect: () => openOwnPalettes()
      },
      {
        label: 'Workspace',
        icon: 'i-lucide-briefcase',
        onSelect: () => navigateTo('/workspace')
      },
      {
        label: 'Panel',
        icon: 'i-lucide-inbox',
        onSelect: () => navigateTo('/panel')
      }
    ],
    [
      {
        label: 'Sign out',
        icon: 'i-lucide-log-out',
        onSelect: async () => {
          await signOut()
          await navigateTo('/')
        }
      }
    ]
  ]
})

const palettesItems = computed<NavigationMenuItem[][]>(() => [[
  ...(user.value ? [{
    label: 'My Palettes',
    icon: 'i-lucide-inbox',
    onSelect: () => openOwnPalettes()
  }, {
    label: 'Workspace',
    icon: 'i-lucide-briefcase',
    onSelect: () => navigateTo('/workspace')
  }] : []),
  {
    label: 'Default Presets',
    icon: 'i-lucide-layout-template',
    onSelect: () => openDefaultPresets()
  },
  {
    label: 'Community Palettes',
    icon: 'i-lucide-globe',
    onSelect: () => openCommunityPalettes()
  }
], [
  {
    label: 'Reset',
    icon: 'i-lucide-rotate-ccw',
    onSelect: () => resetCurrentPalette()
  },
  {
    label: 'Import',
    icon: 'i-lucide-file-input',
    onSelect: () => openImportModal()
  },
  {
    label: 'Export',
    icon: 'i-lucide-file-output',
    onSelect: () => handleExportOpen()
  }
]])
</script>


<template>
  <USidebar
    v-model:open="palettesSidebarSw"
    collapsible="icon"
    rail
    :close="false"
    :ui="{
      container: 'h-full',
      inner: 'bg-default/95 backdrop-blur supports-[backdrop-filter]:bg-default/85',
      body: 'gap-3 p-3',
      header: 'min-h-(--ui-header-height) px-3',
      footer: 'p-3',
    }"
  >
    <template #header="{ state, close }">
      <UButton
        variant="ghost"
        class="sm:hidden"
        square
        @click="close"
      >
        <UIcon name="i-lucide-x" />
      </UButton>

      <div class="flex min-w-0 items-center gap-2 overflow-hidden">
        <UButton
          color="primary"
          variant="soft"
          square
          class="shrink-0"
          :aria-label="state === 'collapsed' ? 'Expand palettes sidebar' : 'Collapse palettes sidebar'"
          @click="toggleSidebar"
        >
          <UIcon name="i-lucide-layout-list" class="size-4" />
        </UButton>

        <div v-if="state === 'expanded'" class="min-w-0">
          <p class="truncate font-medium text-highlighted">
            Palettes
          </p>
          <p class="truncate text-xs text-muted">
            Browse, import, and export themes
          </p>
        </div>
      </div>
    </template>

    <template #default="{ state }">
      <UNavigationMenu
        :key="`library-${state}`"
        :items="palettesItems[0]"
        orientation="vertical"
        :ui="{ link: 'overflow-hidden' }"
      />

      <UNavigationMenu
        :key="`actions-${state}`"
        :items="palettesItems[1]"
        orientation="vertical"
        class="mt-auto"
        :ui="{ link: 'overflow-hidden' }"
      />
    </template>

    <template #footer="{ state }">
      <UDropdownMenu
        v-if="user"
        :items="authItems"
        :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) min-w-48' }"
      >
        <UButton
          :label="user.name || user.email"
          icon="i-lucide-circle-user"
          trailing-icon="i-lucide-chevrons-up-down"
          color="neutral"
          variant="ghost"
          square
          class="w-full overflow-hidden data-[state=open]:bg-elevated"
          :ui="{ trailingIcon: 'text-dimmed ms-auto' }"
        />
      </UDropdownMenu>

      <UButton
        v-else
        to="/login"
        class="w-full overflow-hidden"
        icon="i-lucide-log-in"
        color="neutral"
        variant="outline"
        :square="state === 'collapsed'"
      >
        <span v-if="state === 'expanded'">
          Sign in
        </span>
      </UButton>
    </template>
  </USidebar>
</template>
