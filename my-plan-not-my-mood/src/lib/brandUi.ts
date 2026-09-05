/** Selected tabs match admin bubble orange. Buttons never use a black fill. */
export const BRAND_BUBBLE_ON_CLASS =
  'bg-[#EA580C] text-white border-[#FDBA74] shadow-[0_4px_12px_rgba(234,88,12,0.28)]';

export const BRAND_TAB_ROW_CLASS =
  'flex flex-wrap gap-0.5 border-b-2 border-[#1F1917] w-full items-end';
export const BRAND_TAB_SUB_ROW_CLASS =
  'flex flex-wrap gap-0.5 border-b-2 border-[#E8DFD2] w-full items-end';

export const BRAND_TAB_BASE_CLASS =
  'min-h-[44px] px-2 py-1 -mb-px rounded-t-lg text-[10px] font-black uppercase tracking-wide cursor-pointer inline-flex items-center gap-1 w-auto max-w-max shrink-0 border';
export const BRAND_TAB_IDLE_CLASS = `${BRAND_TAB_BASE_CLASS} border-[#1F1917] bg-[#FAF8F5] text-[#3F3832] hover:text-[#C2410C] hover:bg-[#FFF7ED]`;
export const BRAND_TAB_ACTIVE_CLASS = `${BRAND_TAB_BASE_CLASS} ${BRAND_BUBBLE_ON_CLASS}`;
export const BRAND_TAB_FILLED_CLASS = `${BRAND_TAB_BASE_CLASS} border-[#1F1917] bg-[#FFF7ED] text-[#C2410C]`;

export function brandTabClass(active: boolean, highlighted = false): string {
  if (active) return BRAND_TAB_ACTIVE_CLASS;
  if (highlighted) return BRAND_TAB_FILLED_CLASS;
  return BRAND_TAB_IDLE_CLASS;
}

export function brandTabMetaClass(active?: boolean): string {
  return active ? 'text-white' : 'text-[#C2410C]';
}

export function brandSelectedUsesBubbleOrange(className: string): boolean {
  return className.includes('bg-[#EA580C]') && !className.includes('bg-[#1F1917]');
}

export function brandControlIsTabNotPill(className: string): boolean {
  return className.includes('rounded-t-lg') && !className.includes('rounded-full');
}
