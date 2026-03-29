<script setup lang="ts">
const { togglePalettesSidebar, toggleEditorSidebar } = useSidebar()
const { currentPalette, setCurrentPalette } = usePaletteState()
const { generatePalette } = usePaletteApi()
const { cta, helperText, isDisabled, refresh } = usePaletteGenerationAccess()
const { showErrorToast } = useErrorToast()

const prompt = ref('')
const isGenerating = ref(false)

const handleGenertion = async () => {
    if (!prompt.value.trim() || isDisabled.value || isGenerating.value) {
        return
    }

    isGenerating.value = true

    try {
        const generatedPalette = await generatePalette(prompt.value)
        if (generatedPalette) {
            setCurrentPalette(generatedPalette)
            prompt.value = ''
        }
    } catch (error) {
        console.error('Error generating palette:', error)
        showErrorToast(error, 'Failed to generate palette.')
        await refresh()
    } finally {
        isGenerating.value = false
    }
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

    <div class="ml-auto flex w-full max-w-sm gap-2 items-center">
        <UInput
            v-if="!isDisabled"
            v-model="prompt"
            class="w-full"
            label="Generate Palette"
            placeholder="Describe your palette..."
            @keydown.enter="handleGenertion()"
        >
            <template #trailing>
                <UButton
                    class="px-0"
                    color="primary"
                    variant="link"
                    :disabled="isDisabled"
                    :loading="isGenerating"
                    @click="handleGenertion()"
                    icon="mingcute:ai-line"
                />
            </template>
        </UInput>

        <UButton
            class="ml-auto"
            v-else
            :to="cta?.to"
            color="primary"
            variant="link"
            size="xs"
        >
            <UIcon name="mingcute:ai-line" class="size-4" />
            {{ helperText }}
        </UButton>

        <UButton
            class="ml-auto"
            color="secondary"
            variant="ghost"
            v-if="isDisabled"
            to="/pricing"
            icon="mynaui:label"
        >
            <span class="hidden sm:inline-block">See Plans</span>
        </UButton>
    </div>
</div>
</template>
