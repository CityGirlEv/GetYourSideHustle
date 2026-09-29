import React from 'react';
import { PRODUCTS } from '../data/products';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const detailedItems = cartItems
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as Array<{ productId: string; quantity: number; product: typeof PRODUCTS[0] }>;

  const subtotal = detailedItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Check if Desk Pad is in cart for cross-sell recommendation
  const hasDeskPad = cartItems.some((item) => item.productId === 'prod-003');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-earth-espresso/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-earth-taupe text-earth-espresso shadow-2xl flex flex-col justify-between">
          {/* Cart Header */}
          <div className="p-6 border-b border-earth-taupe flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-earth-terracotta" />
              <h2 className="text-lg font-black tracking-tight uppercase">YOUR EXECUTION CART</h2>
            </div>
            <button onClick={onClose} className="p-2 text-earth-muted hover:text-earth-espresso cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {detailedItems.length === 0 ? (
              <div className="text-center py-12 text-earth-muted font-mono text-xs">
                Your cart is empty. Pick your uniform or desk pad to start.
              </div>
            ) : (
              detailedItems.map(({ product, quantity }) => (
                <div key={product.id} className="bg-white border border-earth-taupe rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
                  <div>
                    <h4 className="text-xs font-bold text-earth-espresso">{product.name}</h4>
                    <div className="text-xs font-mono text-earth-terracotta mt-0.5">${product.price.toFixed(2)}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-earth-taupe rounded-lg bg-earth-cream">
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                        className="p-1 text-earth-muted hover:text-earth-espresso cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-earth-espresso">{quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                        className="p-1 text-earth-muted hover:text-earth-espresso cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="text-earth-muted hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Cross-Sell Recommendation */}
            {!hasDeskPad && detailedItems.length > 0 && (
              <div className="bg-earth-terracotta-soft/80 border border-earth-terracotta/40 rounded-2xl p-4 mt-4">
                <div className="text-[10px] font-mono text-earth-terracotta uppercase font-bold mb-1">
                  RECOMMENDED ADD-ON
                </div>
                <div className="text-xs font-bold text-earth-espresso mb-1">
                  The "What's The Plan?" Daily Execution Desk Pad ($18.00)
                </div>
                <p className="text-[11px] text-earth-muted mb-3">
                  Pair your apparel uniform with your daily desk execution pad.
                </p>
                <button
                  onClick={() => onAddToCart('prod-003')}
                  className="w-full py-2.5 bg-earth-terracotta hover:bg-earth-terracotta-hover text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  + Add Desk Pad to Cart
                </button>
              </div>
            )}
          </div>

          {/* Cart Footer / Checkout */}
          {detailedItems.length > 0 && (
            <div className="p-6 border-t border-earth-taupe bg-white space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-earth-muted">Subtotal:</span>
                <span className="font-mono font-black text-earth-terracotta text-lg">${subtotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => alert('Demo Mode: Checkout process initiated. In production, redirects to Shopify / Stripe checkout.')}
                className="w-full py-4 bg-earth-terracotta hover:bg-earth-terracotta-hover text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-earth-terracotta/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Proceed To Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
