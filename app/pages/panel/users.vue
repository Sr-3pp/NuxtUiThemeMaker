<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { z } from 'zod'
import type { TableColumn } from '@nuxt/ui/components/Table.vue'
import type { TableCellContext } from '~/types/ui-local'
import type { AdminUserListItem } from '~/types/admin-user'

definePageMeta({
  middleware: ['panel-admin'],
})

const requestFetch = import.meta.server ? useRequestFetch() : $fetch
const toast = useToast()
const { showErrorToast } = useErrorToast()

const { data: users, refresh, status } = await useAsyncData('admin-users', () =>
  requestFetch<AdminUserListItem[]>('/api/admin/users', {
    credentials: 'include',
  }),
)

const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const selectedUser = ref<AdminUserListItem | null>(null)

const editState = reactive({
  name: '',
  email: '',
  isAdmin: false,
  newPassword: '',
  confirmPassword: '',
})

const editSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('A valid email is required'),
  isAdmin: z.boolean(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  confirmPassword: z.string(),
}).superRefine((value, ctx) => {
  if (value.newPassword && value.newPassword !== value.confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    })
  }
})

function formatDate(value: string | null) {
  if (!value) {
    return 'Never'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function openEdit(user: AdminUserListItem) {
  selectedUser.value = user
  editState.name = user.name
  editState.email = user.email
  editState.isAdmin = user.isAdmin
  editState.newPassword = ''
  editState.confirmPassword = ''
  isEditOpen.value = true
}

function openDelete(user: AdminUserListItem) {
  selectedUser.value = user
  isDeleteOpen.value = true
}

function closeEdit() {
  isEditOpen.value = false
  selectedUser.value = null
}

function closeDelete() {
  isDeleteOpen.value = false
  selectedUser.value = null
}

async function submitEdit() {
  if (!selectedUser.value) {
    return
  }

  isSaving.value = true

  try {
    editSchema.parse(editState)

    await requestFetch(`/api/admin/users/${selectedUser.value.id}`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        name: editState.name,
        email: editState.email,
        isAdmin: editState.isAdmin,
        ...(editState.newPassword ? { newPassword: editState.newPassword } : {}),
      },
    })

    toast.add({
      title: 'User updated',
      description: `${editState.email} was updated successfully.`,
      color: 'success',
    })

    await refresh()
    closeEdit()
  }
  catch (error) {
    showErrorToast(error, 'Failed to update user.')
  }
  finally {
    isSaving.value = false
  }
}

async function confirmDelete() {
  if (!selectedUser.value) {
    return
  }

  isDeleting.value = true

  try {
    await requestFetch(`/api/admin/users/${selectedUser.value.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    toast.add({
      title: 'User deleted',
      description: `${selectedUser.value.email} was removed.`,
      color: 'success',
    })

    await refresh()
    closeDelete()
  }
  catch (error) {
    showErrorToast(error, 'Failed to delete user.')
  }
  finally {
    isDeleting.value = false
  }
}

const tableColumns: TableColumn<AdminUserListItem>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'isAdmin',
    header: 'Role',
    cell: ({ row }: TableCellContext<AdminUserListItem>) => {
      const UBadge = resolveComponent('UBadge')

      return h(UBadge, {
        color: row.original.isAdmin ? 'primary' : 'neutral',
        variant: row.original.isAdmin ? 'soft' : 'outline',
        label: row.original.isAdmin ? 'Admin' : 'User',
      })
    },
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ row }: TableCellContext<AdminUserListItem>) => {
      const UBadge = resolveComponent('UBadge')
      const label = row.original.plan === 'free'
        ? 'Free'
        : `${row.original.plan} ${row.original.planInterval ?? ''}`.trim()

      return h(UBadge, {
        color: row.original.plan === 'free' ? 'neutral' : 'success',
        variant: row.original.plan === 'free' ? 'outline' : 'soft',
        label,
      })
    },
  },
  {
    accessorKey: 'aiPaletteGenerationsUsed',
    header: 'AI Uses',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }: TableCellContext<AdminUserListItem>) => formatDate(row.original.createdAt),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: TableCellContext<AdminUserListItem>) => {
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
        Users
      </h1>
      <p class="text-sm text-muted">
        Review accounts, update user details, manage admin access, and reset passwords.
      </p>
    </div>

    <UCard variant="outline">
      <UTable
        :data="users ?? []"
        :columns="tableColumns"
        :loading="status === 'pending'"
      />
    </UCard>

    <UModal
      v-model:open="isEditOpen"
      :title="selectedUser ? `Edit ${selectedUser.email}` : 'Edit user'"
      description="Update profile fields and optionally set a new password."
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="Name" name="name" required>
            <UInput v-model="editState.name" placeholder="Ada Lovelace" />
          </UFormField>

          <UFormField label="Email" name="email" required>
            <UInput v-model="editState.email" type="email" placeholder="you@example.com" />
          </UFormField>

          <div class="flex items-center justify-between rounded-2xl border border-default px-4 py-3">
            <div class="space-y-1">
              <p class="text-sm font-medium text-highlighted">
                Admin access
              </p>
              <p class="text-xs text-muted">
                Grant panel access and unlimited AI generations.
              </p>
            </div>

            <USwitch v-model="editState.isAdmin" />
          </div>

          <UFormField label="New password" name="newPassword">
            <UInput
              v-model="editState.newPassword"
              type="password"
              placeholder="Leave empty to keep the current password"
            />
          </UFormField>

          <UFormField label="Confirm new password" name="confirmPassword">
            <UInput
              v-model="editState.confirmPassword"
              type="password"
              placeholder="Repeat the new password"
            />
          </UFormField>
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
      title="Delete user"
      :description="selectedUser ? `Delete ${selectedUser.email}? This action cannot be undone.` : 'Delete this user?'"
    >
      <template #body>
        <UAlert
          color="error"
          variant="subtle"
          title="Permanent action"
          description="Deleting a user removes their account and Better Auth credentials."
        />
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton color="neutral" variant="outline" :disabled="isDeleting" @click="closeDelete">
            Cancel
          </UButton>
          <UButton color="error" :loading="isDeleting" @click="confirmDelete">
            Delete user
          </UButton>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
