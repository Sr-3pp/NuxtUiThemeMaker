# Product Roadmap

## Goal

Upgrade Nuxt UI Theme Builder from a semantic palette editor into a direct competitor to Nuxtlify, then push past it with stronger workflow, QA, and team features.

The current app already has meaningful foundations:

- live token editing and preview
- saved palettes and public sharing
- auth, billing, and admin flows
- AI-assisted palette generation

The main gap is theming depth. The app currently focuses on semantic palette tokens, while a direct competitor needs:

- full color ramp editing
- per-component variant customization
- broader Nuxt UI component coverage
- real import/export interoperability
- design QA and collaboration workflows

## Product Position

Target position:

`Nuxt UI design system builder`

Not just a color palette generator. The product should let teams define, preview, validate, export, version, and share production-ready Nuxt UI themes.

## Strategic Priorities

1. Expand the theme model beyond semantic palette tokens.
2. Make preview coverage exhaustive across Nuxt UI components and states.
3. Support real-world import/export flows for production apps.
4. Add automated quality checks around accessibility and consistency.
5. Build team and versioning features that create a monetizable moat.

## Phase 1: Theme Data Model

Objective:
Enable the app to store and edit the same kinds of theme data users expect from a serious Nuxt UI theme builder.

### Deliverables

- Add support for color ramps such as `50` through `950`
- Add alias tokens and derived semantic mappings
- Add component-level customization
- Add variant/state-level overrides
- Preserve light and dark mode support

### Suggested model additions

Current model:

- `name`
- `modes.light`
- `modes.dark`

Target model:

- `name`
- `modes.light.semantic`
- `modes.dark.semantic`
- `colors.primary.50-950`
- `colors.secondary.50-950`
- `colors.neutral.50-950`
- `aliases`
- `components.button`
- `components.input`
- `components.badge`
- `components.alert`
- `components.card`
- `components.modal`
- `components.dropdownMenu`
- `components.navigationMenu`
- `metadata`

### Repo impact

- Update [server/domain/palette-schema.ts](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/server/domain/palette-schema.ts)
- Update [app/types/palette.ts](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/app/types/palette.ts)
- Update export utilities in [app/utils/paletteExport.ts](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/app/utils/paletteExport.ts)
- Update runtime theme mapping in [app/utils/theme-builder.ts](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/app/utils/theme-builder.ts)

### Acceptance criteria

- A palette can store semantic tokens, ramps, and component overrides
- Existing saved palettes can still load through a migration or compatibility layer
- Exports remain deterministic

## Phase 2: Builder UX Expansion

Objective:
Turn the builder into a real theme editor rather than a token table with preview.

### Deliverables

- Add a color ramp editor with per-shade controls
- Add a component customization panel
- Add variant editors for `solid`, `outline`, `soft`, `subtle`, `ghost`, `link`
- Add state editors for default, hover, active, focus, disabled
- Add token search, filtering, and grouping

### UX additions

- `Colors` tab
- `Semantic` tab
- `Components` tab
- `States` tab
- `Export` tab

### Repo impact

- Expand editor UI under [app/components/Editor](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/app/components/Editor)
- Extend [app/components/EditorContent.vue](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/app/components/EditorContent.vue)
- Extend palette state management in [app/composables/usePaletteState.ts](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/app/composables/usePaletteState.ts)

### Acceptance criteria

- Users can edit more than semantic color tokens
- Component variants can be customized without editing raw JSON
- Theme changes remain fast and understandable in the UI

## Phase 3: Full Nuxt UI Preview Coverage

Objective:
Match and exceed Nuxtlify’s preview value by covering the actual Nuxt UI component surface area.

### Deliverables

- Build a component browser for supported Nuxt UI components
- Add previews for all important states, variants, and sizes
- Add side-by-side light/dark preview mode
- Add responsive preview widths
- Add “inspect applied tokens” overlays

### Candidate preview coverage

- buttons, badges, alerts, avatars
- inputs, textarea, select, checkbox, switch, slider, radio
- cards, tables, dropdowns, modals, drawers, tooltips
- navigation, tabs, breadcrumbs, pagination
- command palette, notifications, empty states

### Repo impact

- Expand [app/components/Preview](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/app/components/Preview)
- Refactor [app/components/Preview/Panel.vue](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/app/components/Preview/Panel.vue) into a richer preview router

### Acceptance criteria

- Users can preview every major Nuxt UI component
- Preview clearly exposes variant and state regressions
- The preview becomes useful as a QA surface, not just a demo

## Phase 4: Import and Export Interoperability

Objective:
Make the app fit real Nuxt UI workflows instead of stopping at downloadable theme files.

### Deliverables

- Import from `app.config.ts`
- Import from CSS variables
- Export per-component theme config
- Export install-ready Nuxt snippets
- Add copy-to-clipboard actions
- Add compatibility presets for different Nuxt UI structures if needed

### Repo impact

- Expand [app/components/Sidebar/ExportModal.vue](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/app/components/Sidebar/ExportModal.vue)
- Extend [app/utils/paletteExport.ts](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/app/utils/paletteExport.ts)
- Expand import support in [app/components/Sidebar/ImportModal.vue](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/app/components/Sidebar/ImportModal.vue)

### Acceptance criteria

- A user can round-trip an existing Nuxt UI theme into the builder and back out
- Export output is copy-paste ready for production usage
- Component-level customizations survive import/export

## Phase 5: Theme QA and Accessibility

Objective:
Create differentiation that is hard for lighter competitors to match.

### Deliverables

- Contrast audit for major foreground/background pairs
- Warnings for weak semantic mappings
- Focus ring visibility checks
- Component regression checks
- Theme health score
- Publish readiness checklist

### Repo impact

- Add validation utilities under `app/utils` and `server/services`
- Add QA panels in the editor and preview areas
- Add test coverage for contrast and token integrity

### Acceptance criteria

- The app flags likely accessibility and consistency issues automatically
- Users can identify why a theme is risky before export or publish

## Phase 6: Collaboration and Versioning

Objective:
Build the SaaS moat around workflow, not only theme editing.

### Deliverables

- Palette version history
- Draft and published states
- Fork and compare
- Comments and approvals
- Team workspaces
- Shared private libraries

### Repo impact

- Extend persistence and APIs under [server/api/palettes](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/server/api/palettes)
- Expand user and billing logic as needed
- Add new workspace and history views in `app/pages`

### Acceptance criteria

- Teams can collaborate without duplicating themes manually
- A theme has history, ownership, and publish lifecycle

## Phase 7: AI Expansion

Objective:
Move AI from palette generation into end-to-end theme assistance.

### Deliverables

- Generate full ramps from one or more brand colors
- Generate component variants from a mood or brand prompt
- Suggest fixes for low-contrast states
- Convert screenshots or existing style references into starter themes
- Generate alternative theme directions from an existing palette

### Repo impact

- Extend [server/api/palettes/generate.ts](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/server/api/palettes/generate.ts)
- Add new structured generation endpoints for ramps, variants, and audits

### Acceptance criteria

- AI output covers real theme-building tasks, not only initial palette ideation
- Generated output is schema-safe and testable

## Release Plan

### Release 1

- theme model expansion
- compatibility layer for existing palettes
- initial color ramp editor

### Release 2

- component override editor
- richer export formats
- broader preview coverage

### Release 3

- import round-tripping
- contrast and QA tooling
- side-by-side compare mode

### Release 4

- version history
- collaboration features
- stronger plan differentiation

### Release 5

- advanced AI theme generation
- AI repair and optimization tools

## Pricing Evolution

The current pricing mostly gates generation volume and saves. That is not enough once the app becomes a deeper product.

Recommended packaging direction:

- Free: basic palette editing, limited saves, limited exports
- Pro: full exports, component overrides, richer preview coverage, more AI usage
- Studio: collaboration, history, private libraries, advanced QA, higher AI limits

Update [app/data/pricing.ts](/Users/sr3pp/Web/Nuxt/NuxtUiThemeMaker/app/data/pricing.ts) once feature gates are real.

## Engineering Principles

- Keep existing palette data loadable through migrations or adapters
- Avoid schema changes without export/import tests
- Treat preview and export as product-critical surfaces
- Add fixtures for every new token family and component override type
- Build QA features alongside editing features, not after

## Immediate Next Tasks

1. Redesign the palette schema to support ramps and component overrides.
2. Add a compatibility adapter for the current palette format.
3. Refactor the editor into multi-surface tabs: colors, semantic, components, export.
4. Expand preview architecture to support component-by-component rendering.
5. Upgrade export format support before introducing heavy collaboration features.
