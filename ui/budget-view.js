const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0
});

export function renderBudgetView({ balance = 0, spent = 0, adsRemaining = 0, purchases = [] }) {
  return `
    <section class="card budget-summary">
      <h2 class="section-title">Budget</h2>
      <p class="stat-label">Balance</p>
      <p class="stat-value">${currency.format(balance)}</p>
      <p class="stat-label">Ads Remaining</p>
      <p class="stat-value">${adsRemaining}</p>
      <p class="stat-label">Total Spent</p>
      <p class="stat-value">${currency.format(spent)}</p>
      <button class="quick-btn" data-action="add-pack">&#x1F4E6; Add Pack</button>
    </section>
    <section class="card budget-history">
      <h2 class="section-title">Purchase History</h2>
      <div class="budget-history__list">
        ${purchases.length ? purchases.map(renderPurchaseRow).join("") : `<p>No purchases recorded.</p>`}
      </div>
    </section>
  `;
}

function renderPurchaseRow(purchase) {
  const created = purchase.createdAt ? new Date(purchase.createdAt).toLocaleString() : "";
  return `
    <div class="purchase-row">
      <div>
        <strong>${purchase.type || "pack"}</strong>
        <p class="meta">${created}</p>
      </div>
      <div class="purchase-row__figures">
        <span>${purchase.amount ?? 0}</span>
        <span>${currency.format(purchase.cost ?? 0)}</span>
      </div>
    </div>
  `;
}
