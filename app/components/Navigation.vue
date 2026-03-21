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
<div class="flex gap-4 items-center justify-between p-2 sm:p-4">
    <UButton
        class="sm:hidden" 
        @click="togglePalettesSidebar()"
    >
        <UIcon name="i-lucide:layout-list" />
    </UButton>

    <div class="flex min-w-0 gap-2">
        <span class="rounded-sm bg-primary size-6 flex items-center justify-center">
            <UIcon name="i-lucide:palette" class="text-black" />
        </span>
        <div class="min-w-0">
            <p class="font-bold flex flex-wrap gap-2 sm:gap-4">
            <span>Nuxt UI Theme Builder</span> | <span class="text-muted">Palette: </span> {{ currentPalette?.name }}
            </p>
            <p class="text-xs text-muted">
            Created by Sr.3pp
            </p>
        </div>
    </div>

    <div class="ml-auto flex w-full max-w-sm flex-col gap-2">
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
    </div>
    
    
    <UButton 
        class="sm:hidden" 
        @click="toggleEditorSidebar()"
    >
        <UIcon name="i-lucide:palette" />
    </UButton>
</div>
</template>
