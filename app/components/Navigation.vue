<script setup lang="ts">
const { togglePalettesSidebar, toggleEditorSidebar } = useSidebar()
const { currentPalette, setCurrentPalette } = usePaletteState()
const { generatePalette } = usePaletteApi()

const prompt = ref('')

const handleGenertion = async () => {
    if (!prompt.value.trim()) {
        return
    }

    try {
        const generatedPalette = await generatePalette(prompt.value)
        if (generatedPalette) {
            setCurrentPalette(generatedPalette)
        }
    } catch (error) {
        console.error('Error generating palette:', error)
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

    <UInput 
        class="w-1/5 ml-auto"
        label="Generate Palette"
        placeholder="Describe your palette..."
        icon="mingcute:ai-line"
        v-model="prompt"
    >
        <template #trailing>
            <UButton 
                color="primary" 
                variant="link"
                @click="handleGenertion()"
                icon="solar:star-fall-minimalistic-2-bold"
            >
            </UButton>
        </template>
    </UInput>

    <UColorModeSwitch />
    
    
    <UButton 
        class="sm:hidden" 
        @click="toggleEditorSidebar()"
    >
        <UIcon name="i-lucide:palette" />
    </UButton>
</div>
</template>