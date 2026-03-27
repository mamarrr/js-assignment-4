<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import DashboardFiltersPanel from '@/modules/tasks/components/DashboardFiltersPanel.vue'
import DashboardCategoriesPanel from '@/modules/tasks/components/DashboardCategoriesPanel.vue'
import DashboardPrioritiesPanel from '@/modules/tasks/components/DashboardPrioritiesPanel.vue'
import DashboardTasksPanel from '@/modules/tasks/components/DashboardTasksPanel.vue'
import { useDashboardBootstrap } from '@/modules/tasks/composables/use-dashboard-bootstrap'

interface DashboardFiltersPanelExposed {
  focusFirstControl: () => void
}

const TABLET_BREAKPOINT = 768
const DESKTOP_BREAKPOINT = 1024

useDashboardBootstrap()

const viewportWidth = ref(window.innerWidth)
const isTabletFiltersOpen = ref(false)
const isMobileDrawerOpen = ref(false)

const mobileFilterTriggerRef = ref<HTMLButtonElement | null>(null)
const mobileDrawerRef = ref<HTMLElement | null>(null)
const mobileFiltersPanelRef = ref<DashboardFiltersPanelExposed | null>(null)

const isDesktop = computed(() => viewportWidth.value >= DESKTOP_BREAKPOINT)
const isTablet = computed(
  () => viewportWidth.value >= TABLET_BREAKPOINT && viewportWidth.value < DESKTOP_BREAKPOINT,
)
const isMobile = computed(() => viewportWidth.value < TABLET_BREAKPOINT)

function updateViewportWidth(): void {
  viewportWidth.value = window.innerWidth
}

function toggleTabletFilters(): void {
  isTabletFiltersOpen.value = !isTabletFiltersOpen.value
}

function openMobileDrawer(): void {
  isMobileDrawerOpen.value = true
}

function closeMobileDrawer(): void {
  isMobileDrawerOpen.value = false
}

function getDrawerFocusableElements(): HTMLElement[] {
  if (!mobileDrawerRef.value) {
    return []
  }

  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  return Array.from(mobileDrawerRef.value.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !element.hasAttribute('hidden') && element.offsetParent !== null,
  )
}

function onMobileDrawerKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMobileDrawer()
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  const focusables = getDrawerFocusableElements()
  if (focusables.length === 0) {
    return
  }

  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (!first || !last) {
    return
  }

  const active = document.activeElement as HTMLElement | null

  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
    return
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(isDesktop, (desktop) => {
  if (desktop) {
    isTabletFiltersOpen.value = false
    isMobileDrawerOpen.value = false
  }
})

watch(isMobileDrawerOpen, async (open) => {
  if (open) {
    await nextTick()
    mobileFiltersPanelRef.value?.focusFirstControl()
    return
  }

  await nextTick()
  mobileFilterTriggerRef.value?.focus()
})

onMounted(() => {
  window.addEventListener('resize', updateViewportWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportWidth)
})
</script>

<template>
  <section v-if="isTablet || isMobile" class="dashboard-controls">
    <button
      v-if="isTablet"
      type="button"
      class="toggle-button"
      :aria-controls="'dashboard-filters-tablet'"
      :aria-expanded="isTabletFiltersOpen"
      @click="toggleTabletFilters"
    >
      {{ isTabletFiltersOpen ? 'Hide filters' : 'Show filters' }}
    </button>

    <button
      v-if="isMobile"
      ref="mobileFilterTriggerRef"
      type="button"
      class="toggle-button"
      :aria-controls="'dashboard-filters-drawer'"
      :aria-expanded="isMobileDrawerOpen"
      @click="openMobileDrawer"
    >
      Filter tasks
    </button>
  </section>

  <section class="dashboard-grid" :class="{ tablet: isTablet, mobile: isMobile }">
    <aside v-if="isDesktop" class="filters-panel-wrapper">
      <DashboardFiltersPanel />
    </aside>

    <aside
      v-if="isTablet && isTabletFiltersOpen"
      id="dashboard-filters-tablet"
      class="filters-panel-tablet"
    >
      <DashboardFiltersPanel />
    </aside>

    <DashboardTasksPanel class="tasks-region" />

    <aside class="side-tools">
      <DashboardPrioritiesPanel />
      <DashboardCategoriesPanel />
    </aside>
  </section>

  <div
    v-if="isMobile && isMobileDrawerOpen"
    class="drawer-backdrop"
    @click.self="closeMobileDrawer"
  >
    <aside
      id="dashboard-filters-drawer"
      ref="mobileDrawerRef"
      class="filters-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-filters-mobile-title"
      @keydown="onMobileDrawerKeydown"
    >
      <header class="drawer-header">
        <h2 id="dashboard-filters-mobile-title">Filters</h2>
        <button type="button" @click="closeMobileDrawer">Close</button>
      </header>

      <DashboardFiltersPanel ref="mobileFiltersPanelRef" />
    </aside>
  </div>
</template>

<style scoped>
.dashboard-controls {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0.75rem;
}

.toggle-button {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr minmax(240px, 320px);
  gap: 1rem;
}

.filters-panel-wrapper {
  display: none;
}

.filters-panel-tablet {
  grid-column: 1 / -1;
}

.tasks-region {
  min-width: 0;
}

.side-tools {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-content: start;
  align-items: start;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: minmax(260px, 320px) minmax(0, 1fr) minmax(240px, 320px);
  }

  .filters-panel-wrapper {
    display: block;
  }
}

@media (max-width: 767px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 48%);
  z-index: 20;
  display: flex;
  justify-content: flex-start;
}

.filters-drawer {
  width: min(92vw, 380px);
  height: 100%;
  overflow: auto;
  background: var(--color-background);
  padding: 0.75rem;
  border-right: 1px solid var(--color-border);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
}

.drawer-header h2 {
  margin: 0;
}

.drawer-header button {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.35rem 0.55rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
}
</style>
