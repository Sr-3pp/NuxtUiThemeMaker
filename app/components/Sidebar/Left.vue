<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui';

const {
  openOwnPalettes, 
  openDefaultPresets, 
  openCommunityPalettes
} = useDrawers()

const { currentPalette, resetCurrentPalette, setCurrentPalette } = usePaletteState()
const importModalOpen = ref(false)
const exportModalOpen = ref(false)

function openExportModal() {
  if (!currentPalette.value) {
    return
  }

  exportModalOpen.value = true
}

function openImportModal() {
  importModalOpen.value = true
}
function handlePaletteImport(palette: Parameters<typeof setCurrentPalette>[0]) {
  setCurrentPalette(palette)
}

const { signOut, user } = useAuth();

const { palettesSidebarSw, togglePalettesSidebar } = useSidebar()

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
    onSelect: () => openExportModal()
  }
]])
</script>


<template>
<UDashboardSidebar v-model:open="palettesSidebarSw" :toggle="false">
      <SidebarImportModal v-model:open="importModalOpen" @import="handlePaletteImport" />
      <SidebarExportModal v-model:open="exportModalOpen" :palette="currentPalette" />
      <template #header>
        <UButton 
            @click="togglePalettesSidebar()"
            variant="ghost"
            class="sm:hidden"
        >
          <UIcon name="i-lucide-x" />
        </UButton>
        <UIcon name="i-lucide:layout-list" />
        <p class="font-medium">
          Palettes
        </p>
      </template>

      <UNavigationMenu
        :items="palettesItems[0]"
        orientation="vertical"
      />

      <UNavigationMenu
        :items="palettesItems[1]"
        orientation="vertical"
        class="mt-auto"
      />

      <template #footer>
        <UDropdownMenu
          v-if="user"
          :items="authItems"
          :ui="{
            content: 'w-48'
          }"
        >
          <UButton class="w-full" icon="i-lucide-circle-user" color="neutral" variant="outline">
            <span class="flex min-w-0 flex-col items-start text-left">
              <span class="truncate">{{ user.name }}</span>
              <span class="truncate text-xs text-muted">{{ user.email }}</span>
            </span>
          </UButton>
        </UDropdownMenu>

        <UButton
          v-else
          to="/login"
          class="w-full"
          icon="i-lucide-log-in"
          color="neutral"
          variant="outline"
        >
          Sign in
        </UButton>
      </template>
    </UDashboardSidebar>
</template>
