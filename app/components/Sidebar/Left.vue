<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '~/types/ui-local'
import { getPreviewAreaDefinition } from '~/utils/preview-areas'

const {
  open: openOwnPalettesModal,
  close: closeOwnPalettes,
} = useModal('own-palettes')
const {
  open: openDefaultPresetsModal,
  close: closeDefaultPresets,
} = useModal('default-presets')
const {
  open: openCommunityPalettesModal,
  close: closeCommunityPalettes,
} = useModal('community-palettes')

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
const { selectedArea, areaOptions, activeArea } = usePreviewAreaState()

const { palettesSidebarSw, closePalettesSidebar } = useSidebar()

function toggleSidebar() {
  palettesSidebarSw.value = !palettesSidebarSw.value
}

function closePaletteDrawers() {
  closeOwnPalettes()
  closeDefaultPresets()
  closeCommunityPalettes()
}

function isMobileSidebar() {
  return import.meta.client && window.matchMedia('(max-width: 639px)').matches
}

async function openPaletteDrawer(openDrawer: () => void) {
  closePaletteDrawers()

  if (isMobileSidebar()) {
    closePalettesSidebar()
    await nextTick()
  }

  openDrawer()
}

async function openOwnPalettes() {
  await openPaletteDrawer(openOwnPalettesModal)
}

async function openDefaultPresets() {
  await openPaletteDrawer(openDefaultPresetsModal)
}

async function openCommunityPalettes() {
  await openPaletteDrawer(openCommunityPalettesModal)
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
        onSelect: () => {
          void navigateTo('/workspace')
        }
      },
      {
        label: 'Panel',
        icon: 'i-lucide-inbox',
        onSelect: () => {
          void navigateTo('/panel')
        }
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
    onSelect: () => {
      void navigateTo('/workspace')
    }
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

const activeAreaDefinition = computed(() => {
  return activeArea.value ? getPreviewAreaDefinition(activeArea.value.value) : null
})

const previewBrowserItems = computed<NavigationMenuItem[]>(() => {
  const componentItems = areaOptions.value.map((option) => {
    const definition = getPreviewAreaDefinition(option.value)

    return {
      label: definition?.components.join(', ') ?? option.label,
      icon: selectedArea.value === option.value ? 'i-lucide-check' : 'i-lucide-component',
      description: definition?.description,
      onSelect: () => {
        selectedArea.value = option.value
      },
    } satisfies NavigationMenuItem
  })

  return [{
    label: 'Preview components',
    icon: 'i-lucide-panels-top-left',
    defaultOpen: true,
    children: componentItems,
  }]
})
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
        :key="`preview-${state}`"
        :items="[
          {
            ...previewBrowserItems[0],
            children: state === 'expanded' ? (previewBrowserItems[0]?.children ?? []) : []
          }
        ]"
        orientation="vertical"
        :ui="{ link: 'overflow-hidden' }"
      />

      <div
        v-if="state === 'expanded' && activeAreaDefinition"
        class="rounded-xl border border-default/60 bg-muted/20 px-3 py-3 text-xs text-muted"
      >
        {{ activeAreaDefinition.description }}
      </div>

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
