export function useThemeModals() {
  const isAiAssistOpen = useState('theme-ai-modal-open', () => false)
  const isQaModalOpen = useState('theme-qa-modal-open', () => false)

  return {
    isAiAssistOpen,
    isQaModalOpen,
  }
}
