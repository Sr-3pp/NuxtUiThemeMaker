import type { Ref } from 'vue'
import type { PaletteReferenceImageAsset } from '~/types/palette-generation'

const MAX_REFERENCE_IMAGE_BYTES = 5 * 1024 * 1024
const SUPPORTED_REFERENCE_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const

export function normalizeThemeAiHexColor(value: string) {
  const color = value.trim().toLowerCase()

  if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/.test(color)) {
    return null
  }

  return color
}

export function addThemeAiBrandColor(
  target: Ref<string[]>,
  input: Ref<string>,
  label: string,
  showValidationToast: (title: string, description: string) => void,
) {
  const color = normalizeThemeAiHexColor(input.value)

  if (!color) {
    showValidationToast('Invalid brand color', `Use a hex color like #0ea5e9 for ${label}.`)
    return
  }

  if (target.value.includes(color)) {
    showValidationToast('Duplicate brand color', `${color} is already included in ${label}.`)
    input.value = ''
    return
  }

  target.value = [...target.value, color]
  input.value = ''
}

export function removeThemeAiBrandColor(target: Ref<string[]>, color: string) {
  target.value = target.value.filter(entry => entry !== color)
}

export async function handleThemeAiReferenceImageUpload(
  event: Event,
  target: Ref<PaletteReferenceImageAsset | null>,
  showValidationToast: (title: string, description: string) => void,
  showErrorToast: (error: unknown, fallbackMessage: string) => void,
) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  if (!SUPPORTED_REFERENCE_IMAGE_TYPES.includes(file.type as typeof SUPPORTED_REFERENCE_IMAGE_TYPES[number])) {
    target.value = null
    showValidationToast('Unsupported image type', 'Use a PNG, JPEG, WEBP, or GIF reference image.')
    input.value = ''
    return
  }

  if (file.size > MAX_REFERENCE_IMAGE_BYTES) {
    target.value = null
    showValidationToast('Image too large', 'Reference images must be 5 MB or smaller.')
    input.value = ''
    return
  }

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    const [, base64 = ''] = dataUrl.split(',', 2)

    target.value = {
      data: base64,
      mimeType: file.type || 'image/png',
      name: file.name,
    }
  } catch (error) {
    showErrorToast(error, 'Failed to read the reference image.')
  } finally {
    input.value = ''
  }
}
