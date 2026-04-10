<script setup lang="ts">
defineOptions({
  name: 'AppNavigation',
})

const { togglePalettesSidebar, toggleEditorSidebar } = useSidebar()
const { currentPalette } = usePaletteState()
const { cta, helperText, isDisabled, refresh } = usePaletteGenerationAccess()
const { isAiAssistOpen } = useThemeModals()

const openAiTools = async () => {
    if (isDisabled.value) {
        await refresh()
        return
    }

    isAiAssistOpen.value = true
}
</script>

<template>
<div class="flex flex-col sm:flex-row gap-4 items-center justify-between p-2 sm:p-4">
    <div class="flex min-w-0 gap-2 w-full sm:w-auto">
        <UButton
            class="sm:hidden mb-auto mr-auto" 
            variant="outline"
            @click="togglePalettesSidebar()"
        >
            <UIcon name="i-lucide:layout-list" />
        </UButton>
        <span class="rounded-sm bg-primary size-6 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide:palette" class="text-black" />
        </span>
        <div class="min-w-0">
            <p class="font-bold flex flex-wrap gap-2 sm:gap-4">
                <span>Nuxt UI Theme Builder</span> 
                <span class="hidden sm:inline-block">
                    | <span class="text-muted">Palette: </span> {{ currentPalette?.name }}
                </span>
            </p>
            <p class="text-xs text-muted hidden sm:block">
            Created by <NuxtLink to="https://sr3pp.dev" target="_blank">Sr.3pp</NuxtLink>
            </p>
        </div>

        <UButton 
            class="sm:hidden mb-auto ml-auto"
            variant="outline" 
            @click="toggleEditorSidebar()"
        >
            <UIcon name="i-lucide:palette" />
        </UButton>
    </div>

    <div class="ml-auto flex w-full max-w-2xl gap-2 items-center justify-end flex-wrap">
        <template v-if="!isDisabled">
            <UButton
                color="primary"
                variant="soft"
                icon="i-lucide-sparkles"
                @click="openAiTools()"
            >
                AI tools
            </UButton>
        </template>

        <UButton
            v-else
            class="ml-auto"
            :to="cta?.to"
            color="primary"
            variant="link"
            size="xs"
        >
            <UIcon name="mingcute:ai-line" class="size-4" />
            {{ helperText }}
        </UButton>

        <UButton
            v-if="isDisabled"
            class="ml-auto"
            color="secondary"
            variant="ghost"
            to="/pricing"
            icon="mynaui:label"
        >
            <span class="hidden sm:inline-block">See Plans</span>
        </UButton>
    </div>
</div>
</template>
