<script setup lang="ts">
import type { PaletteReviewStatus, PaletteReviewThread } from '~/types/palette-review'
import type { StoredPalette } from '~/types/palette-store'
import { buildPaletteBreadcrumbJsonLd, buildPaletteDescription, buildPaletteJsonLd } from '~/utils/seo'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined
const toast = useToast()
const { createPaletteReview, forkPalette, getPaletteReviews } = usePaletteApi()
const { isAuthenticated, normalizeRedirectTarget, user } = useAuth()
const { setCurrentPalette } = usePaletteState()
const { showErrorToast } = useErrorToast()
const isForking = ref(false)
const isSubmittingReview = ref(false)
const reviewState = reactive({
  status: 'commented' as PaletteReviewStatus,
  message: '',
})

const { data: palette, error } = await useAsyncData(
  () => `palette-${slug.value}`,
  () => $fetch<StoredPalette>(`/api/palettes/slug/${slug.value}`, {
    headers: requestHeaders,
  })
)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 404,
    statusMessage: error.value.statusMessage ?? 'Palette not found',
  })
}

const paletteValue = computed(() => palette.value)
const isOwner = computed(() => Boolean(user.value && paletteValue.value && user.value.id === paletteValue.value.userId))
const { data: reviewThread, refresh: refreshReviewThread } = await useAsyncData(
  () => `palette-reviews-${paletteValue.value?._id ?? slug.value}`,
  () => paletteValue.value
    ? getPaletteReviews(paletteValue.value._id)
    : Promise.resolve<PaletteReviewThread>({
        summary: {
          total: 0,
          approvals: 0,
          comments: 0,
          changesRequested: 0,
        },
        reviews: [],
      }),
  {
    watch: [paletteValue],
    default: () => ({
      summary: {
        total: 0,
        approvals: 0,
        comments: 0,
        changesRequested: 0,
      },
      reviews: [],
    }),
  },
)
const siteConfig = useRuntimeConfig()
const reviewStatusOptions = [
  { label: 'Comment', value: 'commented' },
  { label: 'Approve', value: 'approved' },
  { label: 'Request changes', value: 'changes_requested' },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

async function handleFork() {
  if (!paletteValue.value) {
    return
  }

  if (!isAuthenticated.value) {
    const redirect = normalizeRedirectTarget(route.fullPath, '/')
    await navigateTo(`/login?redirect=${encodeURIComponent(redirect)}`)
    return
  }

  isForking.value = true

  try {
    const forkedPalette = await forkPalette(paletteValue.value._id)

    setCurrentPalette(forkedPalette)
    toast.add({
      title: 'Palette forked',
      description: `${forkedPalette.name} was added to your library.`,
      color: 'success',
    })

    await navigateTo('/editor')
  } catch (error) {
    showErrorToast(error, 'Failed to fork palette.')
  } finally {
    isForking.value = false
  }
}

function handleOpenBuilder() {
  if (!paletteValue.value) {
    return
  }

  setCurrentPalette(paletteValue.value)
  navigateTo('/editor')
}

async function handleReviewSubmit() {
  if (!paletteValue.value) {
    return
  }

  if (!isAuthenticated.value) {
    const redirect = normalizeRedirectTarget(route.fullPath, '/')
    await navigateTo(`/login?redirect=${encodeURIComponent(redirect)}`)
    return
  }

  isSubmittingReview.value = true

  try {
    await createPaletteReview(paletteValue.value._id, {
      status: reviewState.status,
      message: reviewState.message,
    })

    reviewState.status = 'commented'
    reviewState.message = ''
    await refreshReviewThread()
    toast.add({
      title: 'Review added',
      description: 'Your feedback is now attached to this palette.',
      color: 'success',
    })
  } catch (error) {
    showErrorToast(error, 'Failed to add review.')
  } finally {
    isSubmittingReview.value = false
  }
}

usePageSeo({
  title: computed(() => paletteValue.value?.name ? `${paletteValue.value.name} Palette` : 'Shared Palette'),
  description: computed(() => paletteValue.value ? buildPaletteDescription(paletteValue.value) : 'Shared Nuxt UI palette preview.'),
  path: `/palette/${slug.value}`,
  type: 'article',
  robots: computed(() => {
    if (!paletteValue.value?.isPublic) {
      return 'noindex, nofollow'
    }

    return 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  }).value,
  jsonLd: computed(() => {
    if (!paletteValue.value?.isPublic) {
      return undefined
    }

    return [
      buildPaletteJsonLd(siteConfig.public.siteUrl, paletteValue.value),
      buildPaletteBreadcrumbJsonLd(siteConfig.public.siteUrl, paletteValue.value),
    ]
  }),
})
</script>

<template>
  <UMain>
    <header class="border-b border-white/10 bg-black/95 px-4 py-4">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.16em] text-white/45">
            Shareable Palette
          </p>
          <h1 class="text-2xl font-semibold text-white">
            {{ palette?.name }}
          </h1>
          <p class="text-sm text-white/55">
            {{ palette?.slug }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UBadge :color="palette?.isPublic ? 'primary' : 'neutral'" variant="soft">
            {{ palette?.isPublic ? 'Public' : 'Private owner view' }}
          </UBadge>
          <UBadge
            v-if="palette?.forkedFrom"
            color="neutral"
            variant="outline"
          >
            Fork of {{ palette.forkedFrom.name }}
          </UBadge>
          <UColorModeSwitch />
          <UButton
            v-if="palette && !isOwner"
            color="primary"
            icon="i-lucide-git-fork"
            :loading="isForking"
            @click="handleFork"
          >
            Fork to my library
          </UButton>
          <UButton color="neutral" variant="outline" @click="handleOpenBuilder">
            Open editor
          </UButton>
        </div>
      </div>
    </header>

    <div class="min-h-[calc(100vh-89px)] px-4 py-6">
      <div class="space-y-6">
        <UDashboardPanel>
          <ClientOnly>
            <PreviewPanel :palette="palette?.palette ?? null" />
          </ClientOnly>
        </UDashboardPanel>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
          <UCard variant="outline">
            <template #header>
              <div class="space-y-1">
                <p class="text-sm font-medium text-highlighted">
                  Reviews
                </p>
                <p class="text-sm text-muted">
                  Comments, approvals, and change requests attached to this palette.
                </p>
              </div>
            </template>

            <div class="space-y-4">
              <div class="flex flex-wrap gap-2">
                <UBadge color="neutral" variant="soft">
                  {{ reviewThread.summary.total }} total
                </UBadge>
                <UBadge color="success" variant="soft">
                  {{ reviewThread.summary.approvals }} approved
                </UBadge>
                <UBadge color="warning" variant="soft">
                  {{ reviewThread.summary.changesRequested }} changes requested
                </UBadge>
                <UBadge color="neutral" variant="outline">
                  {{ reviewThread.summary.comments }} comments
                </UBadge>
              </div>

              <div
                v-if="!reviewThread.reviews.length"
                class="rounded -lg border border-default px-4 py-4 text-sm text-muted"
              >
                No reviews yet. Use the form to start the review thread.
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="review in reviewThread.reviews"
                  :key="review.id"
                  class="rounded -lg border border-default px-4 py-4"
                >
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-medium text-highlighted">
                      {{ review.userName }}
                    </p>
                    <UBadge
                      :color="review.status === 'approved' ? 'success' : review.status === 'changes_requested' ? 'warning' : 'neutral'"
                      variant="soft"
                    >
                      {{ review.status }}
                    </UBadge>
                    <p class="text-xs text-muted">
                      {{ formatDate(review.createdAt) }}
                    </p>
                  </div>

                  <p class="mt-3 whitespace-pre-wrap text-sm text-toned">
                    {{ review.message }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>

          <UCard variant="outline">
            <template #header>
              <div class="space-y-1">
                <p class="text-sm font-medium text-highlighted">
                  Add review
                </p>
                <p class="text-sm text-muted">
                  Leave a comment, approve the palette, or request changes.
                </p>
              </div>
            </template>

            <div class="space-y-4">
              <UFormField label="Status" name="review-status">
                <USelect
                  v-model="reviewState.status"
                  :items="reviewStatusOptions"
                  value-key="value"
                  variant="outline"
                />
              </UFormField>

              <UFormField label="Message" name="review-message">
                <UTextarea
                  v-model="reviewState.message"
                  :rows="6"
                  placeholder="What should the next version keep, change, or revisit?"
                />
              </UFormField>

              <UButton
                block
                color="primary"
                icon="i-lucide-message-square-plus"
                :loading="isSubmittingReview"
                @click="handleReviewSubmit"
              >
                Submit review
              </UButton>

              <p class="text-xs text-muted">
                {{ isAuthenticated ? 'Reviews are attached to your account name.' : 'Sign in to participate in the review thread.' }}
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UMain>
</template>
