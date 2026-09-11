import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import {
  MEMBERSHIP_MERCH_ITEMS,
  MERCH_TSHIRT_SIZES,
  merchItemCount,
  type MerchItemId,
  type MerchTshirtSize,
  type TierId,
} from "../lib/membership";

export type MerchChoiceSlot = MerchItemId | "";

type MembershipMerchChoiceProps = {
  tierId: TierId;
  choices: MerchChoiceSlot[];
  tshirtSizes?: (MerchTshirtSize | "")[];
  onChange: (choices: MerchChoiceSlot[]) => void;
  onTshirtSizesChange?: (sizes: (MerchTshirtSize | "")[]) => void;
  idPrefix?: string;
};

export function MembershipMerchChoice({
  tierId,
  choices,
  tshirtSizes: tshirtSizesProp,
  onChange,
  onTshirtSizesChange,
  idPrefix = "membership-signup-merch",
}: MembershipMerchChoiceProps) {
  const count = merchItemCount(tierId);
  const titleId = useId();
  const [sizeDialogIndex, setSizeDialogIndex] = useState<number | null>(null);
  const [internalSizes, setInternalSizes] = useState<(MerchTshirtSize | "")[]>(() =>
    Array.from({ length: Math.max(count, 0) }, () => ""),
  );
  const tshirtSizes = tshirtSizesProp ?? internalSizes;
  const setTshirtSizes = (sizes: (MerchTshirtSize | "")[]) => {
    if (onTshirtSizesChange) onTshirtSizesChange(sizes);
    else setInternalSizes(sizes);
  };

  useEffect(() => {
    if (sizeDialogIndex == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSizeDialogIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sizeDialogIndex]);

  if (count <= 0) return null;

  const syncedSizes = Array.from({ length: count }, (_, i) =>
    choices[i] === "tshirt" ? tshirtSizes[i] ?? "" : "",
  );

  const setSlot = (index: number, value: MerchItemId) => {
    const next = Array.from({ length: count }, (_, i) => choices[i] ?? "");
    next[index] = value;
    onChange(next);
    const nextSizes = Array.from({ length: count }, (_, i) =>
      next[i] === "tshirt" ? syncedSizes[i] ?? "" : "",
    );
    setTshirtSizes(nextSizes);
    if (value === "tshirt") {
      setSizeDialogIndex(index);
    } else if (sizeDialogIndex === index) {
      setSizeDialogIndex(null);
    }
  };

  const setSize = (index: number, size: MerchTshirtSize) => {
    const nextSizes = Array.from({ length: count }, (_, i) =>
      choices[i] === "tshirt" ? syncedSizes[i] ?? "" : "",
    );
    nextSizes[index] = size;
    setTshirtSizes(nextSizes);
    setSizeDialogIndex(null);
  };

  const dialogOpen = sizeDialogIndex != null && choices[sizeDialogIndex] === "tshirt";

  return (
    <div className="membership-merch-choice" data-testid="membership-merch-choice">
      <p className="membership-merch-choice__lead">
        {count === 1
          ? "Starter includes one GYSH merch item. Choose a T-shirt or hat."
          : "Pro and Elite include 2 GYSH merch items. Choose a T-shirt or hat for each."}
      </p>
      {Array.from({ length: count }, (_, index) => {
        const name = `${idPrefix}-${index}`;
        const selected = choices[index] ?? "";
        const size = syncedSizes[index] ?? "";
        return (
          <fieldset
            key={name}
            className="membership-merch-choice__set"
            data-testid={`membership-merch-item-${index}`}
          >
            <legend>{count === 1 ? "Included merch" : `Included merch — item ${index + 1}`}</legend>
            {MEMBERSHIP_MERCH_ITEMS.map((item) => {
              const inputId = `${name}-${item.id}`;
              return (
                <label key={item.id} htmlFor={inputId} className="membership-merch-choice__option">
                  <input
                    id={inputId}
                    type="radio"
                    name={name}
                    value={item.id}
                    checked={selected === item.id}
                    onChange={() => setSlot(index, item.id)}
                    data-testid={`${name}-${item.id}`}
                    required
                  />
                  {item.label}
                </label>
              );
            })}
            {selected === "tshirt" ? (
              <div className="membership-merch-choice__size-summary">
                <span data-testid={`${name}-size-label`}>
                  {size ? `Size: ${size}` : "Size needed"}
                </span>
                <button
                  type="button"
                  className="btn btn-outline membership-merch-choice__size-edit"
                  onClick={() => setSizeDialogIndex(index)}
                  data-testid={`${name}-size-open`}
                >
                  {size ? "Change size" : "Choose size"}
                </button>
              </div>
            ) : null}
          </fieldset>
        );
      })}

      {dialogOpen && sizeDialogIndex != null ? (
        <div
          className="membership-merch-size-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-testid="membership-merch-size-dialog"
          onClick={() => setSizeDialogIndex(null)}
        >
          <div
            className="membership-merch-size-dialog__card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="membership-merch-size-dialog__head">
              <h3 id={titleId}>Choose T-shirt size</h3>
              <button
                type="button"
                className="membership-merch-size-dialog__close"
                aria-label="Close"
                onClick={() => setSizeDialogIndex(null)}
                data-testid="membership-merch-size-close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="membership-merch-size-dialog__lead">
              Unisex fit. Pick the size we should ship for this GYSH T-shirt.
            </p>
            <div className="membership-merch-size-dialog__grid" role="group" aria-label="T-shirt sizes">
              {MERCH_TSHIRT_SIZES.map((size) => {
                const active = syncedSizes[sizeDialogIndex] === size;
                return (
                  <button
                    key={size}
                    type="button"
                    className={`membership-merch-size-dialog__size${active ? " is-active" : ""}`}
                    onClick={() => setSize(sizeDialogIndex, size)}
                    data-testid={`membership-merch-size-${size}`}
                    aria-pressed={active}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
