export function renderNamesView({ suggestions = [] }) {
  const chips = suggestions.length
    ? suggestions
        .map((name) => `<button class="name-chip" data-name="${name}">${name}</button>`)
        .join("")
    : '<p class="meta">No names available at the moment.</p>';

  return `
    <section class="card names-panel fade-in">
      <header>
        <h2 class="section-title">Names</h2>
        <p class="subtitle">Random Moroccan girl names for new ads</p>
      </header>
      <div class="names-actions">
        <button class="quick-btn" data-action="refresh-names">&#x21bb; Refresh</button>
        <p class="meta">Active ad names are excluded automatically.</p>
      </div>
      <div class="names-grid">
        ${chips}
      </div>
    </section>
  `;
}
