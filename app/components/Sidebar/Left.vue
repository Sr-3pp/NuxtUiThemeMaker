<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui';

const {
  openOwnPalettes, 
  openDefaultPresets, 
  openCommunityPalettes
} = useDrawers()


const authItems = ref<DropdownMenuItem[][]>([
  [
    {
      label: 'Benjamin',
      avatar: {
        src: 'https://github.com/benjamincanac.png',
        loading: 'lazy'
      },
      type: 'label'
    }
  ],
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user'
    },
    {
      label: 'Billing',
      icon: 'i-lucide-credit-card'
    },
    {
      label: 'Settings',
      icon: 'i-lucide-cog',
      kbds: [',']
    },
    {
      label: 'Keyboard shortcuts',
      icon: 'i-lucide-monitor'
    }
  ],
  [
    {
      label: 'Team',
      icon: 'i-lucide-users'
    },
    {
      label: 'Invite users',
      icon: 'i-lucide-user-plus',
      children: [
        [
          {
            label: 'Email',
            icon: 'i-lucide-mail'
          },
          {
            label: 'Message',
            icon: 'i-lucide-message-square'
          }
        ],
        [
          {
            label: 'More',
            icon: 'i-lucide-circle-plus',
            children: [
              {
                label: 'Import from Slack',
                icon: 'i-simple-icons-slack',
                to: 'https://slack.com',
                target: '_blank'
              },
              {
                label: 'Import from Trello',
                icon: 'i-simple-icons-trello'
              },
              {
                label: 'Import from Asana',
                icon: 'i-simple-icons-asana'
              }
            ]
          }
        ]
      ]
    },
    {
      label: 'New team',
      icon: 'i-lucide-plus',
      kbds: ['meta', 'n']
    }
  ],
  [
    {
      label: 'GitHub',
      icon: 'i-simple-icons-github',
      to: 'https://github.com/nuxt/ui',
      target: '_blank'
    },
    {
      label: 'Support',
      icon: 'i-lucide-life-buoy',
      to: '/docs/components/dropdown-menu'
    },
    {
      label: 'API',
      icon: 'i-lucide-cloud',
      disabled: true
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      kbds: ['shift', 'meta', 'q']
    }
  ]
])

const { user } = useAuth();

const { palettesSidebarSw, togglePalettesSidebar } = useSidebar()

const palettesItems = computed<NavigationMenuItem[][]>(() => [[
  ...(user.value ? [{
    label: 'My Palettes',
    icon: 'i-lucide-inbox',
    onSelect: () => openOwnPalettes()
  }] : []),
  {
    label: 'Default Pressets',
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
    onSelect: () => console.log('open Reset modal')
  },
  {
    label: 'Import',
    icon: 'i-lucide-file-input',
    onSelect: () => console.log('open Import modal')
  }, 
  {
    label: 'Export',
    icon: 'i-lucide-file-output',
    onSelect: () => console.log('open Export modal')
  }
]])
</script>


<template>
<UDashboardSidebar v-model:open="palettesSidebarSw" :toggle="false">
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
            <p>
              {{ user.name }}
              <small>{{ user.email }}</small>
            </p>
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
