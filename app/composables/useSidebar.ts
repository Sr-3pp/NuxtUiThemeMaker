export default function useSidebar() {
  const palettesSidebarSw = useState<boolean>('palettes-sidebar-sw', () => false)
  const editorSidebarSw = useState<boolean>('editor-sidebar-sw', () => false)

  function toggle(state: typeof palettesSidebarSw | typeof editorSidebarSw) {
    state.value = !state.value
  }

  function close(state: typeof palettesSidebarSw | typeof editorSidebarSw) {
    state.value = false
  }

  function togglePalettesSidebar() {
    toggle(palettesSidebarSw)
  }

  function closePalettesSidebar() {
    close(palettesSidebarSw)
  }

  function toggleEditorSidebar() {
    toggle(editorSidebarSw)
  }

  function closeEditorSidebar() {
    close(editorSidebarSw)
  }

  return {
    palettesSidebarSw,
    togglePalettesSidebar,
    closePalettesSidebar,
    editorSidebarSw,
    toggleEditorSidebar,
    closeEditorSidebar,
  }
}
