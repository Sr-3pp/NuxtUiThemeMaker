import type { TableRow } from '@nuxt/ui/components/Table.vue'

export interface TableCellContext<T> {
  row: TableRow<T>
}

export interface DropdownMenuItem {
  label?: string
  icon?: string
  type?: 'label'
  disabled?: boolean
  onSelect?: () => void | Promise<void>
}

export interface NavigationMenuItem {
  label: string
  icon?: string
  onSelect?: () => void | Promise<void>
}
