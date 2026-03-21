<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { z } from 'zod'
import type { AdminPaletteListItem } from '~/types/admin-palette'

definePageMeta({
  middleware: ['panel-admin'],
})

const requestFetch = import.meta.server ? useRequestFetch() : $fetch
const toast = useToast()
const { showErrorToast } = useErrorToast()

const { data: palettes, refresh, status } = await useAsyncData('admin-palettes', () =>
  requestFetch<AdminPaletteListItem[]>('/api/admin/palettes', {
    credentials: 'include',
  }),
)

const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const selectedPalette = ref<AdminPaletteListItem | null>(null)

const editState = reactive({
  name: '',
  isPublic: false,
})

const editSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  isPublic: z.boolean(),
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function openEdit(palette: AdminPaletteListItem) {
  selectedPalette.value = palette
  editState.name = palette.name
  editState.isPublic = palette.isPublic
  isEditOpen.value = true
}

function openDelete(palette: AdminPaletteListItem) {
  selectedPalette.value = palette
  isDeleteOpen.value = true
}

function closeEdit() {
  isEditOpen.value = false
  selectedPalette.value = null
}

function closeDelete() {
  isDeleteOpen.value = false
  selectedPalette.value = null
}

async function submitEdit() {
  if (!selectedPalette.value) {
    return
  }

  isSaving.value = true

  try {
    editSchema.parse(editState)

    await requestFetch(`/api/admin/palettes/${selectedPalette.value.id}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        name: editState.name,
        isPublic: editState.isPublic,
      },
    })

    toast.add({
      title: 'Palette updated',
      description: `${editState.name} was updated successfully.`,
      color: 'success',
    })

    await refresh()
    closeEdit()
  }
  catch (error) {
    showErrorToast(error, 'Failed to update palette.')
  }
  finally {
    isSaving.value = false
  }
}

async function confirmDelete() {
  if (!selectedPalette.value) {
    return
  }

  isDeleting.value = true

  try {
    await requestFetch(`/api/admin/palettes/${selectedPalette.value.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    toast.add({
      title: 'Palette deleted',
      description: `${selectedPalette.value.name} was removed.`,
      color: 'success',
    })

    await refresh()
    closeDelete()
  }
  catch (error) {
    showErrorToast(error, 'Failed to delete palette.')
  }
  finally {
    isDeleting.value = false
  }
}

const tableColumns: TableColumn<AdminPaletteListItem>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
  },
  {
    accessorKey: 'userId',
    header: 'Owner',
  },
  {
    accessorKey: 'isPublic',
    header: 'Visibility',
    cell: ({ row }) => {
      const UBadge = resolveComponent('UBadge')

      return h(UBadge, {
        color: row.original.isPublic ? 'success' : 'neutral',
        variant: row.original.isPublic ? 'soft' : 'outline',
        label: row.original.isPublic ? 'Public' : 'Private',
      })
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const UButton = resolveComponent('UButton')

      return h('div', { class: 'flex items-center justify-end gap-2' }, [
        h(UButton, {
          color: 'neutral',
          variant: 'outline',
          size: 'xs',
          icon: 'i-lucide-pencil',
          onClick: () => openEdit(row.original),
        }, () => 'Edit'),
        h(UButton, {
          color: 'error',
          variant: 'soft',
          size: 'xs',
          icon: 'i-lucide-trash-2',
          onClick: () => openDelete(row.original),
        }, () => 'Delete'),
      ])
    },
  },
]
</script>

<template>
  <UContainer class="space-y-6 py-8">
    <div class="space-y-1">
      <h1 class="text-2xl font-semibold text-highlighted">
        Palettes
      </h1>
      <p class="text-sm text-muted">
        Review saved palettes, update palette metadata, and remove entries when needed.
      </p>
    </div>

    <UCard variant="outline">
      <UTable
        :data="palettes ?? []"
        :columns="tableColumns"
        :loading="status === 'pending'"
      />
    </UCard>

    <UModal
      v-model:open="isEditOpen"
      :title="selectedPalette ? `Edit ${selectedPalette.name}` : 'Edit palette'"
      description="Update palette metadata and visibility."
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="Palette name" name="name" required>
            <UInput v-model="editState.name" placeholder="Palette name" />
          </UFormField>

          <div class="rounded-2xl border border-default px-4 py-3 space-y-1">
            <p class="text-sm font-medium text-highlighted">
              Owner
            </p>
            <p class="text-xs text-muted break-all">
              {{ selectedPalette?.userId }}
            </p>
          </div>

          <div class="flex items-center justify-between rounded-2xl border border-default px-4 py-3">
            <div class="space-y-1">
              <p class="text-sm font-medium text-highlighted">
                Public palette
              </p>
              <p class="text-xs text-muted">
                Public palettes appear in the community library.
              </p>
            </div>

            <USwitch v-model="editState.isPublic" />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton color="neutral" variant="outline" :disabled="isSaving" @click="closeEdit">
            Cancel
          </UButton>
          <UButton color="primary" :loading="isSaving" @click="submitEdit">
            Save changes
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isDeleteOpen"
      title="Delete palette"
      :description="selectedPalette ? `Delete ${selectedPalette.name}? This action cannot be undone.` : 'Delete this palette?'"
    >
      <template #body>
        <UAlert
          color="error"
          variant="subtle"
          title="Permanent action"
          description="Deleting a palette permanently removes it from the application."
        />
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton color="neutral" variant="outline" :disabled="isDeleting" @click="closeDelete">
            Cancel
          </UButton>
          <UButton color="error" :loading="isDeleting" @click="confirmDelete">
            Delete palette
          </UButton>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
