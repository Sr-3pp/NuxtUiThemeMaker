/**
 * Composable for managing the active editor section (tab) in the right sidebar.
 * Allows programmatic navigation between Colors, Semantic, and States tabs.
 */
export function useEditorSection() {
  const activeSection = useState<'colors' | 'semantic' | 'states'>('editor-active-section', () => 'colors')

  function switchToSection(section: 'colors' | 'semantic' | 'states') {
    activeSection.value = section
  }

  function switchToColors() {
    activeSection.value = 'colors'
  }

  function switchToSemantic() {
    activeSection.value = 'semantic'
  }

  function switchToStates() {
    activeSection.value = 'states'
  }

  return {
    activeSection,
    switchToSection,
    switchToColors,
    switchToSemantic,
    switchToStates,
  }
}
