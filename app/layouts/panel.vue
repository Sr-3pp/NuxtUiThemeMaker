<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <PublicThemeShell>
      <PublicNavbar />
      <PanelNavigation />
      <slot />
    </PublicThemeShell>
    <ModalContribute />
  </UApp>
</template>
