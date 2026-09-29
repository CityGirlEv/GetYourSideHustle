import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Package, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { confirmDelete } from '../lib/confirmDelete';
import { HEADER_CONTENT_OFFSET } from '../lib/headerClearance';
import {
  INITIAL_INVENTORY_ITEMS,
  INVENTORY_PRICING_INTRO,
  INVENTORY_PRICING_SPLIT_NOTE,
  INVENTORY_PRICING_TITLE,
  INVENTORY_TINT_STYLES,
  INVENTORY_TYPES,
  addInventoryItem,
  applyInventoryItemPatch,
  computeInventorySheet,
  createInventoryItem,
  formatInventoryMoney,
  parseInventoryMoney,
  removeInventoryItem,
  type InventoryEditableMoneyField,
  type InventoryItem,
  type InventoryItemPatch,
} from '../lib/inventoryPricing';
import {
  buildInventoryPricingStorePayload,
  fetchInventoryPricingStore,
  loadInventoryPricingFromStorage,
  saveInventoryPricingStore,
  saveInventoryPricingToStorage,
} from '../lib/inventoryPricingStore';

const MONEY_COLUMNS: Array<{ field: InventoryEditableMoneyField; label: string }> = [
  { field: 'price', label: 'Price' },
  { field: 'shipping', label: 'Shipping' },
  { field: 'productCost', label: 'Product Cost' },
  { field: 'fees', label: 'Fees' },
  { field: 'taxes', label: 'Taxes' },
];

function InventoryMoneyInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      id={id}
      aria-label={label}
      type="number"
      inputMode="decimal"
      min="0"
      step="0.01"
      value={Number.isFinite(value) ? value : 0}
      onChange={(event) => onChange(parseInventoryMoney(event.target.value))}
      onFocus={(event) => event.currentTarget.select()}
      className="w-full min-h-[44px] min-w-[5.5rem] px-2 rounded-lg border-2 border-[#1F1917]/20 bg-white text-right font-mono text-sm font-semibold text-[#1F1917] tabular-nums"
    />
  );
}

function CalculatedCell({ label, amount }: { label: string; amount: number }) {
  return (
    <span
      aria-label={label}
      aria-readonly="true"
      className="block min-h-[44px] px-2 py-2 rounded-lg bg-[#1F1917]/10 text-right font-mono text-sm font-black tabular-nums flex items-center justify-end"
    >
      {formatInventoryMoney(amount)}
    </span>
  );
}

export const InventoryPricingPage: React.FC<{
  embedded?: boolean;
  actorEmail?: string | null;
}> = ({ embedded = false, actorEmail = null }) => {
  const [items, setItems] = useState<InventoryItem[]>(() => loadInventoryPricingFromStorage());
  const [saveHint, setSaveHint] = useState('Edits save on this device and to the shared Admin sheet.');
  const saveTimer = useRef<number | null>(null);
  const skipRemoteApply = useRef(false);

  const persist = useCallback(
    (next: InventoryItem[]) => {
      const payload = buildInventoryPricingStorePayload(next, actorEmail ?? null);
      saveInventoryPricingToStorage(payload);
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void saveInventoryPricingStore(payload).then((result) => {
          if (result.ok && !result.skipped) {
            setSaveHint('Saved to the shared Admin sheet.');
            return;
          }
          if (result.skipped) {
            setSaveHint('Saved on this device. Shared database is not connected yet.');
            return;
          }
          setSaveHint(result.error || 'Could not save to the shared sheet.');
        });
      }, 500);
    },
    [actorEmail],
  );

  useEffect(() => {
    let cancelled = false;
    void fetchInventoryPricingStore().then((remote) => {
      if (cancelled || skipRemoteApply.current || !remote) return;
      setItems(remote.items);
      saveInventoryPricingToStorage(remote);
    });
    return () => {
      cancelled = true;
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  const updateItems = (next: InventoryItem[]) => {
    skipRemoteApply.current = true;
    setItems(next);
    persist(next);
  };

  const patchItem = (id: string, patch: InventoryItemPatch) => {
    updateItems(items.map((item) => (item.id === id ? applyInventoryItemPatch(item, patch) : item)));
  };

  const { lines, totals } = useMemo(() => computeInventorySheet(items), [items]);

  return (
    <div
      className={`bg-[#FAF8F5] ${embedded ? 'min-h-0' : `min-h-[60vh] ${HEADER_CONTENT_OFFSET}`}`}
      id="inventory-pricing-page"
      data-testid="inventory-pricing-page"
    >
      <section className="bg-[#1B365D] text-white border-b-4 border-[#C9A227] py-5 sm:py-6">
        <div className="max-w-none mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#C9A227] text-[#1B365D] text-[10px] font-mono font-black uppercase tracking-wider">
            <Package className="w-3.5 h-3.5" /> Admin only
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-serif font-black uppercase tracking-tight leading-tight">
            {INVENTORY_PRICING_TITLE}
          </h1>
          <p className="mt-2 text-sm text-white/90 font-semibold max-w-4xl">{INVENTORY_PRICING_INTRO}</p>
          <p className="mt-1 text-sm text-[#F0C419] font-black">{INVENTORY_PRICING_SPLIT_NOTE}</p>
          <p className="mt-2 text-xs text-white/75" data-testid="inventory-pricing-save-hint">
            {saveHint}
          </p>
        </div>
      </section>

      <div className="pt-4 pb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateItems(addInventoryItem(items, createInventoryItem()))}
            className="min-h-[44px] px-4 rounded-xl bg-[#EA580C] text-white text-xs font-black uppercase tracking-wide inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add item
          </button>
          <button
            type="button"
            onClick={() => {
              if (!confirmDelete()) return;
              updateItems(INITIAL_INVENTORY_ITEMS.map((item) => ({ ...item })));
            }}
            className="min-h-[44px] px-4 rounded-xl bg-white border-2 border-[#1F1917]/15 text-[#1F1917] text-xs font-black uppercase tracking-wide inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reset sheet
          </button>
        </div>

        <div className="overflow-x-auto border-2 border-[#1B365D] rounded-2xl bg-white">
          <table className="min-w-[1180px] w-full border-collapse text-sm">
            <caption className="sr-only">{INVENTORY_PRICING_TITLE}</caption>
            <thead className="bg-[#1B365D] text-white">
              <tr>
                <th scope="col" className="text-left px-3 py-3 font-black uppercase tracking-wide">
                  Item
                </th>
                <th scope="col" className="text-left px-2 py-3 font-black uppercase tracking-wide">
                  Type
                </th>
                {MONEY_COLUMNS.map((column) => (
                  <th key={column.field} scope="col" className="text-right px-2 py-3 font-black uppercase tracking-wide">
                    {column.label}
                  </th>
                ))}
                <th scope="col" className="text-right px-2 py-3 font-black uppercase tracking-wide bg-[#314E78]">
                  Revenue
                </th>
                <th scope="col" className="text-right px-2 py-3 font-black uppercase tracking-wide bg-[#314E78]">
                  Total Cost
                </th>
                <th scope="col" className="text-right px-2 py-3 font-black uppercase tracking-wide bg-[#314E78]">
                  Profit
                </th>
                <th scope="col" className="text-right px-2 py-3 font-black uppercase tracking-wide bg-[#314E78]">
                  70%
                </th>
                <th scope="col" className="text-right px-2 py-3 font-black uppercase tracking-wide bg-[#314E78]">
                  30%
                </th>
                <th scope="col" className="px-2 py-3">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const tint = INVENTORY_TINT_STYLES[line.tint];
                return (
                  <tr key={line.id} style={{ backgroundColor: tint.background, color: tint.color }}>
                    <td className="px-2 py-2 min-w-[16rem]">
                      <input
                        aria-label={`${line.name} name`}
                        value={line.name}
                        onChange={(event) => patchItem(line.id, { name: event.target.value })}
                        className="w-full min-h-[44px] px-3 rounded-lg border-2 border-[#1F1917]/20 bg-white text-[#1F1917] font-semibold"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        aria-label={`${line.name} type`}
                        value={line.type}
                        onChange={(event) =>
                          patchItem(line.id, {
                            type: event.target.value as InventoryItem['type'],
                          })
                        }
                        className="min-h-[44px] min-w-[6.5rem] px-2 rounded-lg border-2 border-[#1F1917]/20 bg-white text-[#1F1917] font-semibold"
                      >
                        {INVENTORY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </td>
                    {MONEY_COLUMNS.map((column) => (
                      <td key={column.field} className="px-1 py-2">
                        <InventoryMoneyInput
                          id={`${line.id}-${column.field}`}
                          label={`${line.name} ${column.label}`}
                          value={line[column.field]}
                          onChange={(value) => patchItem(line.id, { [column.field]: value })}
                        />
                      </td>
                    ))}
                    <td className="px-1 py-2">
                      <CalculatedCell label={`${line.name} revenue`} amount={line.revenue} />
                    </td>
                    <td className="px-1 py-2">
                      <CalculatedCell label={`${line.name} total cost`} amount={line.totalCost} />
                    </td>
                    <td className="px-1 py-2">
                      <CalculatedCell label={`${line.name} profit`} amount={line.profit} />
                    </td>
                    <td className="px-1 py-2">
                      <CalculatedCell label={`${line.name} Angela 70%`} amount={line.brandShare} />
                    </td>
                    <td className="px-1 py-2">
                      <CalculatedCell label={`${line.name} Evelyn 30%`} amount={line.hostShare} />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        aria-label={`Remove ${line.name}`}
                        onClick={() => {
                          if (!confirmDelete()) return;
                          updateItems(removeInventoryItem(items, line.id));
                        }}
                        className="min-h-[44px] min-w-[44px] rounded-lg bg-white/80 text-[#9A3412] inline-flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#1B365D] text-white font-black">
              <tr>
                <td className="px-3 py-3 uppercase" colSpan={7}>
                  Totals
                </td>
                <td className="px-2 py-3 text-right font-mono tabular-nums">{formatInventoryMoney(totals.revenue)}</td>
                <td className="px-2 py-3 text-right font-mono tabular-nums">{formatInventoryMoney(totals.totalCost)}</td>
                <td className="px-2 py-3 text-right font-mono tabular-nums">{formatInventoryMoney(totals.profit)}</td>
                <td className="px-2 py-3 text-right font-mono tabular-nums">{formatInventoryMoney(totals.brandShare)}</td>
                <td className="px-2 py-3 text-right font-mono tabular-nums">{formatInventoryMoney(totals.hostShare)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="text-xs text-[#3F3832] font-medium">
          Price, Shipping, Product Cost, Fees, and Taxes are editable. Revenue (Price + Shipping), Total Cost (Product
          Cost + Fees + Taxes), Profit, and the 70/30 split stay calculated.
        </p>
      </div>
    </div>
  );
};
