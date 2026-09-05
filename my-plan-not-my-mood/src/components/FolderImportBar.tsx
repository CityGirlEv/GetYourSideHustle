import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { CF_POP_BTN } from '../lib/contentFactory';

export const FolderImportBar: React.FC<{
  onPickFiles: (files: File[]) => void;
  importing?: boolean;
  accept: string;
  testId: string;
  noun: string;
  title?: string;
  compact?: boolean;
}> = ({ onPickFiles, importing = false, accept, testId, noun, title, compact = false }) => {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [dropping, setDropping] = useState(false);

  const takeFiles = (list: FileList | File[] | null) => {
    const files = Array.from(list ?? []);
    if (files.length) onPickFiles(files);
  };

  return (
    <div
      className={`rounded-2xl border-2 border-dashed flex flex-wrap items-center ${
        compact ? 'gap-2 p-2 min-h-[44px]' : 'p-5 sm:p-6 space-y-3 min-h-[160px] flex-col justify-center'
      } ${dropping ? 'border-[#EA580C] bg-[#FFEDD5]' : 'border-[#FED7AA] bg-white'}`}
      data-testid={`${testId}-folder-import`}
      onDragOver={(event) => {
        event.preventDefault();
        setDropping(true);
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDropping(false);
        takeFiles(event.dataTransfer.files);
      }}
    >
      <p className="text-xs font-black uppercase tracking-wider text-[#C2410C] inline-flex items-center gap-1.5">
        <Upload className="w-3.5 h-3.5" /> {title ?? `Upload ${noun}s`}
      </p>
      {compact ? null : (
        <p className="text-sm font-medium text-[#9A3412]">Drop {noun} files here or pick files one by one.</p>
      )}
      <input
        ref={fileInput}
        type="file"
        accept={accept}
        multiple
        className="sr-only"
        aria-label={`Choose ${noun} files`}
        data-testid={`${testId}-files-input`}
        onChange={(event) => {
          takeFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={importing}
          className={`${CF_POP_BTN} disabled:opacity-60`}
          data-testid={`${testId}-choose-files`}
        >
          <Upload className="w-3.5 h-3.5" />
          {importing ? 'Loading' : 'Choose files'}
        </button>
      </div>
    </div>
  );
};
