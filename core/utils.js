export function generateId() {
  const timestamp = Date.now();
  const randomHex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  return `id_${timestamp}_${randomHex}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function addDays(iso, days) {
  const date = new Date(iso);
  date.setDate(date.getDate() + Number(days));
  return date.toISOString();
}

export function formatDateTime(iso) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  return formatter.format(new Date(iso));
}

export function daysBetween(startIso, endIso) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return (end - start) / (1000 * 60 * 60 * 24);
}
