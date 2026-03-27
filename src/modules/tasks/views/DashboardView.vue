<template>
  <section class="dashboard-grid">
    <article class="panel tasks-panel">
      <h1>Dashboard</h1>
      <p>Todo task cards will be rendered here in the domain CRUD phase.</p>
    </article>

    <aside class="side-tools">
      <article class="panel">
        <h2>Priorities</h2>
        <p>Priority dropdown CRUD controls placeholder.</p>
      </article>

      <article class="panel">
        <h2>Categories</h2>
        <p>Category dropdown CRUD controls placeholder.</p>
      </article>
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
}

.panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 2fr minmax(240px, 320px);
  }
}
</style>
