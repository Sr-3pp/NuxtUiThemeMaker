import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import PanelNavigation from '~/components/Panel/Navigation.vue'
import { panelExitItems, panelSectionItems } from '~/utils/panel-navigation'

describe('panel navigation', () => {
  it('renders panel sections and exit links from centralized navigation config', async () => {
    const wrapper = await mountSuspended(PanelNavigation, {
      props: {
        currentPath: '/panel/palettes',
      },
    })

    for (const item of [...panelSectionItems, ...panelExitItems]) {
      expect(wrapper.text()).toContain(item.label)
      expect(wrapper.find(`a[href="${item.to}"]`).exists()).toBe(true)
    }
  })

  it('marks the active panel section', async () => {
    const wrapper = await mountSuspended(PanelNavigation, {
      props: {
        currentPath: '/panel/palettes',
      },
    })
    const activeLink = wrapper.get('a[href="/panel/palettes"]')

    expect(activeLink.text()).toContain('Palettes')
    expect(activeLink.attributes('class')).toContain('text-primary')
  })
})
