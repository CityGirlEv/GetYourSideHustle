import { describe, expect, it } from 'vitest';
import { INITIAL_INVENTORY_ITEMS } from '../inventoryPricing';
import {
  INVENTORY_PRICING_API_PATH,
  INVENTORY_PRICING_STORAGE_KEY,
  buildInventoryPricingStorePayload,
  parseInventoryPricingStorePayload,
} from '../inventoryPricingStore';

describe('inventoryPricingStore', () => {
  it('parses a shared inventory payload and drops invalid rows', () => {
    const payload = parseInventoryPricingStorePayload({
      items: [
        { id: 'inv-hat', name: 'Hat', type: 'Hat', price: 34.72, productCost: 13.84, fees: 7.79, taxes: 1.84 },
        { name: 'missing id' },
        null,
      ],
      updatedAt: '2026-09-15T12:00:00.000Z',
      updatedBy: 'evelyn3@cox.net',
    });
    expect(payload?.items).toHaveLength(1);
    expect(payload?.items[0]?.id).toBe('inv-hat');
    expect(payload?.updatedBy).toBe('evelyn3@cox.net');
    expect(parseInventoryPricingStorePayload(null)).toBeNull();
    expect(parseInventoryPricingStorePayload({ updatedAt: 'now' })).toBeNull();
  });

  it('builds a store payload with the current catalog', () => {
    const payload = buildInventoryPricingStorePayload(
      INITIAL_INVENTORY_ITEMS,
      'angela@myplannotmymood.com',
      new Date('2026-09-15T12:00:00.000Z'),
    );
    expect(payload.items).toHaveLength(INITIAL_INVENTORY_ITEMS.length);
    expect(payload.updatedAt).toBe('2026-09-15T12:00:00.000Z');
    expect(payload.updatedBy).toBe('angela@myplannotmymood.com');
    expect(INVENTORY_PRICING_API_PATH).toBe('/api/inventory-pricing');
    expect(INVENTORY_PRICING_STORAGE_KEY).toBe('myplan_inventory_pricing_v1');
  });
});
