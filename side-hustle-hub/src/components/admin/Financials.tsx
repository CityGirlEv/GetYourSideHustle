import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DollarSign,
  FileText,
  Paperclip,
  Plus,
  Receipt,
  Save,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { BusyOverlay, WaitIndicator, WaitLabel } from "../WaitFeedback";
import {
  BUDGET_CATEGORIES,
  EXPENSE_CATEGORIES,
  fetchFinancials,
  formatMoney,
  newFinancialId,
  saveFinancials,
  type FinancialFileMeta,
  type FinancialItem,
  type FinancialItemType,
} from "../../lib/gysh-financials";
import {
  deleteFinancialFile,
  getFinancialFile,
  openFinancialBlob,
  putFinancialFile,
} from "../../lib/gysh-financial-files";

type SubTab = "budget" | "expenses" | "contract";

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptyItem(type: FinancialItemType): FinancialItem {
  const now = new Date().toISOString();
  return {
    id: newFinancialId(type === "budget" ? "bud" : "exp"),
    type,
    title: "",
    category: type === "budget" ? BUDGET_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    amount: 0,
    date: todayIso(),
    notes: "",
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    receipts: [],
  };
}

function FileChip({
  file,
  onRemove,
}: {
  file: FinancialFileMeta;
  onRemove?: () => void;
}) {
  const open = async () => {
    const stored = await getFinancialFile(file.storedId || file.id);
    if (stored) openFinancialBlob(stored);
    else alert("File binary is only on the browser that uploaded it (IndexedDB). Metadata is saved in D1.");
  };
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        borderRadius: 8,
        background: "rgba(215,198,151,0.35)",
        border: "1px solid var(--border-color)",
        fontSize: "0.9375rem",
      }}
    >
      <button type="button" onClick={() => void open()} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--bronze)", display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Paperclip size={12} />
        {file.title || file.name}
      </button>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remove file" style={{ background: "none", border: 0, cursor: "pointer", color: "var(--text-primary)" }}>
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

function LineItemEditor({
  item,
  categories,
  onChange,
  onDelete,
  onUploadReceipt,
}: {
  item: FinancialItem;
  categories: readonly string[];
  onChange: (next: FinancialItem) => void;
  onDelete: () => void;
  onUploadReceipt: (files: FileList | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className="glass"
      style={{
        padding: 16,
        borderRadius: 14,
        display: "grid",
        gap: 10,
        background: "#fff",
        border: "1px solid var(--border-color)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 0.8fr 0.9fr auto", gap: 8, alignItems: "end" }}>
        <label style={{ display: "grid", gap: 4, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
          Title
          <input
            value={item.title}
            onChange={(e) => onChange({ ...item, title: e.target.value })}
            placeholder="Line item"
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-color)" }}
          />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
          Category
          <select
            value={item.category}
            onChange={(e) => onChange({ ...item, category: e.target.value })}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-color)" }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
          Amount
          <input
            type="number"
            step="0.01"
            value={item.amount}
            onChange={(e) => onChange({ ...item, amount: Number(e.target.value) || 0 })}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-color)" }}
          />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
          Date
          <input
            type="date"
            value={item.date}
            onChange={(e) => onChange({ ...item, date: e.target.value })}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-color)" }}
          />
        </label>
        <button type="button" className="btn" onClick={onDelete} title="Delete" style={{ padding: "8px 10px" }}>
          <Trash2 size={16} />
        </button>
      </div>
      <label style={{ display: "grid", gap: 4, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
        Notes
        <textarea
          value={item.notes}
          onChange={(e) => onChange({ ...item, notes: e.target.value })}
          rows={2}
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-color)", resize: "vertical" }}
        />
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <button type="button" className="btn" onClick={() => inputRef.current?.click()} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <Upload size={14} /> Upload receipt
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf,.png,.jpg,.jpeg,.webp,.heic"
          multiple
          hidden
          onChange={(e) => {
            onUploadReceipt(e.target.files);
            e.target.value = "";
          }}
        />
        {item.receipts.map((r) => (
          <FileChip
            key={r.id}
            file={r}
            onRemove={() => {
              void deleteFinancialFile(r.storedId || r.id);
              onChange({ ...item, receipts: item.receipts.filter((x) => x.id !== r.id) });
            }}
          />
        ))}
      </div>
    </div>
  );
}

export const Financials: React.FC = () => {
  const [sub, setSub] = useState<SubTab>("budget");
  const [items, setItems] = useState<FinancialItem[]>([]);
  const [contracts, setContracts] = useState<FinancialFileMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const contractInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFinancials();
      setItems(data.items ?? []);
      setContracts(data.contracts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load financials.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const budgetItems = useMemo(() => items.filter((i) => i.type === "budget"), [items]);
  const expenseItems = useMemo(() => items.filter((i) => i.type === "expense"), [items]);
  const budgetTotal = budgetItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const expenseTotal = expenseItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const patchItem = (id: string, next: FinancialItem) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...next, updatedAt: new Date().toISOString() } : i)));
  };

  const addItem = (type: FinancialItemType) => {
    setItems((prev) => [...prev, emptyItem(type)]);
  };

  const removeItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (target) {
      for (const r of target.receipts) void deleteFinancialFile(r.storedId || r.id);
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const uploadReceipts = async (item: FinancialItem, files: FileList | null) => {
    if (!files?.length) return;
    const nextReceipts = [...item.receipts];
    for (const file of Array.from(files)) {
      const id = newFinancialId("rcpt");
      const addedAt = new Date().toISOString();
      await putFinancialFile({
        fileId: id,
        itemId: item.id,
        scope: "receipt",
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        blob: file,
        addedAt,
      });
      nextReceipts.push({
        id,
        itemId: item.id,
        scope: "receipt",
        title: file.name,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        storedId: id,
        notes: "",
        addedAt,
      });
    }
    patchItem(item.id, { ...item, receipts: nextReceipts });
  };

  const uploadContracts = async (files: FileList | null) => {
    if (!files?.length) return;
    const next = [...contracts];
    for (const file of Array.from(files)) {
      const id = newFinancialId("ctr");
      const addedAt = new Date().toISOString();
      await putFinancialFile({
        fileId: id,
        itemId: null,
        scope: "contract",
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        blob: file,
        addedAt,
      });
      next.push({
        id,
        itemId: null,
        scope: "contract",
        title: "T + E — Partnership Contract",
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        storedId: id,
        notes: "",
        addedAt,
      });
    }
    setContracts(next);
  };

  const persist = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const data = await saveFinancials({ items, contracts });
      setItems(data.items ?? items);
      setContracts(data.contracts ?? contracts);
      setMessage("Financials saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const activeList = sub === "budget" ? budgetItems : expenseItems;
  const categories = sub === "budget" ? BUDGET_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div>
      <BusyOverlay
        active={loading || saving}
        message={loading ? "Loading financials…" : "Saving financials…"}
      />
      <div
        className="glass"
        style={{
          padding: 24,
          borderRadius: 16,
          marginBottom: 20,
          background: "linear-gradient(135deg, #ffffff, rgba(215,198,151,0.45))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", color: "var(--bronze)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <DollarSign size={22} /> Financials
            </h2>
            <p style={{ color: "var(--text-primary)", margin: 0, fontSize: "0.92rem" }}>
              Admin-only budget, expenses, receipts, and the T + E partnership contract.
            </p>
          </div>
          <button type="button" className="btn btn-primary" disabled={saving || loading} onClick={() => void persist()} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            {saving ? <WaitLabel>Saving…</WaitLabel> : <><Save size={16} /> Save all</>}
          </button>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
          <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(45,106,79,0.08)", minWidth: 140 }}>
            <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>Budget total</div>
            <strong style={{ color: "var(--text-primary)" }}>{formatMoney(budgetTotal)}</strong>
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(185,28,28,0.08)", minWidth: 140 }}>
            <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>Expenses total</div>
            <strong style={{ color: "var(--text-primary)" }}>{formatMoney(expenseTotal)}</strong>
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(215,198,151,0.45)", minWidth: 140 }}>
            <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>Net (budget − expenses)</div>
            <strong style={{ color: "var(--text-primary)" }}>{formatMoney(budgetTotal - expenseTotal)}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(
          [
            ["budget", "Budget", <Wallet size={16} key="b" />],
            ["expenses", "Expenses", <Receipt size={16} key="e" />],
            ["contract", "Contract", <FileText size={16} key="c" />],
          ] as const
        ).map(([id, label, icon]) => (
          <button
            key={id}
            type="button"
            className={`nav-link-btn ${sub === id ? "active" : ""}`}
            onClick={() => setSub(id)}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: "rgba(185,28,28,0.08)", color: "#991b1b", fontSize: "1rem" }}>
          {error}
        </div>
      )}
      {message && (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: "rgba(45,106,79,0.1)", color: "#1b4332", fontSize: "1rem" }}>
          {message}
        </div>
      )}

      {loading ? (
        <WaitIndicator message="Loading financials…" style={{ padding: 24, marginTop: 0 }} />
      ) : sub === "contract" ? (
        <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={18} style={{ color: "var(--bronze)" }} /> Partnership contract
          </h3>
          <p className="admin-page-lede" style={{ marginTop: 0 }}>
            Store the signed agreement between <strong>Tina Marie Barham</strong> and{" "}
            <strong>Evelyn Irving</strong>. Upload PDF or image copies here (admin only).
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => contractInputRef.current?.click()}
            style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 16 }}
          >
            <Upload size={16} /> Upload contract
          </button>
          <input
            ref={contractInputRef}
            type="file"
            accept=".pdf,image/*,.doc,.docx"
            multiple
            hidden
            onChange={(e) => {
              void uploadContracts(e.target.files);
              e.target.value = "";
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contracts.length === 0 && (
              <p style={{ color: "var(--text-primary)", fontSize: "1rem" }}>No contract files yet.</p>
            )}
            {contracts.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid var(--border-color)",
                  background: "#fff",
                }}
              >
                <FileChip file={c} />
                <input
                  value={c.title}
                  onChange={(e) =>
                    setContracts((prev) =>
                      prev.map((x) => (x.id === c.id ? { ...x, title: e.target.value } : x)),
                    )
                  }
                  placeholder="Document title"
                  style={{ flex: 1, minWidth: 180, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border-color)" }}
                />
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    void deleteFinancialFile(c.storedId || c.id);
                    setContracts((prev) => prev.filter((x) => x.id !== c.id));
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              {sub === "budget" ? <Wallet size={18} /> : <Receipt size={18} />}
              {sub === "budget" ? "Budget line items" : "Expense line items"}
              <span style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: "1rem" }}>
                ({formatMoney(sub === "budget" ? budgetTotal : expenseTotal)})
              </span>
            </h3>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => addItem(sub === "budget" ? "budget" : "expense")}
              style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
            >
              <Plus size={16} /> Add {sub === "budget" ? "budget" : "expense"}
            </button>
          </div>
          {activeList.length === 0 && (
            <p style={{ color: "var(--text-primary)" }}>No items yet — add your first line item.</p>
          )}
          {activeList.map((item) => (
            <LineItemEditor
              key={item.id}
              item={item}
              categories={categories}
              onChange={(next) => patchItem(item.id, next)}
              onDelete={() => removeItem(item.id)}
              onUploadReceipt={(files) => void uploadReceipts(item, files)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
