const actions = [
  { label: "&#x1F4E4; Export Backup (JSON)", action: "export-json" },
  { label: "&#x1F4E5; Import Backup", action: "import-json" },
  { label: "&#x1F4C4; Export CSV", action: "export-csv" },
  { label: "&#x1F9F9; Fix Duplicates", action: "fix-duplicates" },
  { label: "&#x1F5D1; Reset All Data", action: "reset-data" }
];

export function renderToolsView() {
  return `
    <section class="card">
      <h2 class="section-title">Tools & Backup</h2>
      <div class="tools-list">
        ${actions
          .map((item) => `<button class="quick-btn" data-action="${item.action}">${item.label}</button>`)
          .join("")}
      </div>
    </section>
  `;
}
