import { get, put } from "./db.js";
import { generateId, nowIso } from "./utils.js";

const BUDGET_STORE = "budget";
const BUDGET_ID = "main";

export const AD_COST_EUR = 17;
export const PACK_VALUE = 66;
export const PACK_COST = 60;

export async function getOrCreateBudget() {
  const existing = await get(BUDGET_STORE, BUDGET_ID);
  if (existing) {
    return existing;
  }

  const budget = {
    id: BUDGET_ID,
    balance: 0,
    spent: 0,
    purchases: []
  };

  await put(BUDGET_STORE, budget);
  return budget;
}

export async function getBalance() {
  const budget = await getOrCreateBudget();
  return budget.balance;
}

export async function setBalance(newBalance) {
  const budget = await getOrCreateBudget();
  budget.balance = Number(newBalance) || 0;
  await put(BUDGET_STORE, budget);
  return budget.balance;
}

export async function addPack() {
  const budget = await getOrCreateBudget();
  const purchase = {
    id: generateId(),
    type: "pack",
    amount: PACK_VALUE,
    cost: PACK_COST,
    createdAt: nowIso()
  };

  budget.balance += PACK_VALUE;
  budget.purchases.push(purchase);
  await put(BUDGET_STORE, budget);
  return purchase;
}

export async function deductForAd() {
  const budget = await getOrCreateBudget();
  budget.balance -= AD_COST_EUR;
  budget.spent += AD_COST_EUR;
  await put(BUDGET_STORE, budget);
  return { balance: budget.balance, spent: budget.spent };
}

export async function getPurchases() {
  const budget = await getOrCreateBudget();
  return [...budget.purchases].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function calculateAdsRemaining() {
  const budget = await getOrCreateBudget();
  return Math.floor(budget.balance / AD_COST_EUR);
}
