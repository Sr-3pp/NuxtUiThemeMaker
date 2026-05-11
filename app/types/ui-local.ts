import type { TableRow } from '@nuxt/ui/components/Table.vue'

export interface TableCellContext<T> {
  row: TableRow<T>
}

export interface DropdownMenuItem {
  label?: string
  icon?: string
  type?: 'label'
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  kbds?: string[]
  disabled?: boolean
  to?: string
  href?: string
  onSelect?: () => void | Promise<void>
}

export interface NavigationMenuItem {
  label: string
  icon?: string
  description?: string
  badge?: string
  defaultOpen?: boolean
  children?: NavigationMenuItem[]
  onSelect?: () => void | Promise<void>
}
