const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "MAD",
  minimumFractionDigits: 0
});

export function renderAnalyticsView({
  monthlyRevenue = [],
  topClients = [],
  retention = {},
  dailyRevenue = []
}) {
  return `
    <section class="card fade-in">
      <div class="section-title">Monthly Revenue</div>
      <canvas id="monthlyRevenueChart"></canvas>
    </section>
    <section class="card fade-in">
      <div class="section-title">Top Clients</div>
      <canvas id="topClientsChart"></canvas>
    </section>
    <section class="card fade-in">
      <div class="section-title">Daily Revenue (14 days)</div>
      <canvas id="dailyRevenueChart"></canvas>
    </section>
    <section class="card">
      <h2 class="section-title">Revenue by Month</h2>
      <div class="analytics-list">
        ${monthlyRevenue.length ? monthlyRevenue.map(renderMonthRow).join("") : `<p>No revenue data yet.</p>`}
      </div>
    </section>
    <section class="card">
      <h2 class="section-title">Top Clients</h2>
      <div class="analytics-list">
        ${topClients.length ? topClients.map(renderClientRow).join("") : `<p>No clients ranked yet.</p>`}
      </div>
    </section>
    <section class="card retention-card">
      <h2 class="section-title">Retention</h2>
      ${renderRetention(retention)}
    </section>
  `;
}

function renderMonthRow(entry) {
  return `
    <div class="analytics-row">
      <span>${entry.month}</span>
      <strong>${currency.format(entry.revenueDh || 0)}</strong>
    </div>
  `;
}

function renderClientRow(client) {
  return `
    <div class="analytics-row">
      <div>
        <strong>${client.clientName || "Unknown"}</strong>
        <p class="meta">Ads: ${client.adsCount ?? 0}</p>
      </div>
      <strong>${currency.format(client.revenueDh || 0)}</strong>
    </div>
  `;
}

function renderRetention(stats = {}) {
  const retentionPercent = Math.round((stats.retentionRate ?? 0) * 100);
  const avgAds = typeof stats.avgAdsPerClient === "number" ? stats.avgAdsPerClient.toFixed(2) : "0.00";

  const entries = [
    { label: "Total Clients", value: stats.totalClients ?? 0 },
    { label: "Returning", value: stats.returningClients ?? 0 },
    { label: "One-timers", value: stats.oneTimeClients ?? 0 },
    { label: "Retention", value: `${retentionPercent}%` },
    { label: "Avg Ads/Client", value: avgAds }
  ];

  return `
    <div class="retention-grid">
      ${entries
        .map(
          (entry) => `
            <div class="retention-item">
              <p class="stat-label">${entry.label}</p>
              <p class="stat-value">${entry.value}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}
