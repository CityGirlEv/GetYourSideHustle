import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import type { CartItemPayload } from "@/lib/cart-products";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  payload: CartItemPayload;
  quantity?: number;
  size?: "default" | "sm" | "lg";
  className?: string;
  disabled?: boolean;
  disabledReason?: string;
  showIcon?: boolean;
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function AddToCartButton({
  payload,
  quantity = 1,
  size = "sm",
  className,
  disabled = false,
  disabledReason,
  showIcon = true,
  label = "Add to Cart",
  onClick,
}: AddToCartButtonProps) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(payload);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick?.(event);
    if (disabled || inCart) return;
    addItem(payload, quantity);
  };

  return (
    <Button
      type="button"
      size={size}
      className={cn(
        "shrink-0 border-transparent",
        inCart
          ? "bg-emerald/15 text-emerald hover:bg-emerald/15 border-emerald/30"
          : "bg-emerald text-emerald-foreground hover:bg-emerald/90",
        disabled && "opacity-50 cursor-not-allowed hover:bg-emerald",
        className,
      )}
      disabled={disabled || inCart}
      title={disabled ? disabledReason : inCart ? "Already in cart" : undefined}
      aria-label={inCart ? `${label} — already in cart` : label}
      onClick={handleClick}
    >
      {showIcon ? <ShoppingCart className="h-4 w-4" aria-hidden /> : null}
      {inCart ? "In cart" : label}
    </Button>
  );
}
