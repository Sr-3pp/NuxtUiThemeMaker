<script setup lang="ts">
const {
  sharePaletteTarget,
  shareEmail,
  isSharing,
  isUnsharing,
  isOpen,
  handlePaletteShareSubmit,
  handlePaletteUnshare,
} = usePaletteShareModal()
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="sharePaletteTarget ? `Share ${sharePaletteTarget.name}` : 'Share palette'"
    description="Invite a registered user by email to access and edit this private palette."
  >
    <template #body>
      <div class="space-y-4">
        <UFormField label="Collaborator email" name="share-email">
          <UInput
            v-model="shareEmail"
            placeholder="designer@example.com"
            type="email"
          />
        </UFormField>

        <UButton
          block
          color="primary"
          icon="i-lucide-user-plus"
          :loading="isSharing"
          @click="handlePaletteShareSubmit"
        >
          Add collaborator
        </UButton>

        <div class="space-y-3">
          <p class="text-sm font-medium text-highlighted">
            Current collaborators
          </p>

          <div
            v-if="!sharePaletteTarget?.collaborators.length"
            class="rounded -lg border border-default px-4 py-4 text-sm text-muted"
          >
            No collaborators yet.
          </div>

          <div
            v-for="collaborator in sharePaletteTarget?.collaborators ?? []"
            :key="collaborator.userId"
            class="flex items-center justify-between gap-3 rounded -lg border border-default px-4 py-4"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ collaborator.name }}
              </p>
              <p class="truncate text-xs text-muted">
                {{ collaborator.email }}
              </p>
            </div>

            <UButton
              color="error"
              variant="soft"
              size="xs"
              icon="i-lucide-user-minus"
              :loading="isUnsharing"
              @click="handlePaletteUnshare(collaborator.userId)"
            >
              Remove
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
