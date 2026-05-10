<script setup lang="ts">
import type { DropdownMenuItem } from '~/types/ui-local'

const { signOut, user } = useAuth()
const { open: openContributeModal } = useModal('contribute')

const publicItems: DropdownMenuItem[] = [
  {
    label: 'Nuxt themes',
    icon: 'i-lucide-layers',
    to: '/nuxt-themes',
  },
  {
    label: 'Contribute',
    icon: 'i-lucide-git-pull-request',
    onSelect: openContributeModal,
  },
  {
    label: 'Pricing',
    icon: 'i-lucide-credit-card',
    to: '/pricing',
  },
]

const guestItems: DropdownMenuItem[][] = [
  [
    {
      label: 'Sign in',
      icon: 'i-lucide-log-in',
      to: '/login',
    },
    {
      label: 'Register',
      icon: 'i-lucide-user-plus',
      to: '/register',
    },
  ],
]

const authItems = computed<DropdownMenuItem[][]>(() => {
  if (!user.value) {
    return []
  }

  const items: DropdownMenuItem[][] = [
    [
      {
        label: user.value.name || user.value.email,
        type: 'label',
      },
    ],
    [
      {
        label: 'Workspace',
        icon: 'i-lucide-briefcase',
        to: '/workspace',
      },
      {
        label: 'Editor',
        icon: 'i-lucide-pencil-ruler',
        to: '/editor',
      },
      {
        label: 'Pricing',
        icon: 'i-lucide-credit-card',
        to: '/pricing',
      },
    ],
  ]

  if (user.value.isAdmin && items[1]) {
    items[1].push({
      label: 'Panel',
      icon: 'i-lucide-shield',
      to: '/panel',
    })
  }

  items.push([
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      onSelect: async () => {
        await signOut()
        await navigateTo('/')
      },
    },
  ])

  return items
})

const mobileMenuItems = computed<DropdownMenuItem[][]>(() => {
  const items: DropdownMenuItem[][] = [publicItems]

  if (user.value) {
    const accountItems: DropdownMenuItem[] = [
      {
        label: 'Workspace',
        icon: 'i-lucide-briefcase',
        to: '/workspace',
      },
    ]

    if (user.value.isAdmin) {
      accountItems.push({
        label: 'Panel',
        icon: 'i-lucide-shield',
        to: '/panel',
      })
    }

    items.push(accountItems)
    items.push(...authItems.value.slice(-1))
    return items
  }

  items.push(...guestItems)
  return items
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-default bg-default/90 backdrop-blur">
    <UContainer class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:py-4">
      <NuxtLink to="/" class="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
        <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-inverted">
          <UIcon name="i-lucide-palette" class="size-4" />
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-highlighted sm:text-base">
            Nuxt UI Theme Builder
          </p>
          <p class="hidden text-xs text-muted sm:block">
            Generate, preview, export, and share Nuxt UI themes.
          </p>
        </div>
      </NuxtLink>

      <div class="flex shrink-0 items-center gap-1.5 lg:hidden">
        <UButton
          color="primary"
          variant="soft"
          to="/editor?source=landing"
          icon="i-lucide-pencil-ruler"
          aria-label="Open editor"
          class="shrink-0"
        />
        <UColorModeSwitch />
        <UDropdownMenu
          :items="mobileMenuItems"
          :content="{ align: 'end' }"
          :ui="{ content: 'min-w-48 bg-elevated shadow-lg ring ring-default' }"
        >
          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="outline"
            aria-label="Open navigation menu"
            class="data-[state=open]:bg-elevated"
          />
        </UDropdownMenu>
      </div>

      <nav class="hidden items-center gap-2 lg:flex lg:justify-end">
        <UButton color="neutral" variant="ghost" to="/nuxt-themes">
          Nuxt themes
        </UButton>
        <UButton color="neutral" variant="ghost" @click="openContributeModal">
          Contribute
        </UButton>
        <UButton color="neutral" variant="ghost" to="/pricing">
          Pricing
        </UButton>
        <UButton color="primary" variant="soft" to="/editor" icon="i-lucide-pencil-ruler">
          Open editor
        </UButton>

        <template v-if="user">
          <UButton color="neutral" variant="ghost" to="/workspace">
            Workspace
          </UButton>
          <UDropdownMenu
            :items="authItems"
            :content="{ align: 'end' }"
            :ui="{ content: 'min-w-48' }"
          >
            <UButton
              :label="user.name || user.email"
              icon="i-lucide-circle-user"
              trailing-icon="i-lucide-chevron-down"
              color="neutral"
              variant="ghost"
              class="max-w-52 data-[state=open]:bg-elevated"
            />
          </UDropdownMenu>
        </template>

        <UDropdownMenu
          v-else
          :items="guestItems"
          :content="{ align: 'end' }"
          :ui="{ content: 'min-w-44' }"
        >
          <UButton
            label="Account"
            icon="i-lucide-circle-user"
            trailing-icon="i-lucide-chevron-down"
            color="neutral"
            variant="outline"
            class="data-[state=open]:bg-elevated"
          />
        </UDropdownMenu>

        <UColorModeSwitch />
      </nav>
    </UContainer>
  </header>
</template>
