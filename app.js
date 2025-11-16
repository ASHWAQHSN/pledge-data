import * as Ads from "./core/ads.js";
import * as Clients from "./core/clients.js";
import * as Budget from "./core/budget.js";
import * as Analytics from "./core/analytics.js";
import { openDB, getAll, clearStore, put } from "./core/db.js";
import { nowIso, formatDateTime } from "./core/utils.js";
import { girlNames, getRandomNames } from "./core/names.js";

import { renderDashboard } from "./ui/dashboard-view.js";
import { renderAdsView } from "./ui/ads-view.js";
import { renderClientsView } from "./ui/clients-view.js";
import { renderBudgetView } from "./ui/budget-view.js";
import { renderAnalyticsView } from "./ui/analytics-view.js";
import { renderToolsView } from "./ui/tools-view.js";
import { renderNamesView } from "./ui/names-view.js";

// View order for swipe navigation
const viewOrder = [
  "dashboardView",
  "adsView",
  "clientsView",
  "budgetView",
  "analyticsView",
  "namesView",
  "toolsView"
];

const VIEW_IDS = viewOrder;

const viewLoaders = {
  dashboardView: loadDashboard,
  adsView: loadAds,
  clientsView: loadClients,
  budgetView: loadBudget,
  analyticsView: loadAnalytics,
  namesView: loadNames,
  toolsView: loadTools
};

const state = {
  ads: [],
  clients: [],
  budget: null,
  now: null
};

let currentViewId = "dashboardView";

const modalRoot = typeof document !== "undefined" ? document.getElementById("modalRoot") : null;

function openModal(contentHtml) {
  if (!modalRoot) return;
  modalRoot.innerHTML = contentHtml;
  modalRoot.classList.remove("hidden");
}

function closeModal() {
  if (!modalRoot) return;
  modalRoot.classList.add("hidden");
  modalRoot.innerHTML = "";
}

if (modalRoot) {
  modalRoot.addEventListener("click", (event) => {
    if (event.target === modalRoot) {
      closeModal();
    }
  });
}

let isBootstrapped = false;
let adsActionsBound = false;
let toolsActionsBound = false;
let namesActionsBound = false;
let analyticsCharts = [];
let isRefreshing = false;

document.addEventListener("DOMContentLoaded", () => {
  if ("Notification" in window) {
    try {
      Notification.requestPermission();
    } catch (error) {
      console.warn("Notification permission request failed", error);
    }
  }

  bootstrap()
    .then(() => {
      scanNotifications();
      setInterval(() => {
        safeRefreshAllCoreData()
          .then(() => scanNotifications())
          .catch((error) => console.error("Periodic refresh failed", error));
      }, 60 * 1000);
    })
    .catch((error) => console.error("Bootstrap failed", error));
});

async function bootstrap() {
  if (isBootstrapped) return;
  await openDB();
  await refreshAllCoreData();
  wireNavigation();
  wireSwipeGestures();
  await setActiveView("dashboardView");
  registerServiceWorker();
  isBootstrapped = true;
}

async function safeRefreshAllCoreData() {
  if (isRefreshing) return;
  isRefreshing = true;
  try {
    await refreshAllCoreData();
  } finally {
    isRefreshing = false;
  }
}

async function refreshAds() {
  state.ads = await Ads.listAllAds();
}

async function refreshClients() {
  state.clients = await Clients.listClients();
}

async function refreshBudget() {
  state.budget = await Budget.getOrCreateBudget();
}

async function refreshAllCoreData() {
  await Promise.all([refreshAds(), refreshClients(), refreshBudget()]);
  state.now = nowIso();
}

function updateNowTimestamp() {
  state.now = nowIso();
  return state.now;
}

function wireNavigation() {
  const buttons = document.querySelectorAll(".nav-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = btn.dataset.view;
      if (!target || target === currentViewId) {
        return;
      }

      // Determine direction based on view order
      const currentIdx = viewOrder.indexOf(currentViewId);
      const targetIdx = viewOrder.indexOf(target);
      const direction = targetIdx > currentIdx ? "right" : "left";

      await setActiveView(target, direction);
    });
  });
}

function wireSwipeGestures() {
  const appEl = document.getElementById("app");
  if (!appEl) return;

  let touchStartX = 0;
  let touchEndX = 0;

  appEl.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX = e.touches[0].clientX;
  });

  appEl.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches && e.changedTouches[0]
      ? e.changedTouches[0].clientX
      : touchStartX;
    handleSwipeGesture();
  });

  function handleSwipeGesture() {
    const deltaX = touchEndX - touchStartX;
    const threshold = 50; // px

    if (Math.abs(deltaX) < threshold) return;

    const swipeDirection = deltaX < 0 ? "left" : "right";

    const idx = viewOrder.indexOf(currentViewId);
    if (idx === -1) return;

    let targetIdx = idx;
    if (swipeDirection === "left" && idx < viewOrder.length - 1) {
      targetIdx = idx + 1;
    } else if (swipeDirection === "right" && idx > 0) {
      targetIdx = idx - 1;
    }

    if (targetIdx !== idx) {
      const targetViewId = viewOrder[targetIdx];
      // Invert direction for entrance animation
      const entranceDirection = swipeDirection === "left" ? "right" : "left";
      setActiveView(targetViewId, entranceDirection);
    }
  }
}

function getCurrentView() {
  return currentViewId;
}

async function setActiveView(viewId, direction = "right") {
  // Remove active classes from all views
  VIEW_IDS.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.classList.remove("view-active", "view-slide-in-left", "view-slide-in-right");
    section.classList.add("hidden");
  });

  // Activate target view
  const targetSection = document.getElementById(viewId);
  if (targetSection) {
    targetSection.classList.remove("hidden");
    targetSection.classList.add("view", "view-active");

    // Add directional slide animation
    if (direction === "left") {
      targetSection.classList.add("view-slide-in-left");
    } else if (direction === "right") {
      targetSection.classList.add("view-slide-in-right");
    }
  }

  // Update nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });

  // Update current view tracker
  currentViewId = viewId;

  // Trigger view loader
  const loader = viewLoaders[viewId];
  if (loader) {
    await loader();
  }
}

async function loadDashboard() {
  const container = document.getElementById("dashboardView");
  if (!container) return;

  const nowValue = updateNowTimestamp();
  const nowDate = new Date(nowValue);
  const oneDayMs = 24 * 60 * 60 * 1000;
  const startOfDay = new Date(nowDate);
  startOfDay.setHours(0, 0, 0, 0);

  const ads = state.ads;
  const nowMs = nowDate.getTime();
  const activeCount = ads.filter((ad) => new Date(ad.endAt).getTime() >= nowMs).length;
  const expiringCount = ads.filter((ad) => {
    const endMs = new Date(ad.endAt).getTime();
    return endMs >= nowMs && endMs <= nowMs + oneDayMs;
  }).length;
  const newCount = ads.filter((ad) => nowMs - new Date(ad.createdAt).getTime() < oneDayMs).length;
  const adsTodayCount = ads.filter((ad) => new Date(ad.createdAt) >= startOfDay).length;
  const totalRevenueDh = await Analytics.getTotalRevenue(undefined, ads);

  container.innerHTML = renderDashboard({
    activeCount,
    expiringCount,
    newCount,
    totalRevenueDh,
    adsTodayCount
  });

  bindDashboardActions(container);
}

// Search/filter helper for ads
function filterAdsByQuery(ads, clients, query) {
  if (!query) return ads;
  const q = query.toLowerCase().trim();
  if (!q) return ads;

  // Build map clientId -> clientName
  const clientMap = new Map();
  clients.forEach(c => {
    clientMap.set(c.id, (c.name || "").toLowerCase());
  });

  return ads.filter(ad => {
    const adName = (ad.adName || "").toLowerCase();
    const link = (ad.link || "").toLowerCase();
    const clientName = clientMap.get(ad.clientId) || "";
    return (
      adName.includes(q) ||
      link.includes(q) ||
      clientName.includes(q)
    );
  });
}

async function loadAds() {
  const container = document.getElementById("adsView");
  if (!container) return;

  const nowValue = updateNowTimestamp();
  renderAdsContent(state.ads, "");
  bindAdsSearch();
  bindAdsActions();
}

function renderAdsContent(ads, query = "") {
  const container = document.getElementById("adsView");
  if (!container) return;

  const nowValue = state.now || updateNowTimestamp();
  const nowDate = new Date(nowValue);
  const nowMs = nowDate.getTime();
  const thresholdMs = nowMs + 24 * 60 * 60 * 1000;
  const clientMap = new Map(state.clients.map((client) => [client.id, client]));

  // Filter ads by query
  const filteredAds = query ? filterAdsByQuery(ads, state.clients, query) : ads;

  const activeAds = [];
  const expiringAds = [];
  const expiredAds = [];

  filteredAds.forEach((ad) => {
    const endMs = new Date(ad.endAt).getTime();
    const status = Ads.getAdStatus(ad, nowValue).toUpperCase();
    const enriched = {
      ...ad,
      status,
      clientName: clientMap.get(ad.clientId)?.name ?? ad.clientId,
      createdLabel: formatDateTime(ad.createdAt)
    };

    if (endMs < nowMs) {
      expiredAds.push(enriched);
      return;
    }

    if (endMs <= thresholdMs) {
      expiringAds.push(enriched);
    } else {
      activeAds.push(enriched);
    }
  });

  container.innerHTML = renderAdsView({
    activeAds,
    expiringAds,
    expiredAds,
    nowIso: nowValue
  });
}

function bindAdsSearch() {
  const searchInput = document.getElementById("adsSearchInput");
  if (!searchInput) return;

  let lastQuery = "";
  searchInput.addEventListener("input", () => {
    const q = searchInput.value;
    if (q === lastQuery) return;
    lastQuery = q;

    window.requestAnimationFrame(() => {
      renderAdsContent(state.ads, q);
      bindAdsActions(); // Re-bind after re-render
    });
  });
}

function bindAdsActions() {
  if (adsActionsBound) return;
  const adsContainer = document.getElementById("adsView");
  if (!adsContainer) return;

  adsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const adId = button.dataset.id;
    if (!action || !adId) return;

    switch (action) {
      case "renew":
        handleRenewAd(adId);
        break;
      case "delete":
        handleDeleteAd(adId);
        break;
      default:
        break;
    }
  });

  adsActionsBound = true;
}

// Search/filter helper for clients
function filterClientsByQuery(clients, query) {
  if (!query) return clients;
  const q = query.toLowerCase().trim();
  if (!q) return clients;

  return clients.filter(c => {
    const name = (c.name || "").toLowerCase();
    const phone = (c.phone || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    return (
      name.includes(q) ||
      phone.includes(q) ||
      email.includes(q)
    );
  });
}

async function loadClients() {
  const container = document.getElementById("clientsView");
  if (!container) return;

  renderClientsContent(state.clients, "");
  bindClientsSearch();
  bindClientActions();
}

function renderClientsContent(clients, query = "") {
  const container = document.getElementById("clientsView");
  if (!container) return;

  const adCounts = state.ads.reduce((map, ad) => {
    map.set(ad.clientId, (map.get(ad.clientId) ?? 0) + 1);
    return map;
  }, new Map());

  // Filter clients by query
  const filteredClients = query ? filterClientsByQuery(clients, query) : clients;

  const enrichedClients = filteredClients.map((client) => ({
    ...client,
    adsCount: adCounts.get(client.id) ?? 0
  }));

  container.innerHTML = renderClientsView({ clients: enrichedClients });
}

function bindClientsSearch() {
  const searchInput = document.getElementById("clientsSearchInput");
  if (!searchInput) return;

  let lastQuery = "";
  searchInput.addEventListener("input", () => {
    const q = searchInput.value;
    if (q === lastQuery) return;
    lastQuery = q;

    window.requestAnimationFrame(() => {
      renderClientsContent(state.clients, q);
      bindClientActions(); // Re-bind after re-render
    });
  });
}

function bindClientActions() {
  const container = document.getElementById("clientsView");
  if (!container) return;

  // Bind "New Client" button
  const newBtn = container.querySelector("[data-action='add-client']");
  if (newBtn) {
    newBtn.addEventListener("click", () => {
      handleNewClient();
    });
  }
}

async function loadBudget() {
  const container = document.getElementById("budgetView");
  if (!container) return;

  if (!state.budget) {
    await refreshBudget();
  }

  const balance = state.budget?.balance ?? 0;
  const spent = state.budget?.spent ?? 0;
  const adsRemaining = Math.floor(balance / (Budget.AD_COST_EUR || 1));
  const purchases = state.budget?.purchases ?? [];

  container.innerHTML = renderBudgetView({
    balance,
    spent,
    adsRemaining,
    purchases
  });
}

async function loadAnalytics() {
  const container = document.getElementById("analyticsView");
  if (!container) return;

  const [monthlyRevenue, topClients, retention, dailyRevenue] = await Promise.all([
    Analytics.getMonthlyRevenue(undefined, state.ads),
    Analytics.getTopClients(undefined, undefined, state.ads, state.clients),
    Analytics.getRetentionStats(state.ads, state.clients),
    Analytics.getDailyRevenue(14, state.ads)
  ]);

  container.innerHTML = renderAnalyticsView({
    monthlyRevenue,
    topClients,
    retention,
    dailyRevenue
  });

  initAnalyticsCharts({ monthlyRevenue, topClients, dailyRevenue });
}

async function loadNames() {
  const container = document.getElementById("namesView");
  if (!container) return;

  updateNowTimestamp();
  const excluded = collectActiveAdNameSet();
  const suggestions = getRandomNames(excluded, 12);

  container.innerHTML = renderNamesView({ suggestions });
  bindNamesActions();
}

async function loadTools() {
  const container = document.getElementById("toolsView");
  if (!container) return;
  container.innerHTML = renderToolsView();
  bindToolsActions();
}

function bindDashboardActions(container) {
  const addAdBtn = container.querySelector('[data-action="add-ad"]');
  if (addAdBtn) {
    addAdBtn.onclick = () => handleNewAd();
  }

  const addClientBtn = container.querySelector('[data-action="add-client"]');
  if (addClientBtn) {
    addClientBtn.onclick = () => handleNewClient();
  }

  const addPackBtn = container.querySelector('[data-action="add-pack"]');
  if (addPackBtn) {
    addPackBtn.onclick = () => handleAddPack();
  }
}

function bindNamesActions() {
  if (namesActionsBound) return;
  const namesContainer = document.getElementById("namesView");
  if (!namesContainer) return;

  namesContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.dataset.action === "refresh-names") {
      updateNowTimestamp();
      const excluded = collectActiveAdNameSet();
      const suggestions = getRandomNames(excluded, 12);
      namesContainer.innerHTML = renderNamesView({ suggestions });
    }
  });

  namesActionsBound = true;
}

function bindToolsActions() {
  if (toolsActionsBound) return;
  const toolsContainer = document.getElementById("toolsView");
  if (!toolsContainer) return;

  toolsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;

    switch (action) {
      case "export-json":
        handleExportJson();
        break;
      case "import-json":
        handleImportJson();
        break;
      case "export-csv":
        handleExportCsv();
        break;
      case "fix-duplicates":
        handleFixDuplicates();
        break;
      case "reset-all":
        handleResetAll();
        break;
      default:
        break;
    }
  });

  toolsActionsBound = true;
}

function collectActiveAdNameSet() {
  const nowValue = state.now || nowIso();
  const nowMs = new Date(nowValue).getTime();
  return new Set(
    state.ads
      .filter((ad) => new Date(ad.endAt).getTime() >= nowMs)
      .map((ad) => (ad.adName || "").toLowerCase().trim())
      .filter(Boolean)
  );
}

async function handleNewAd() {
  if (!modalRoot) return;

  const clientsOptions = state.clients
    .map((client) => `<option value="${client.id}">${client.name}</option>`)
    .join("");

  const modalHtml = `
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">New Ad</div>
        <button class="modal-close-btn" data-modal-close>&times;</button>
      </div>
      <div class="modal-body">
        <label>
          Client
          <select id="newAdClient">
            <option value="">Select client</option>
            ${clientsOptions}
          </select>
        </label>
        <label>
          Or New Client Name
          <input id="newAdClientName" type="text" placeholder="Client name" />
        </label>
        <label>
          Ad Name
          <input id="newAdName" type="text" placeholder="Ad name" list="adNameSuggestions" />
          <datalist id="adNameSuggestions"></datalist>
        </label>
        <label>
          Ad Link
          <input id="newAdLink" type="url" placeholder="https://..." />
        </label>
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" data-modal-cancel>Cancel</button>
        <button class="btn-solid" data-modal-save>Save</button>
      </div>
    </div>
  `;

  openModal(modalHtml);

  const closeButtons = modalRoot.querySelectorAll("[data-modal-close],[data-modal-cancel]");
  closeButtons.forEach((btn) => btn.addEventListener("click", closeModal));

  const saveButton = modalRoot.querySelector("[data-modal-save]");
  if (!saveButton) {
    return;
  }

  const linkInput = modalRoot.querySelector("#newAdLink");
  if (linkInput) {
    linkInput.value = "https://ma.afribaba.com/casablanca/";
  }

  const adNameInput = modalRoot.querySelector("#newAdName");
  const datalist = modalRoot.querySelector("#adNameSuggestions");
  const clientSelect = modalRoot.querySelector("#newAdClient");
  const newClientInput = modalRoot.querySelector("#newAdClientName");

  const updateAdNameSuggestions = (clientId) => {
    if (!datalist || !adNameInput) return;
    const suggestions = [];
    const excluded = new Set();

    if (clientId) {
      const clientAds = state.ads
        .filter((ad) => ad.clientId === clientId && ad.adName)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      clientAds.slice(0, 3).forEach((ad) => {
        const trimmed = ad.adName.trim();
        if (trimmed && !excluded.has(trimmed.toLowerCase())) {
          suggestions.push(trimmed);
          excluded.add(trimmed.toLowerCase());
        }
      });
    }

    const randomNames = getRandomNames(excluded, 5);
    randomNames.forEach((name) => {
      suggestions.push(name);
      excluded.add(name.toLowerCase());
    });

    datalist.innerHTML = suggestions
      .map((name) => `<option value="${name}"></option>`)
      .join("");

    if (!adNameInput.value && suggestions.length) {
      adNameInput.value = suggestions[0];
    }
  };

  updateAdNameSuggestions(clientSelect?.value || null);

  clientSelect?.addEventListener("change", () => {
    if (clientSelect.value && newClientInput) {
      newClientInput.value = "";
    }
    updateAdNameSuggestions(clientSelect.value || null);
  });

  newClientInput?.addEventListener("input", () => {
    if (!clientSelect?.value) {
      updateAdNameSuggestions(null);
    }
  });

  saveButton.addEventListener("click", async () => {
    try {
      const clientSelect = modalRoot.querySelector("#newAdClient");
      const clientNameInput = modalRoot.querySelector("#newAdClientName");
      const adNameInput = modalRoot.querySelector("#newAdName");
      const adLinkInput = modalRoot.querySelector("#newAdLink");

      const selectedClientId = clientSelect?.value || "";
      const newClientName = clientNameInput?.value.trim() || "";
      const adName = adNameInput?.value.trim() || "";
      const link = adLinkInput?.value.trim() || "";

      if (!adName) {
        window.alert("Ad name is required.");
        return;
      }

      let finalClientId = selectedClientId;

      if (!finalClientId && newClientName) {
        const newClient = await Clients.addClient({ name: newClientName });
        await refreshClients();
        finalClientId = newClient.id;
        await loadClients();
      }

      if (!finalClientId) {
        window.alert("Please select or enter a client.");
        return;
      }

      await Ads.createAd({ clientId: finalClientId, adName, link });
      await Budget.deductForAd();
      await Promise.all([refreshAds(), refreshBudget()]);
      await Promise.all([loadDashboard(), loadAds(), loadBudget()]);
      closeModal();
    } catch (error) {
      console.error("Failed to create ad", error);
      window.alert("Unable to create ad. Please try again.");
    }
  });
}

async function handleNewClient() {
  if (!modalRoot) return;

  const modalHtml = `
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">New Client</div>
        <button class="modal-close-btn" data-modal-close>&times;</button>
      </div>
      <div class="modal-body">
        <label>
          Name
          <input id="newClientName" type="text" placeholder="Client name" list="clientNameSuggestions" />
          <datalist id="clientNameSuggestions"></datalist>
        </label>
        <label>
          Phone
          <input id="newClientPhone" type="tel" placeholder="+212..." />
        </label>
        <label>
          Email
          <input id="newClientEmail" type="email" placeholder="client@email.com" />
        </label>
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" data-modal-cancel>Cancel</button>
        <button class="btn-solid" data-modal-save>Save</button>
      </div>
    </div>
  `;

  openModal(modalHtml);

  const closeButtons = modalRoot.querySelectorAll("[data-modal-close],[data-modal-cancel]");
  closeButtons.forEach((btn) => btn.addEventListener("click", closeModal));

  const saveButton = modalRoot.querySelector("[data-modal-save]");
  const nameInput = modalRoot.querySelector("#newClientName");
  const datalist = modalRoot.querySelector("#clientNameSuggestions");

  const updateClientNameSuggestions = (value = "") => {
    if (!datalist) return;
    const lower = value.trim().toLowerCase();
    const matches = girlNames
      .filter((name) => (lower ? name.toLowerCase().startsWith(lower) : true))
      .slice(0, 10);
    datalist.innerHTML = matches.map((name) => `<option value="${name}"></option>`).join("");
  };

  updateClientNameSuggestions("");
  nameInput?.addEventListener("input", (event) => {
    updateClientNameSuggestions(event.target.value || "");
  });

  if (!saveButton) return;

  saveButton.addEventListener("click", async () => {
    try {
      const nameField = modalRoot.querySelector("#newClientName");
      const phoneInput = modalRoot.querySelector("#newClientPhone");
      const emailInput = modalRoot.querySelector("#newClientEmail");

      const name = nameField?.value.trim() || "";
      const phone = phoneInput?.value.trim() || "";
      const email = emailInput?.value.trim() || "";

      if (!name) {
        window.alert("Client name is required.");
        return;
      }

      await Clients.addClient({
        name,
        phone: phone || undefined,
        email: email || undefined
      });
      await refreshClients();
      await Promise.all([loadClients(), loadDashboard()]);
      closeModal();
    } catch (error) {
      console.error("Failed to add client", error);
      window.alert("Unable to add client.");
    }
  });
}

async function handleAddPack() {
  if (!modalRoot) return;

  const modalHtml = `
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">Add Pack</div>
        <button class="modal-close-btn" data-modal-close>&times;</button>
      </div>
      <div class="modal-body">
        <p class="meta">Adds ${Budget.PACK_VALUE} credits to balance for ${Budget.PACK_COST} EUR.</p>
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" data-modal-cancel>Cancel</button>
        <button class="btn-solid" data-modal-save>Add Pack</button>
      </div>
    </div>
  `;

  openModal(modalHtml);

  const closeButtons = modalRoot.querySelectorAll("[data-modal-close],[data-modal-cancel]");
  closeButtons.forEach((btn) => btn.addEventListener("click", closeModal));

  const saveButton = modalRoot.querySelector("[data-modal-save]");
  if (!saveButton) return;

  saveButton.addEventListener("click", async () => {
    try {
      await Budget.addPack();
      await refreshBudget();
      await Promise.all([loadBudget(), loadDashboard()]);
      closeModal();
    } catch (error) {
      console.error("Failed to add pack", error);
      window.alert("Unable to add pack.");
    }
  });
}

async function handleRenewAd(adId) {
  try {
    await Ads.renewAd(adId, 3);
    await refreshAds();
    updateNowTimestamp();
    await Promise.all([loadAds(), loadDashboard()]);
  } catch (error) {
    console.error("Failed to renew ad", error);
    window.alert("Unable to renew ad.");
  }
}

async function handleDeleteAd(adId) {
  try {
    const ok = window.confirm("Delete this ad?");
    if (!ok) return;
    await Ads.deleteAd(adId);
    await refreshAds();
    await Promise.all([loadAds(), loadDashboard()]);
  } catch (error) {
    console.error("Failed to delete ad", error);
    window.alert("Unable to delete ad.");
  }
}

async function handleExportJson() {
  try {
    const [ads, clients, budget, notes, ratings] = await Promise.all([
      getAll("ads"),
      getAll("clients"),
      getAll("budget"),
      getAll("notes"),
      getAll("ratings")
    ]);

    const backup = {
      ads,
      clients,
      budget,
      notes,
      ratings,
      createdAt: nowIso(),
      version: 1
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    downloadBlob(blob, "pledge-data-backup.json");
  } catch (error) {
    console.error("Failed to export backup", error);
    window.alert("Unable to export backup.");
  }
}

async function handleImportJson() {
  try {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      let backup;
      try {
        backup = JSON.parse(text);
      } catch (error) {
        console.error("Invalid backup file", error);
        window.alert("Invalid JSON backup.");
        return;
      }

      const ok = window.confirm("Importing will overwrite existing data. Continue?");
      if (!ok) return;

      await clearStore("ads");
      await clearStore("clients");
      await clearStore("budget");
      await clearStore("notes");
      await clearStore("ratings");

      for (const ad of backup.ads || []) {
        await put("ads", ad);
      }
      for (const client of backup.clients || []) {
        await put("clients", client);
      }
      for (const budgetRow of backup.budget || []) {
        await put("budget", budgetRow);
      }
      for (const note of backup.notes || []) {
        await put("notes", note);
      }
      for (const rating of backup.ratings || []) {
        await put("ratings", rating);
      }

      await refreshAllCoreData();
      await Promise.all([loadDashboard(), loadAds(), loadClients(), loadBudget(), loadAnalytics()]);
      window.alert("Backup imported successfully.");
    });
    input.click();
  } catch (error) {
    console.error("Failed to import backup", error);
    window.alert("Unable to import backup.");
  }
}

async function handleExportCsv() {
  try {
    const nowValue = nowIso();
    const header = ["ClientId", "AdName", "Link", "CreatedAt", "EndAt", "Status", "RenewedCount"];
    const rows = state.ads.map((ad) => {
      const status = Ads.getAdStatus(ad, nowValue);
      return [
        escapeCsvField(ad.clientId),
        escapeCsvField(ad.adName || ""),
        escapeCsvField(ad.link || ""),
        ad.createdAt,
        ad.endAt,
        status,
        ad.renewedCount ?? 0
      ].join(",");
    });

    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, "pledge-data-ads.csv");
  } catch (error) {
    console.error("Failed to export CSV", error);
    window.alert("Unable to export CSV.");
  }
}

async function handleFixDuplicates() {
  try {
    const merged = await Clients.mergeDuplicates();
    await Promise.all([refreshClients(), refreshAds()]);
    await Promise.all([loadClients(), loadAds(), loadDashboard()]);
    window.alert(`Merged ${merged} duplicate client record(s).`);
  } catch (error) {
    console.error("Failed to fix duplicates", error);
    window.alert("Unable to fix duplicates.");
  }
}

async function handleResetAll() {
  try {
    const ok = window.confirm(
      "This will delete all data (ads, clients, budget, notes, ratings). Continue?"
    );
    if (!ok) return;

    await clearStore("ads");
    await clearStore("clients");
    await clearStore("budget");
    await clearStore("notes");
    await clearStore("ratings");

    await refreshAllCoreData();
    await Promise.all([loadDashboard(), loadAds(), loadClients(), loadBudget(), loadAnalytics()]);
    window.alert("All data has been reset.");
  } catch (error) {
    console.error("Failed to reset data", error);
    window.alert("Unable to reset data.");
  }
}

function escapeCsvField(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("service-worker.js").catch((error) => {
    console.error("Service worker registration failed", error);
  });
}

function destroyAnalyticsCharts() {
  analyticsCharts.forEach((chart) => chart.destroy());
  analyticsCharts = [];
}

function initAnalyticsCharts({ monthlyRevenue, topClients, dailyRevenue }) {
  destroyAnalyticsCharts();
  if (typeof window === "undefined" || typeof window.Chart === "undefined") {
    return;
  }

  const ChartLib = window.Chart;
  const monthlyCanvas = document.getElementById("monthlyRevenueChart");
  const topClientsCanvas = document.getElementById("topClientsChart");
  const dailyCanvas = document.getElementById("dailyRevenueChart");

  if (monthlyCanvas) {
    const monthlyLabels = monthlyRevenue.length ? monthlyRevenue.map((entry) => entry.month) : ["No data"];
    const monthlyData = monthlyRevenue.length ? monthlyRevenue.map((entry) => entry.revenueDh) : [0];
    const chart = new ChartLib(monthlyCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: monthlyLabels,
        datasets: [
          {
            label: "Revenue (DH)",
            data: monthlyData,
            borderColor: "#CDAA00",
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
    analyticsCharts.push(chart);
  }

  if (topClientsCanvas) {
    const topLabels = topClients.length ? topClients.map((client) => client.clientName) : ["No data"];
    const topData = topClients.length ? topClients.map((client) => client.revenueDh) : [0];
    const chart = new ChartLib(topClientsCanvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: topLabels,
        datasets: [
          {
            label: "Revenue DH",
            backgroundColor: "#CDAA00",
            data: topData
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
    analyticsCharts.push(chart);
  }

  if (dailyCanvas) {
    const dailyLabels = dailyRevenue.length ? dailyRevenue.map((entry) => entry.date) : ["No data"];
    const dailyData = dailyRevenue.length ? dailyRevenue.map((entry) => entry.revenueDh) : [0];
    const chart = new ChartLib(dailyCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: dailyLabels,
        datasets: [
          {
            label: "DH",
            data: dailyData,
            borderColor: "#CDAA00",
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
    analyticsCharts.push(chart);
  }
}

function scanNotifications() {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const now = Date.now();
  const expiring = state.ads.filter((ad) => {
    const end = new Date(ad.endAt).getTime();
    return end > now && end - now < 24 * 60 * 60 * 1000;
  });

  if (expiring.length > 0) {
    new Notification("Ads expiring soon", {
      body: `${expiring.length} ad(s) ending within 24h`,
      icon: "./assets/icon-192.png"
    });
  }

  if (state.budget && state.budget.balance < Budget.AD_COST_EUR) {
    new Notification("Low balance", {
      body: "Your balance is below the price of one ad.",
      icon: "./assets/icon-192.png"
    });
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const newClients = state.clients.filter(
    (client) => (client.createdAt || "").slice(0, 10) === todayKey
  );

  if (newClients.length > 0) {
    new Notification("New Clients", {
      body: `${newClients.length} new client(s) today`,
      icon: "./assets/icon-192.png"
    });
  }
}
