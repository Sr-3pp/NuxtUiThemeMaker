export function usePreviewSplitView() {
  const isSplitView = useState<boolean>('preview-split-view', () => false)

  function toggleSplitView() {
    isSplitView.value = !isSplitView.value
  }

  return {
    isSplitView,
    toggleSplitView,
  }
}
