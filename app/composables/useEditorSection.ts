/**
 * Composable for managing the active editor section (tab) in the right sidebar.
 * Allows programmatic navigation between Colors, Semantic, Components, and States tabs.
 */
export function useEditorSection() {
  const activeSection = useState<'colors' | 'semantic' | 'components' | 'states'>('editor-active-section', () => 'colors')

  function switchToSection(section: 'colors' | 'semantic' | 'components' | 'states') {
    activeSection.value = section
  }

  function switchToComponents() {
    activeSection.value = 'components'
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
    switchToComponents,
    switchToColors,
    switchToSemantic,
    switchToStates,
  }
}
