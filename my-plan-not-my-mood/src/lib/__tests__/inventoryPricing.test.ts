import { describe, expect, it } from 'vitest';
import {
  INITIAL_INVENTORY_ITEMS,
  INVENTORY_CALCULATED_FIELDS,
  addInventoryItem,
  applyInventoryItemPatch,
  type InventoryItemPatch,
  computeInventoryLine,
  computeInventorySheet,
  createInventoryItem,
  formatInventoryMoney,
  parseInventoryItem,
  parseInventoryMoney,
  removeInventoryItem,
  splitInventoryProfit,
} from '../inventoryPricing';

describe('inventoryPricing', () => {
  it('matches the inventory sheet calculations for each seeded row', () => {
    const letters2 = computeInventoryLine(INITIAL_INVENTORY_ITEMS[0]!);
    expect(letters2).toMatchObject({
      name: 'Unisex – Softstyle Letters2 Tee',
      revenue: 34.99,
      totalCost: 22.16,
      profit: 12.83,
      brandShare: 8.98,
      hostShare: 3.85,
    });

    const plus2x = computeInventoryLine(INITIAL_INVENTORY_ITEMS.find((item) => item.id === 'inv-softstyle-2x')!);
    expect(plus2x).toMatchObject({ revenue: 36.99, totalCost: 23.14, profit: 13.85, brandShare: 9.7, hostShare: 4.16 });

    const plus5x = computeInventoryLine(INITIAL_INVENTORY_ITEMS.find((item) => item.id === 'inv-softstyle-5x')!);
    expect(plus5x).toMatchObject({ revenue: 42.99, totalCost: 23.14, profit: 19.85, brandShare: 13.9, hostShare: 5.96 });

    const crystal = computeInventoryLine(INITIAL_INVENTORY_ITEMS.find((item) => item.id === 'inv-crystal-lemon-lime')!);
    expect(crystal).toMatchObject({ revenue: 47.94, totalCost: 36.11, profit: 11.83, brandShare: 8.28, hostShare: 3.55 });

    const crystalPlus = computeInventoryLine(INITIAL_INVENTORY_ITEMS.find((item) => item.id === 'inv-crystal-2x-4x')!);
    expect(crystalPlus).toMatchObject({
      revenue: 52.94,
      totalCost: 40.05,
      profit: 12.89,
      brandShare: 9.02,
      hostShare: 3.87,
    });

    const pink = computeInventoryLine(INITIAL_INVENTORY_ITEMS.find((item) => item.id === 'inv-tiedye-pink')!);
    expect(pink).toMatchObject({ revenue: 47.94, totalCost: 30.26, profit: 17.68, brandShare: 12.38, hostShare: 5.3 });

    const misc2x = computeInventoryLine(INITIAL_INVENTORY_ITEMS.find((item) => item.id === 'inv-tiedye-misc-2x')!);
    expect(misc2x).toMatchObject({ revenue: 52.94, totalCost: 30.26, profit: 22.68, brandShare: 15.88, hostShare: 6.8 });

    const hoodie = computeInventoryLine(INITIAL_INVENTORY_ITEMS.find((item) => item.id === 'inv-hoodie')!);
    expect(hoodie).toMatchObject({ revenue: 57.19, totalCost: 44.47, profit: 12.72, brandShare: 8.9, hostShare: 3.82 });

    const hoodie2xl = computeInventoryLine(INITIAL_INVENTORY_ITEMS.find((item) => item.id === 'inv-hoodie-2xl')!);
    expect(hoodie2xl).toMatchObject({
      revenue: 61.19,
      totalCost: 38.3,
      profit: 22.89,
      brandShare: 16.02,
      hostShare: 6.87,
    });

    const hat = computeInventoryLine(INITIAL_INVENTORY_ITEMS.find((item) => item.id === 'inv-hat')!);
    expect(hat).toMatchObject({ revenue: 34.72, totalCost: 23.47, profit: 11.25, brandShare: 7.88, hostShare: 3.38 });
  });

  it('recalculates revenue, total cost, profit, and 70/30 when editable amounts change', () => {
    const updated = applyInventoryItemPatch(INITIAL_INVENTORY_ITEMS[0]!, {
      name: 'Letters2 Tee — restock',
      price: 40,
      shipping: 5,
      productCost: 10,
      fees: 2,
      taxes: 3,
    });
    expect(updated.name).toBe('Letters2 Tee — restock');
    const line = computeInventoryLine(updated);
    expect(line.revenue).toBe(45);
    expect(line.totalCost).toBe(15);
    expect(line.profit).toBe(30);
    expect(line.brandShare).toBe(21);
    expect(line.hostShare).toBe(9);
    expect(splitInventoryProfit(30)).toEqual({ brand: 21, host: 9 });
  });

  it('keeps calculated fields out of patches and ignores stored profit on parse', () => {
    const patched = applyInventoryItemPatch(INITIAL_INVENTORY_ITEMS[0]!, {
      name: 'Keep calc',
      ...({ profit: 999, revenue: 1 } as InventoryItemPatch),
    });
    expect(computeInventoryLine(patched).profit).toBe(12.83);
    expect('profit' in patched).toBe(false);
    INVENTORY_CALCULATED_FIELDS.forEach((field) => {
      expect(field in patched).toBe(false);
    });

    const parsed = parseInventoryItem({
      id: 'inv-hat',
      name: 'Hat',
      type: 'Hat',
      price: '34.72',
      productCost: 13.84,
      fees: 7.79,
      taxes: 1.84,
      profit: 999,
      revenue: 1,
    });
    expect(parsed).toMatchObject({ id: 'inv-hat', name: 'Hat', price: 34.72, taxes: 1.84 });
    expect(parsed && 'profit' in parsed).toBe(false);
    expect(computeInventoryLine(parsed!).profit).toBe(11.25);
  });

  it('formats money, parses messy inputs, and adds or removes rows', () => {
    expect(formatInventoryMoney(12.83)).toBe('$12.83');
    expect(formatInventoryMoney(-1.5)).toBe('-$1.50');
    expect(parseInventoryMoney('$3.99')).toBe(3.99);
    expect(parseInventoryMoney('nope')).toBe(0);
    expect(parseInventoryMoney(-8)).toBe(0);

    const created = createInventoryItem(1);
    const withNew = addInventoryItem(INITIAL_INVENTORY_ITEMS, created);
    expect(withNew).toHaveLength(INITIAL_INVENTORY_ITEMS.length + 1);
    expect(addInventoryItem(withNew, created)).toHaveLength(withNew.length);
    expect(removeInventoryItem(withNew, created.id).some((item) => item.id === created.id)).toBe(false);
  });

  it('rolls sheet totals from the live calculated lines', () => {
    const { totals } = computeInventorySheet([
      { ...INITIAL_INVENTORY_ITEMS[0]!, price: 10, shipping: 0, productCost: 4, fees: 1, taxes: 1 },
      { ...INITIAL_INVENTORY_ITEMS[1]!, price: 10, shipping: 2, productCost: 3, fees: 1, taxes: 0 },
    ]);
    expect(totals).toEqual({ revenue: 22, totalCost: 10, profit: 12, brandShare: 8.4, hostShare: 3.6 });
  });
});
