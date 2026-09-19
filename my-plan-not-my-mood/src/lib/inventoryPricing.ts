import { GEAR_SALES_BRAND_SHARE, GEAR_SALES_HOST_SHARE } from './gearSalesSplit';

export const INVENTORY_PRICING_TITLE = 'Tee Shirt, Hoodie & Hat Inventory • Prices, Profit, Colors & Sizes';
export const INVENTORY_PRICING_INTRO =
  'Sales prices are populated. Prices subject to change at any time. Enter Shipping, Product Cost, Fees, and Taxes.';
export const INVENTORY_PRICING_SPLIT_NOTE = 'Net Profit is split 70% Angela / 30% Evelyn.';

export const INVENTORY_TYPES = ['Tee', 'Hoodie', 'Hat'] as const;
export type InventoryType = (typeof INVENTORY_TYPES)[number];

export const INVENTORY_TINTS = [
  'softstyle',
  'softstyle-plus',
  'crystal',
  'crystal-plus',
  'tiedye',
  'tiedye-plus',
  'hoodie',
  'hoodie-plus',
  'hat',
] as const;
export type InventoryTint = (typeof INVENTORY_TINTS)[number];

export const INVENTORY_EDITABLE_MONEY_FIELDS = ['price', 'shipping', 'productCost', 'fees', 'taxes'] as const;
export type InventoryEditableMoneyField = (typeof INVENTORY_EDITABLE_MONEY_FIELDS)[number];

export const INVENTORY_CALCULATED_FIELDS = ['revenue', 'totalCost', 'profit', 'brandShare', 'hostShare'] as const;
export type InventoryCalculatedField = (typeof INVENTORY_CALCULATED_FIELDS)[number];

export interface InventoryItem {
  id: string;
  name: string;
  type: InventoryType;
  tint: InventoryTint;
  price: number;
  shipping: number;
  productCost: number;
  fees: number;
  taxes: number;
}

export interface InventoryLine extends InventoryItem {
  revenue: number;
  totalCost: number;
  profit: number;
  brandShare: number;
  hostShare: number;
}

export interface InventorySheetTotals {
  revenue: number;
  totalCost: number;
  profit: number;
  brandShare: number;
  hostShare: number;
}

export type InventoryItemPatch = Partial<
  Pick<InventoryItem, 'name' | 'type' | 'tint' | InventoryEditableMoneyField>
>;

function roundCents(value: number): number {
  return Math.round(Number(value.toFixed(8)) * 100) / 100;
}

export function parseInventoryMoney(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return roundCents(Math.max(0, value));
  if (typeof value !== 'string') return 0;
  const parsed = Number.parseFloat(value.replace(/[$,\s]/g, ''));
  if (!Number.isFinite(parsed)) return 0;
  return roundCents(Math.max(0, parsed));
}

export function formatInventoryMoney(amount: number): string {
  const value = Number.isFinite(amount) ? roundCents(amount) : 0;
  const negative = value < 0;
  const formatted = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${negative ? '-' : ''}$${formatted}`;
}

export function isInventoryType(value: unknown): value is InventoryType {
  return typeof value === 'string' && (INVENTORY_TYPES as readonly string[]).includes(value);
}

export function isInventoryTint(value: unknown): value is InventoryTint {
  return typeof value === 'string' && (INVENTORY_TINTS as readonly string[]).includes(value);
}

export function tintForInventoryType(type: InventoryType): InventoryTint {
  if (type === 'Hoodie') return 'hoodie';
  if (type === 'Hat') return 'hat';
  return 'softstyle';
}

export function splitInventoryProfit(profit: number): { brand: number; host: number } {
  const profitCents = Math.round(roundCents(profit) * 100);
  const brand = Math.round((profitCents * Math.round(GEAR_SALES_BRAND_SHARE * 100)) / 100) / 100;
  const host = Math.round((profitCents * Math.round(GEAR_SALES_HOST_SHARE * 100)) / 100) / 100;
  return { brand, host };
}

export function computeInventoryLine(item: InventoryItem): InventoryLine {
  const price = parseInventoryMoney(item.price);
  const shipping = parseInventoryMoney(item.shipping);
  const productCost = parseInventoryMoney(item.productCost);
  const fees = parseInventoryMoney(item.fees);
  const taxes = parseInventoryMoney(item.taxes);
  const revenue = roundCents(price + shipping);
  const totalCost = roundCents(productCost + fees + taxes);
  const profit = roundCents(revenue - totalCost);
  const { brand, host } = splitInventoryProfit(profit);
  return {
    ...item,
    price,
    shipping,
    productCost,
    fees,
    taxes,
    revenue,
    totalCost,
    profit,
    brandShare: brand,
    hostShare: host,
  };
}

export function computeInventorySheet(items: InventoryItem[]): {
  lines: InventoryLine[];
  totals: InventorySheetTotals;
} {
  const lines = items.map(computeInventoryLine);
  const totals = lines.reduce<InventorySheetTotals>(
    (sum, line) => ({
      revenue: roundCents(sum.revenue + line.revenue),
      totalCost: roundCents(sum.totalCost + line.totalCost),
      profit: roundCents(sum.profit + line.profit),
      brandShare: roundCents(sum.brandShare + line.brandShare),
      hostShare: roundCents(sum.hostShare + line.hostShare),
    }),
    { revenue: 0, totalCost: 0, profit: 0, brandShare: 0, hostShare: 0 },
  );
  return { lines, totals };
}

export function applyInventoryItemPatch(item: InventoryItem, patch: InventoryItemPatch): InventoryItem {
  const next: InventoryItem = { ...item };
  if (typeof patch.name === 'string') next.name = patch.name;
  if (isInventoryType(patch.type)) next.type = patch.type;
  if (isInventoryTint(patch.tint)) next.tint = patch.tint;
  for (const field of INVENTORY_EDITABLE_MONEY_FIELDS) {
    if (patch[field] !== undefined) next[field] = parseInventoryMoney(patch[field]);
  }
  return next;
}

export function createInventoryItem(now = Date.now()): InventoryItem {
  return {
    id: `inv-custom-${now}`,
    name: 'New item',
    type: 'Tee',
    tint: 'softstyle',
    price: 0,
    shipping: 0,
    productCost: 0,
    fees: 0,
    taxes: 0,
  };
}

export function addInventoryItem(items: InventoryItem[], item: InventoryItem): InventoryItem[] {
  if (items.some((existing) => existing.id === item.id)) return items;
  return [...items, item];
}

export function removeInventoryItem(items: InventoryItem[], id: string): InventoryItem[] {
  return items.filter((item) => item.id !== id);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function parseInventoryItem(value: unknown): InventoryItem | null {
  if (!isRecord(value)) return null;
  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const name = typeof value.name === 'string' ? value.name : '';
  if (!id) return null;
  const type = isInventoryType(value.type) ? value.type : 'Tee';
  const tint = isInventoryTint(value.tint) ? value.tint : tintForInventoryType(type);
  return {
    id,
    name,
    type,
    tint,
    price: parseInventoryMoney(value.price),
    shipping: parseInventoryMoney(value.shipping),
    productCost: parseInventoryMoney(value.productCost),
    fees: parseInventoryMoney(value.fees),
    taxes: parseInventoryMoney(value.taxes),
  };
}

export function parseInventoryItems(value: unknown): InventoryItem[] | null {
  if (!Array.isArray(value)) return null;
  return value.map(parseInventoryItem).filter((item): item is InventoryItem => Boolean(item));
}

function seedRow(
  id: string,
  name: string,
  type: InventoryType,
  tint: InventoryTint,
  price: number,
  productCost: number,
  fees: number,
  taxes: number,
): InventoryItem {
  return { id, name, type, tint, price, shipping: 0, productCost, fees, taxes };
}

/** Seeded from Angela’s inventory price sheet (sales, product cost, fees, taxes). */
export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  seedRow('inv-softstyle-letters2', 'Unisex – Softstyle Letters2 Tee', 'Tee', 'softstyle', 34.99, 16.05, 3.99, 2.12),
  seedRow('inv-softstyle-checkbox', 'Unisex – Softstyle Checkbox Tee', 'Tee', 'softstyle', 34.99, 16.05, 3.99, 2.12),
  seedRow('inv-softstyle-gold-frame', 'Unisex – Softstyle Gold Frame Tee', 'Tee', 'softstyle', 34.99, 16.05, 3.99, 2.12),
  seedRow('inv-softstyle-black-frame', 'Unisex – Softstyle Black Frame Tee', 'Tee', 'softstyle', 34.99, 16.05, 3.99, 2.12),
  seedRow(
    'inv-softstyle-letters2-5colors',
    'Unisex – Softstyle Letters2 Tee 5 Colors',
    'Tee',
    'softstyle',
    34.99,
    16.05,
    3.99,
    2.12,
  ),
  seedRow('inv-softstyle-2x', 'Unisex – Softstyle (2X)', 'Tee', 'softstyle-plus', 36.99, 17.64, 3.99, 1.51),
  seedRow('inv-softstyle-3x', 'Unisex – Softstyle (3X)', 'Tee', 'softstyle-plus', 38.99, 17.64, 3.99, 1.51),
  seedRow('inv-softstyle-4x', 'Unisex – Softstyle (4X)', 'Tee', 'softstyle-plus', 40.99, 17.64, 3.99, 1.51),
  seedRow('inv-softstyle-5x', 'Unisex – Softstyle (5X)', 'Tee', 'softstyle-plus', 42.99, 17.64, 3.99, 1.51),
  seedRow(
    'inv-crystal-lemon-lime',
    'Tie-Dye – Crystal Lemon Lime Tee (XS-XL)',
    'Tee',
    'crystal',
    47.94,
    27.72,
    4.49,
    3.9,
  ),
  seedRow(
    'inv-crystal-planet-earth',
    'Tie-Dye – Crystal Planet Earth Tee (XS-XL)',
    'Tee',
    'crystal',
    47.94,
    27.72,
    4.49,
    3.9,
  ),
  seedRow(
    'inv-crystal-black-teal',
    'Tie-Dye – Crystal Black Teal Tee (XS-XL)',
    'Tee',
    'crystal',
    47.94,
    27.72,
    4.49,
    3.9,
  ),
  seedRow('inv-crystal-teal', 'Tie-Dye – Crystal Teal Tee (XS-XL)', 'Tee', 'crystal', 47.94, 27.72, 4.49, 3.9),
  seedRow('inv-crystal-2x-4x', 'Tie-Dye – Crystal (2X-4X)', 'Tee', 'crystal-plus', 52.94, 31.24, 4.49, 4.32),
  seedRow('inv-tiedye-pink', 'Tie-Dye – Pink Tee', 'Tee', 'tiedye', 47.94, 23.27, 3.99, 3),
  seedRow('inv-tiedye-coral-yellow', 'Tie-Dye – Coral Yellow Tee', 'Tee', 'tiedye', 47.94, 23.27, 3.99, 3),
  seedRow('inv-tiedye-coral', 'Tie-Dye – Coral Tee', 'Tee', 'tiedye', 47.94, 23.27, 3.99, 3),
  seedRow('inv-tiedye-cyclone', 'Tie-Dye – Cyclone Tee', 'Tee', 'tiedye', 47.94, 23.27, 3.99, 3),
  seedRow('inv-tiedye-misc-2x', 'Tie-Dye – Misc (2X)', 'Tee', 'tiedye-plus', 52.94, 23.27, 3.99, 3),
  seedRow('inv-hoodie', 'Hoodie (Personalized)', 'Hoodie', 'hoodie', 57.19, 32.19, 8.79, 3.49),
  seedRow('inv-hoodie-2xl', 'Hoodie (Personalized) (2XL)', 'Hoodie', 'hoodie-plus', 61.19, 26.5, 8.79, 3.01),
  seedRow('inv-hat', 'Hat', 'Hat', 'hat', 34.72, 13.84, 7.79, 1.84),
];

export const INVENTORY_TINT_STYLES: Record<InventoryTint, { background: string; color: string }> = {
  softstyle: { background: '#F4A07A', color: '#1F1917' },
  'softstyle-plus': { background: '#E07A4A', color: '#1F1917' },
  crystal: { background: '#F0C419', color: '#1F1917' },
  'crystal-plus': { background: '#E0B410', color: '#1F1917' },
  tiedye: { background: '#4F83C7', color: '#FFFFFF' },
  'tiedye-plus': { background: '#2F5FA0', color: '#FFFFFF' },
  hoodie: { background: '#86C44A', color: '#1F1917' },
  'hoodie-plus': { background: '#5A9A2E', color: '#FFFFFF' },
  hat: { background: '#D08AD8', color: '#1F1917' },
};
