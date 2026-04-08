import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import {
  addThemeAiBrandColor,
  handleThemeAiReferenceImageUpload,
  normalizeThemeAiHexColor,
  removeThemeAiBrandColor,
} from '../../app/utils/theme-ai-modal-starter'

describe('theme AI modal starter utils', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('normalizes valid hex colors and rejects invalid values', () => {
    expect(normalizeThemeAiHexColor(' #0EA5E9 ')).toBe('#0ea5e9')
    expect(normalizeThemeAiHexColor('#abc')).toBe('#abc')
    expect(normalizeThemeAiHexColor('rgb(1,2,3)')).toBeNull()
  })

  it('adds and removes brand colors while warning on invalid and duplicate input', () => {
    const colors = ref<string[]>([])
    const input = ref('')
    const showValidationToast = vi.fn()

    input.value = 'bad-value'
    addThemeAiBrandColor(colors, input, 'starter theme generation', showValidationToast)

    input.value = '#0EA5E9'
    addThemeAiBrandColor(colors, input, 'starter theme generation', showValidationToast)

    input.value = '#0ea5e9'
    addThemeAiBrandColor(colors, input, 'starter theme generation', showValidationToast)

    removeThemeAiBrandColor(colors, '#0ea5e9')

    expect(colors.value).toEqual([])
    expect(showValidationToast).toHaveBeenCalledTimes(2)
    expect(showValidationToast).toHaveBeenNthCalledWith(1, 'Invalid brand color', 'Use a hex color like #0ea5e9 for starter theme generation.')
    expect(showValidationToast).toHaveBeenNthCalledWith(2, 'Duplicate brand color', '#0ea5e9 is already included in starter theme generation.')
  })

  it('rejects unsupported reference image uploads', async () => {
    const target = ref(null)
    const showValidationToast = vi.fn()
    const showErrorToast = vi.fn()
    const event = {
      target: {
        files: [{ type: 'image/svg+xml', size: 10, name: 'logo.svg' }],
        value: 'picked',
      },
    } as unknown as Event

    await handleThemeAiReferenceImageUpload(event, target, showValidationToast, showErrorToast)

    expect(target.value).toBeNull()
    expect(showValidationToast).toHaveBeenCalledWith('Unsupported image type', 'Use a PNG, JPEG, WEBP, or GIF reference image.')
    expect(showErrorToast).not.toHaveBeenCalled()
    expect((event.target as HTMLInputElement).value).toBe('')
  })

  it('stores uploaded reference image data when the file is valid', async () => {
    const target = ref(null)
    const showValidationToast = vi.fn()
    const showErrorToast = vi.fn()
    const readAsDataURL = vi.fn(function (this: { result: string | null, onload: null | (() => void) }, _file: unknown) {
      this.result = 'data:image/png;base64,ZmFrZQ=='
      this.onload?.()
    })

    vi.stubGlobal('FileReader', class {
      result: string | null = null
      error: Error | null = null
      onload: null | (() => void) = null
      onerror: null | (() => void) = null
      readAsDataURL = readAsDataURL
    })

    const event = {
      target: {
        files: [{ type: 'image/png', size: 64, name: 'reference.png' }],
        value: 'picked',
      },
    } as unknown as Event

    await handleThemeAiReferenceImageUpload(event, target, showValidationToast, showErrorToast)

    expect(target.value).toEqual({
      data: 'ZmFrZQ==',
      mimeType: 'image/png',
      name: 'reference.png',
    })
    expect(showValidationToast).not.toHaveBeenCalled()
    expect(showErrorToast).not.toHaveBeenCalled()
    expect((event.target as HTMLInputElement).value).toBe('')
  })
})
