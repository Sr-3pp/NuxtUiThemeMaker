export default function useSidebar(){
    const palettesSidebarSw = useState<boolean>('palettes-sidebar-sw', () => false)
    const editorSidebarSw = useState<boolean>('editor-sidebar-sw', () => false)

    const togglePalettesSidebar = () => {
        palettesSidebarSw.value = !palettesSidebarSw.value
    }

    const toggleEditorSidebar = () => {
        editorSidebarSw.value = !editorSidebarSw.value
    }

    return {
        palettesSidebarSw,
        togglePalettesSidebar,
        editorSidebarSw,
        toggleEditorSidebar
    }
}