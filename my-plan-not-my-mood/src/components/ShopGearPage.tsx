import React, { useEffect, useState } from 'react';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { HeroCarousel } from './HeroCarousel';
import {
  gearKindForHandle,
  gearProductAnchorId,
} from '../lib/heroCarouselProducts';
import { GEAR_SHOP_LABEL } from '../lib/gearSelections';
import {
  SHOPIFY_BUY_LABEL,
  SHOPIFY_GEAR_EMPTY,
  emptyShopifyGearSections,
  fetchShopifyGearCatalog,
  isPublishableStorefrontImage,
  shopifyGearSitePath,
  type ShopifyGearKind,
  type ShopifyGearSection,
} from '../lib/shopifyStore';

type ShopGearPageProps = {
  kind?: ShopifyGearKind;
  productHandle?: string;
  onSelectKind?: (kind: ShopifyGearKind) => void;
  onOpenProduct?: (path: string) => void;
};

export const ShopGearPage: React.FC<ShopGearPageProps> = ({
  kind = 'tee',
  productHandle = '',
  onSelectKind,
  onOpenProduct,
}) => {
  const [sections, setSections] = useState<ShopifyGearSection[]>(() => emptyShopifyGearSections());
  const activeKind = productHandle ? gearKindForHandle(productHandle) : kind;
  const section = sections.find((row) => row.kind === activeKind) ?? sections[0];
  const products = (section?.products ?? []).filter((product) => isPublishableStorefrontImage(product.image));

  useEffect(() => {
    if (!productHandle) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    void fetchShopifyGearCatalog().then((result) => setSections(result.sections));
  }, []);

  useEffect(() => {
    if (!productHandle || products.length === 0) return;
    const el = document.getElementById(gearProductAnchorId(productHandle));
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [productHandle, products.length, activeKind]);

  return (
    <section id="gear-page" className="pt-2 sm:pt-3 pb-8 bg-[#FAF8F5]" data-testid="shop-gear-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1.5">
        <HeroCarousel
          size="compact"
          onOpenProduct={onOpenProduct}
          aside={
            <div className="h-full flex flex-col justify-start gap-1.5 text-left pt-0.5" data-testid="shop-gear-aside">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F1917] uppercase tracking-tight leading-none">
                {GEAR_SHOP_LABEL}
              </h2>
              <p className="text-[#3F3832] max-w-xl text-sm font-medium leading-snug">
                Browse {section?.heading.toLowerCase() ?? 'gear'} here. Checkout, sizes, and shipping stay on Shopify.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 pt-0.5">
                {sections.map((row) => {
                  const href = shopifyGearSitePath(row.kind);
                  const active = row.kind === activeKind;
                  return (
                    <a
                      key={row.kind}
                      href={href}
                      data-testid={`shopify-${row.kind}-page-link`}
                      onClick={(event) => {
                        if (!onSelectKind) return;
                        event.preventDefault();
                        onSelectKind(row.kind);
                      }}
                      className={`inline-flex min-h-[44px] items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider border-2 shadow-lg ${
                        active
                          ? 'bg-[#C2410C] text-white border-[#1F1917]'
                          : 'bg-white text-[#1F1917] border-[#1F1917] hover:bg-[#FFEDD5]'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {row.cta}
                    </a>
                  );
                })}
              </div>
            </div>
          }
        />

        {products.length === 0 ? (
          <p className="text-center text-sm font-medium text-[#3F3832]" data-testid="shopify-tees-empty">
            {SHOPIFY_GEAR_EMPTY}
          </p>
        ) : (
          <div data-testid={`shopify-${section.kind}-section`}>
            <div className="mb-1 flex flex-row items-center justify-between gap-2">
              <h3 className="text-lg font-black text-[#1F1917] uppercase tracking-tight leading-none">{section.heading}</h3>
              <a
                href={section.pageUrl}
                target="_blank"
                rel="noreferrer"
                data-testid={`shopify-${section.kind}-store-link`}
                className="text-xs font-black uppercase tracking-wider text-[#C2410C] underline min-h-[44px] inline-flex items-center"
              >
                {section.label}
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid={`shopify-${section.kind}-grid`}>
              {products.map((product) => {
                const focused = productHandle === product.handle;
                return (
                  <li key={product.id} id={gearProductAnchorId(product.handle)}>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex flex-col h-full bg-white border-2 border-[#1F1917] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl min-h-[44px] ${
                        focused ? 'ring-4 ring-[#EA580C] ring-offset-2' : ''
                      }`}
                      data-testid={`shopify-${section.kind}-${product.handle}`}
                      data-focused={focused ? 'true' : undefined}
                    >
                      <div className="bg-[#FAF8F5] p-2 border-b border-[#E5DFD3] min-h-[140px] flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-36 object-cover object-center rounded-2xl border border-[#1F1917]/20"
                        />
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="text-base font-bold text-[#1F1917] leading-tight">{product.title}</h3>
                        {product.price ? (
                          <p className="text-lg font-black font-serif text-[#1F1917]">${product.price}</p>
                        ) : null}
                        <p className="text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]">
                          {SHOPIFY_BUY_LABEL}
                        </p>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
