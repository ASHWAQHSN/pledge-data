const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit"
});

export function renderClientsView({ clients = [] }) {
  return `
    <div class="clients-toolbar">
      <input
        type="search"
        id="clientsSearchInput"
        placeholder="Search clients..."
        aria-label="Search clients"
      />
      <button class="btn-solid" data-action="add-client">New</button>
    </div>
    <div class="client-list">
      ${clients.map(renderClientCard).join("") || emptyState()}
    </div>
  `;
}

function renderClientCard(client) {
  const createdLabel = client.createdAt ? dateFormatter.format(new Date(client.createdAt)) : "";
  const lastActiveLabel = client.lastActiveAt ? dateFormatter.format(new Date(client.lastActiveAt)) : null;
  const returning = (client.adsCount ?? 0) > 1;

  return `
    <article class="card client-card" data-client-id="${client.id}">
      <header class="client-card__header">
        <strong>${client.name || "Unnamed client"}</strong>
        <span class="chip returning-chip" data-returning="${returning}">${returning ? "Returning" : "New"}</span>
      </header>
      ${client.phone ? `<p class="client-contact">&#x1F4DE; ${client.phone}</p>` : ""}
      ${client.email ? `<p class="client-contact">&#x2709; ${client.email}</p>` : ""}
      <p class="meta">Joined ${createdLabel}</p>
      ${lastActiveLabel ? `<p class="meta">Last Activity ${lastActiveLabel}</p>` : ""}
      <p class="meta">Ads: ${client.adsCount ?? 0}</p>
    </article>
  `;
}

function emptyState() {
  return `
    <div class="card">
      <p>No clients yet. Add your first client to get started.</p>
    </div>
  `;
}
