export const panelSectionItems = [
  {
    label: 'Overview',
    title: 'Admin Panel',
    description: 'Manage the operational areas of the app from one place.',
    icon: 'i-lucide-layout-dashboard',
    to: '/panel',
  },
  {
    label: 'Users',
    title: 'Users',
    description: 'Manage accounts, admin access, and password resets.',
    icon: 'i-lucide-users',
    to: '/panel/users',
  },
  {
    label: 'Palettes',
    title: 'Palettes',
    description: 'Review saved palettes and moderate visibility or content.',
    icon: 'i-lucide-palette',
    to: '/panel/palettes',
  },
  {
    label: 'Emails',
    title: 'Emails',
    description: 'Send test registration and purchase confirmation emails.',
    icon: 'i-lucide-mail',
    to: '/panel/emails',
  },
] as const

export const panelExitItems = [
  {
    label: 'Homepage',
    icon: 'i-lucide-house',
    to: '/',
  },
  {
    label: 'Editor',
    icon: 'i-lucide-pencil-ruler',
    to: '/editor',
  },
] as const
