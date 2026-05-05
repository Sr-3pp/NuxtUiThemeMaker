/**
 * Composable for managing the active editor section (tab) in the right sidebar.
 * Allows programmatic navigation between Colors, Semantic, and States tabs.
 */
export function useEditorSection() {
  const activeSection = useState<'shades' | 'semantic' | 'states'>('editor-active-section', () => 'semantic')

  function switchToSection(section: 'shades' | 'semantic' | 'states') {
    activeSection.value = section
  }

  function switchToShades() {
    activeSection.value = 'shades'
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
    switchToShades,
    switchToSemantic,
    switchToStates,
  }
}
