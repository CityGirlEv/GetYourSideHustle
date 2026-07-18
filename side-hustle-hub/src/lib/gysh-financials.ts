/** Client API for GYSH Admin Financials (budget, expenses, contract docs). */

import { api } from "./api";

export type FinancialItemType = "budget" | "expense";

export type FinancialFileMeta = {
  id: string;
  itemId: string | null;
  scope: "receipt" | "contract";
  title: string;
  name: string;
  mimeType: string;
  size: number;
  storedId: string;
  notes: string;
  addedAt: string;
};

export type FinancialItem = {
  id: string;
  type: FinancialItemType;
  title: string;
  category: string;
  amount: number;
  date: string;
  notes: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  receipts: FinancialFileMeta[];
};

export type FinancialsPayload = {
  items: FinancialItem[];
  contracts: FinancialFileMeta[];
};

export function newFinancialId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(amount) ? amount : 0);
}

export async function fetchFinancials(): Promise<FinancialsPayload> {
  return api<FinancialsPayload>("financials");
}

export async function saveFinancials(payload: FinancialsPayload): Promise<FinancialsPayload> {
  return api<FinancialsPayload>("financials", {
    method: "PUT",
    body: payload,
  });
}

export const BUDGET_CATEGORIES = [
  "Marketing",
  "Software / Tools",
  "Content & Production",
  "Workshops / Events",
  "Legal / Admin",
  "Misc",
] as const;

export const EXPENSE_CATEGORIES = [
  "Ads",
  "Software",
  "Printing / Materials",
  "Travel",
  "Contractor",
  "Fees",
  "Misc",
] as const;
