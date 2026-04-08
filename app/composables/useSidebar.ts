export default function useSidebar() {
  const palettesSidebarSw = useState<boolean>('palettes-sidebar-sw', () => false)
  const editorSidebarSw = useState<boolean>('editor-sidebar-sw', () => false)

  function toggle(state: typeof palettesSidebarSw | typeof editorSidebarSw) {
    state.value = !state.value
  }

  function togglePalettesSidebar() {
    toggle(palettesSidebarSw)
  }

  function toggleEditorSidebar() {
    toggle(editorSidebarSw)
  }

  return {
    palettesSidebarSw,
    togglePalettesSidebar,
    editorSidebarSw,
    toggleEditorSidebar,
  }
}
