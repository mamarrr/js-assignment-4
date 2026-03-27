<script setup lang="ts">
import DashboardCategoriesPanel from '@/modules/tasks/components/DashboardCategoriesPanel.vue'
import DashboardPrioritiesPanel from '@/modules/tasks/components/DashboardPrioritiesPanel.vue'
import DashboardTasksPanel from '@/modules/tasks/components/DashboardTasksPanel.vue'
import { useDashboardBootstrap } from '@/modules/tasks/composables/use-dashboard-bootstrap'

useDashboardBootstrap()
</script>

<template>
  <section class="dashboard-grid">
    <DashboardTasksPanel />

    <aside class="side-tools">
      <DashboardPrioritiesPanel />
      <DashboardCategoriesPanel />
    </aside>
  </section>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
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
    grid-template-columns: 2fr minmax(240px, 320px);
  }
}
</style>
