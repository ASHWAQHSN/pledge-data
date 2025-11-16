const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

const STATUS_CLASS = {
  NEW: "chip status-new",
  ACTIVE: "chip status-active",
  EXPIRING: "chip status-expiring",
  EXPIRED: "chip status-expired"
};

export function renderAdsView({ activeAds = [], expiringAds = [], expiredAds = [], nowIso }) {
  const now = nowIso ? new Date(nowIso) : new Date();

  return `
    <div class="ads-header">
      <input
        type="search"
        class="ads-search"
        id="adsSearchInput"
        placeholder="Search ads or clients..."
        aria-label="Search ads or clients"
      />
    </div>
    ${renderSection("Active", activeAds, now)}
    ${renderSection("Expiring Soon", expiringAds, now)}
    ${renderSection("Expired", expiredAds, now)}
  `;
}

function renderSection(title, ads, now) {
  if (!ads.length) {
    return `
      <section class="ad-section">
        <h2 class="section-title">${title}</h2>
        <div class="card">
          <p>No ads in this state.</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="ad-section">
      <h2 class="section-title">${title}</h2>
      <div class="card">
        ${ads.map((ad) => renderAdItem(ad, now)).join("")}
      </div>
    </section>
  `;
}

function renderAdItem(ad, now) {
  const clientLabel = ad.clientName || ad.clientId || "Unknown Client";
  const createdLabel = ad.createdAt ? dateFormatter.format(new Date(ad.createdAt)) : "";
  const endLabel = ad.endAt ? dateFormatter.format(new Date(ad.endAt)) : "";
  const remaining = ad.endAt ? formatRemaining(now, new Date(ad.endAt)) : "";
  const status = ad.status || "ACTIVE";
  const statusClass = STATUS_CLASS[status] ?? "chip";

  return `
    <article class="ad-item" data-id="${ad.id}">
      <header>
        <h3>${ad.adName || "Untitled Ad"}</h3>
        <p class="client-name">${clientLabel}</p>
      </header>
      <p class="meta">Created ${createdLabel}</p>
      <p class="meta">Ends ${endLabel} ${remaining ? `- ${remaining}` : ""}</p>
      <div class="status-row">
        <span class="${statusClass}">${status}</span>
        <a class="chip" href="${ad.link || "#"}" target="_blank" rel="noopener">Open Ad</a>
      </div>
      <div class="actions-row">
        <button data-action="edit" data-id="${ad.id}">Edit</button>
        <button data-action="delete" data-id="${ad.id}">Delete</button>
        ${shouldShowRenew(status) ? `<button data-action="renew" data-id="${ad.id}">Renew +3d</button>` : ""}
      </div>
    </article>
  `;
}

function shouldShowRenew(status) {
  return status === "ACTIVE" || status === "NEW" || status === "EXPIRING";
}

function formatRemaining(now, endDate) {
  const diffMs = endDate.getTime() - now.getTime();
  if (diffMs <= 0) {
    return "Expired";
  }
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) {
    return `${hours}h left`;
  }
  const days = Math.ceil(hours / 24);
  return `${days}d left`;
}
