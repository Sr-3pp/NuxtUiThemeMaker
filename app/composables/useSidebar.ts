export default function useSidebar() {
  const palettesSidebarSw = useState<boolean>('palettes-sidebar-sw', () => false)
  const editorSidebarSw = useState<boolean>('editor-sidebar-sw', () => false)

  function toggle(state: typeof palettesSidebarSw | typeof editorSidebarSw) {
    state.value = !state.value
  }

  function close(state: typeof palettesSidebarSw | typeof editorSidebarSw) {
    state.value = false
  }

  function open(state: typeof palettesSidebarSw | typeof editorSidebarSw) {
    state.value = true
  }

  function togglePalettesSidebar() {
    toggle(palettesSidebarSw)
  }

  function openPalettesSidebar() {
    open(palettesSidebarSw)
  }

  function closePalettesSidebar() {
    close(palettesSidebarSw)
  }

  function toggleEditorSidebar() {
    toggle(editorSidebarSw)
  }

  function openEditorSidebar() {
    open(editorSidebarSw)
  }

  function closeEditorSidebar() {
    close(editorSidebarSw)
  }

  return {
    palettesSidebarSw,
    openPalettesSidebar,
    togglePalettesSidebar,
    closePalettesSidebar,
    editorSidebarSw,
    openEditorSidebar,
    toggleEditorSidebar,
    closeEditorSidebar,
  }
}
