import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { UploadThumb } from './UploadThumb';

export function ThumbnailOrderList<T extends { id: string }>({
  items,
  getSrc,
  getName,
  selectedId,
  onSelect,
  onReorder,
  testId,
  layout = 'grid',
}: {
  items: T[];
  getSrc: (item: T) => string | undefined;
  getName: (item: T) => string;
  selectedId?: string;
  onSelect: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  testId: string;
  layout?: 'grid' | 'list';
}): React.ReactElement {
  const list = layout === 'list';
  return (
    <ul
      className={list ? 'divide-y divide-[#F0E8DC] rounded-xl border border-[#E8DFD2] bg-white' : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2'}
      data-testid={`${testId}-all-list`}
    >
      {items.map((item, index) => {
        const src = getSrc(item);
        const name = getName(item);
        const selected = item.id === selectedId;
        return (
          <li
            key={item.id}
            className={
              list
                ? `flex items-center gap-2 px-2 py-1 min-w-0 ${selected ? 'bg-[#FFF7ED]' : 'bg-white'}`
                : `rounded-xl border-2 p-1.5 flex flex-col gap-1 min-w-0 ${
                    selected ? 'border-[#EA580C] bg-[#FFF7ED]' : 'border-[#FED7AA] bg-white'
                  }`
            }
            data-testid={`${testId}-thumb-${item.id}`}
          >
            <button
              type="button"
              onClick={() => onSelect(index)}
              className={`min-h-[44px] rounded-xl cursor-pointer p-0 border-0 bg-transparent ${
                list ? 'inline-flex items-center gap-2 min-w-0 flex-1 text-left' : ''
              }`}
              aria-label={`Show ${name}`}
            >
              {src ? (
                <UploadThumb src={src} alt="" size={list ? 'xs' : 'sm'} fill={!list} />
              ) : (
                <span className={`block rounded-xl bg-[#FFEDD5] ${list ? 'w-11 h-11' : 'w-full aspect-square'}`} />
              )}
              {list ? <span className="text-sm font-semibold text-[#1F1917] truncate">{name}</span> : null}
            </button>
            {list ? null : <p className="text-[11px] font-semibold text-[#1F1917] truncate">{name}</p>}
            {onReorder ? (
              <div className={`flex gap-1 ${list ? 'shrink-0' : ''}`}>
                <button
                  type="button"
                  onClick={() => onReorder(index, index - 1)}
                  disabled={index === 0}
                  className="min-h-[44px] min-w-[44px] flex-1 inline-flex items-center justify-center rounded-xl border-2 border-[#1F1917] bg-white disabled:opacity-40 cursor-pointer"
                  aria-label={`Move ${name} earlier`}
                  data-testid={`${testId}-move-up-${item.id}`}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onReorder(index, index + 1)}
                  disabled={index === items.length - 1}
                  className="min-h-[44px] min-w-[44px] flex-1 inline-flex items-center justify-center rounded-xl border-2 border-[#1F1917] bg-white disabled:opacity-40 cursor-pointer"
                  aria-label={`Move ${name} later`}
                  data-testid={`${testId}-move-down-${item.id}`}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
