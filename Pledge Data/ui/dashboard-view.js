const numberFormat = new Intl.NumberFormat("en-US");

export function renderDashboard({
  activeCount = 0,
  expiringCount = 0,
  newCount = 0,
  totalRevenueDh = 0,
  adsTodayCount = 0
}) {
  return `
    <header class="dashboard-header">
      <h1 class="section-title">Pledge Data</h1>
      <p class="subtitle">Today overview</p>
    </header>
    <div class="stats-grid">
      ${renderStatCard("Active Ads", activeCount)}
      ${renderStatCard("Expiring Soon", expiringCount)}
      ${renderStatCard("New Ads", newCount)}
      ${renderStatCard("Revenue Today", `${numberFormat.format(totalRevenueDh)} DH`)}
      ${renderStatCard("Ads Created Today", adsTodayCount)}
    </div>
    <section class="quick-actions card">
      <h2 class="section-title">Quick Actions</h2>
      <div class="quick-actions__buttons">
        <button class="quick-btn" data-action="add-ad">&#x2795; New Ad</button>
        <button class="quick-btn" data-action="add-client">&#x1F464; New Client</button>
        <button class="quick-btn" data-action="add-pack">&#x1F4E6; Add Pack</button>
      </div>
    </section>
  `;
}

function renderStatCard(label, value) {
  return `
    <article class="card stat-card">
      <p class="stat-label">${label}</p>
      <p class="stat-value">${value}</p>
    </article>
  `;
}
