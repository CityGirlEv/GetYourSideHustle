import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../data/products';
import { GEAR_BRAND_PRICING_NOTE } from '../lib/gearSelections';
import {
  SHOPIFY_BUY_LABEL,
  SHOPIFY_GEAR_EMPTY,
  emptyShopifyGearSections,
  fetchShopifyGearCatalog,
  isPublishableStorefrontImage,
  shopifyCatalogProducts,
  type ShopifyGearKind,
  type ShopifyGearSection,
} from '../lib/shopifyStore';
import { ShoppingBag, Check, Sparkles } from 'lucide-react';
import { ComingSoonBadge } from './ComingSoonBadge';
import { plannerAddToCartIsEnabled } from '../lib/accessories';

type HomeGearTab = 'all' | ShopifyGearKind | 'planners';

interface ProductGridProps {
  onAddToCart: (productId: string) => void;
  shopFilter?: 'all' | 'planners' | 'gear';
  pageVariant?: 'embedded' | 'planners';
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  onAddToCart,
  shopFilter = 'all',
  pageVariant = 'embedded',
}) => {
  const [selectedCollection, setSelectedCollection] = useState<HomeGearTab>('all');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [sections, setSections] = useState<ShopifyGearSection[]>(() => emptyShopifyGearSections());
  const [catalogReady, setCatalogReady] = useState(false);

  const isPlannersPage = pageVariant === 'planners';

  useEffect(() => {
    if (isPlannersPage) {
      setSelectedCollection('planners');
      return;
    }
    if (shopFilter === 'planners') setSelectedCollection('planners');
    else setSelectedCollection('all');
  }, [shopFilter, isPlannersPage]);

  useEffect(() => {
    if (pageVariant !== 'embedded') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pageVariant]);

  useEffect(() => {
    if (isPlannersPage) return;
    let cancelled = false;
    void fetchShopifyGearCatalog().then((result) => {
      if (cancelled) return;
      setSections(result.sections);
      setCatalogReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [isPlannersPage]);

  const gearCollectionTabs: Array<{ id: HomeGearTab; label: string }> = [
    { id: 'all', label: 'All Gear' },
    { id: 'tee', label: 'Tees' },
    { id: 'hoodie', label: 'Hoodies' },
    { id: 'hat', label: 'Hats' },
  ];

  const collectionTabs = isPlannersPage
    ? [{ id: 'planners' as const, label: 'Planners & Desk Pads' }]
    : [...gearCollectionTabs, { id: 'planners' as const, label: 'Planners & Desk Pads' }];

  const showingPlanners = selectedCollection === 'planners';
  const plannerProducts = PRODUCTS.filter((product) => product.collection === 'planners');
  const gearProducts = shopifyCatalogProducts(
    sections,
    selectedCollection === 'all' || selectedCollection === 'planners' ? 'all' : selectedCollection,
  );

  const handleAdd = (id: string) => {
    onAddToCart(id);
    setAddedIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [id]: false }));
    }, 1500);
  };

  return (
    <section
      id={isPlannersPage ? 'planners-page' : 'products'}
      className="py-16 bg-[#FAF8F5]"
      data-testid={isPlannersPage ? 'planners-grid' : 'home-product-grid'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#FFEDD5] text-[#1F1917] text-xs font-black uppercase tracking-wider border border-[#C2410C]/30 shadow-sm mb-3">
            <Sparkles className="w-4 h-4 text-[#C2410C]" />
            {isPlannersPage
              ? 'Planners & Desk Execution Tools'
              : 'Accountability Gear'}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#1F1917] uppercase tracking-tight">
            {isPlannersPage
              ? 'PLANNERS & DESK PADS'
              : 'THE ACCOUNTABILITY UNIFORM & TOOLS'}
          </h2>
          <p className="text-[#3F3832] max-w-2xl mx-auto text-sm mt-3 font-medium">
            {isPlannersPage
              ? 'Daily desk pads and planners built to keep the plan in charge — not the mood.'
              : (
                <>
                  Elevated apparel and execution tools built to remind you:{' '}
                  <span className="text-[#1F1917] font-extrabold underline">Follow the plan, not the feeling.</span>
                </>
              )}
          </p>
          {!isPlannersPage ? (
            <p className="text-xs font-semibold text-[#9A3412] mt-2" data-testid="gear-brand-pricing-note">
              {GEAR_BRAND_PRICING_NOTE}
            </p>
          ) : null}

          {!isPlannersPage && (
          <div className="flex flex-wrap justify-center gap-2.5 mt-8">
            {collectionTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCollection(tab.id)}
                className={`min-h-[44px] px-5 py-2.5 text-xs font-black uppercase rounded-2xl transition-all cursor-pointer border-2 ${
                  selectedCollection === tab.id
                    ? 'bg-[#C2410C] text-white border-[#1F1917] shadow-lg scale-105'
                    : 'bg-white text-[#1F1917] border-[#E5DFD3] hover:border-[#1F1917] hover:bg-[#FFEDD5]/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          )}
        </div>

        {showingPlanners ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {plannerProducts.map((product) => {
              const isJustAdded = addedIds[product.id];
              return (
                <div
                  key={product.id}
                  id={product.id}
                  className="bg-white border-2 border-[#1F1917] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col"
                >
                  <div className="p-6 sm:p-7 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-[#C2410C] uppercase tracking-wider">
                          {product.category}
                        </span>
                        <span className="text-xl font-black text-[#1F1917] font-serif">${product.price.toFixed(2)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#1F1917] mb-2 leading-tight">{product.name}</h3>
                      <p className="text-xs text-[#3F3832] leading-relaxed font-medium">{product.description}</p>
                    </div>
                    <div className="pt-4 border-t border-[#E5DFD3] flex items-center justify-end">
                      {plannerAddToCartIsEnabled() ? (
                        <button
                          type="button"
                          data-testid={`planner-add-to-cart-${product.id}`}
                          onClick={() => handleAdd(product.id)}
                          className={`min-h-[44px] px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border border-[#1F1917] ${
                            isJustAdded
                              ? 'bg-[#10B981] text-white shadow-md'
                              : 'bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-md'
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check className="w-4 h-4" /> Added!
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" /> Add To Cart
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          data-testid={`planner-add-to-cart-${product.id}`}
                          title="Coming soon"
                          className="relative min-h-[44px] px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0 border border-[#1F1917] bg-[#C2410C] text-white shadow-md cursor-not-allowed"
                        >
                          <ShoppingBag className="w-4 h-4" /> Add To Cart
                          <ComingSoonBadge className="absolute -top-2 -right-2 bg-white shadow-sm" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !catalogReady ? (
          <p className="text-center text-sm font-medium text-[#3F3832]">Loading gear…</p>
        ) : gearProducts.length === 0 ? (
          <p className="text-center text-sm font-medium text-[#3F3832]" data-testid="home-gear-empty">
            {SHOPIFY_GEAR_EMPTY}
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {gearProducts.map((product) => (
              <a
                key={`${product.kind}-${product.id}`}
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="bg-white border-2 border-[#1F1917] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group flex flex-col md:grid md:grid-cols-2 min-h-[44px]"
                data-testid={`home-gear-${product.handle}`}
              >
                <div className="relative bg-[#FAF8F5] p-6 border-b md:border-b-0 md:border-r border-[#E5DFD3] flex items-center justify-center min-h-[260px] group-hover:bg-[#FFEDD5]/40 transition-colors">
                  {isPublishableStorefrontImage(product.image) ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-56 md:h-full object-cover object-center rounded-2xl border border-[#1F1917]/20 shadow-md group-hover:scale-105 transition-transform duration-500"
                      data-testid="home-product-image"
                    />
                  ) : null}
                </div>
                <div className="p-6 sm:p-7 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-[#C2410C] uppercase tracking-wider">
                        {product.kind}
                      </span>
                      {product.price ? (
                        <span className="text-xl font-black text-[#1F1917] font-serif">${product.price}</span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-bold text-[#1F1917] mb-2 leading-tight group-hover:text-[#C2410C] transition-colors">
                      {product.title}
                    </h3>
                  </div>
                  <div className="pt-4 border-t border-[#E5DFD3] flex items-center justify-between gap-3">
                    <span className="text-[10px] text-[#3F3832] font-mono font-bold truncate">
                      MY PLAN, NOT MY MOOD
                    </span>
                    <span className="min-h-[44px] px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 bg-[#C2410C] text-white border border-[#1F1917] shadow-md">
                      <ShoppingBag className="w-4 h-4" /> {SHOPIFY_BUY_LABEL}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
