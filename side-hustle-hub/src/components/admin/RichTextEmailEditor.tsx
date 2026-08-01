import { useEffect, useRef } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  RemoveFormatting,
  Underline,
} from "lucide-react";
import { linkifyEmailHtml } from "../../lib/email-html";

type Props = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  testId?: string;
  placeholder?: string;
};

const FONT_FACES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
];

/** Browser fontSize command uses 1–7. */
const FONT_SIZES = [
  { label: "Size", value: "" },
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "4" },
  { label: "Larger", value: "5" },
  { label: "Huge", value: "6" },
];

export function RichTextEmailEditor({
  value,
  onChange,
  disabled = false,
  testId,
  placeholder = "Write your message…",
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  /** Tracks last HTML we pushed to the parent (or loaded from props). null = not hydrated yet. */
  const lastEmitted = useRef<string | null>(null);
  const focusedRef = useRef(false);

  // Load / sync editor DOM from props — never while the user is typing (avoids caret reset).
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (focusedRef.current) return;
    if (lastEmitted.current === value) return;
    const next = value || "<p><br></p>";
    if (el.innerHTML !== next) {
      el.innerHTML = next;
    }
    lastEmitted.current = value;
  }, [value]);

  const emit = () => {
    const html = editorRef.current?.innerHTML || "";
    lastEmitted.current = html;
    onChange(html);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const run = (command: string, arg?: string) => {
    if (disabled) return;
    focusEditor();
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch {
      /* ignore */
    }
    document.execCommand(command, false, arg);
    emit();
  };

  const applyFont = (face: string) => {
    if (!face) return;
    run("fontName", face);
  };

  const applySize = (size: string) => {
    if (!size) return;
    run("fontSize", size);
  };

  const applyLink = () => {
    if (disabled) return;
    const url = window.prompt("Link URL (https://…)", "https://");
    if (!url) return;
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith("mailto:")) {
      window.alert("Use an http(s) or mailto: link.");
      return;
    }
    run("createLink", trimmed);
  };

  /** Convert bare https://… text in the message into real clickable links. */
  const autoLinkUrls = () => {
    if (disabled) return;
    const el = editorRef.current;
    if (!el) return;
    const next = linkifyEmailHtml(el.innerHTML || "");
    el.innerHTML = next;
    lastEmitted.current = next;
    onChange(next);
  };

  return (
    <div className={`rich-email-editor${disabled ? " is-disabled" : ""}`} data-testid={testId}>
      <div className="rich-email-toolbar" role="toolbar" aria-label="Message formatting">
        <button type="button" className="rich-email-tool" title="Bold" aria-label="Bold" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("bold")}>
          <Bold size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Italic" aria-label="Italic" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("italic")}>
          <Italic size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Underline" aria-label="Underline" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("underline")}>
          <Underline size={15} />
        </button>
        <span className="rich-email-sep" aria-hidden />
        <label className="rich-email-select-wrap">
          <span className="sr-only">Font</span>
          <select
            aria-label="Font"
            disabled={disabled}
            defaultValue=""
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              applyFont(e.target.value);
              e.target.value = "";
            }}
          >
            {FONT_FACES.map((f) => (
              <option key={f.label} value={f.value} disabled={!f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="rich-email-select-wrap">
          <span className="sr-only">Font size</span>
          <select
            aria-label="Font size"
            disabled={disabled}
            defaultValue=""
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              applySize(e.target.value);
              e.target.value = "";
            }}
          >
            {FONT_SIZES.map((f) => (
              <option key={f.label} value={f.value} disabled={!f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="rich-email-color-wrap" title="Text color">
          <span className="sr-only">Text color</span>
          <input
            type="color"
            aria-label="Text color"
            defaultValue="#3a342e"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onChange={(e) => run("foreColor", e.target.value)}
          />
        </label>
        <span className="rich-email-sep" aria-hidden />
        <button type="button" className="rich-email-tool" title="Align left" aria-label="Align left" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("justifyLeft")}>
          <AlignLeft size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Align center" aria-label="Align center" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("justifyCenter")}>
          <AlignCenter size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Align right" aria-label="Align right" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("justifyRight")}>
          <AlignRight size={15} />
        </button>
        <span className="rich-email-sep" aria-hidden />
        <button type="button" className="rich-email-tool" title="Bulleted list" aria-label="Bulleted list" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("insertUnorderedList")}>
          <List size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Numbered list" aria-label="Numbered list" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("insertOrderedList")}>
          <ListOrdered size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Insert link" aria-label="Insert link" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={applyLink}>
          <Link2 size={15} />
        </button>
        <button
          type="button"
          className="rich-email-tool rich-email-tool--wide"
          title="Turn bare URLs into clickable links"
          aria-label="Auto-link URLs"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={autoLinkUrls}
          data-testid="agenda-email-autolink"
        >
          <Link2 size={15} /> Auto-link
        </button>
        <button type="button" className="rich-email-tool" title="Clear formatting" aria-label="Clear formatting" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("removeFormat")}>
          <RemoveFormatting size={15} />
        </button>
      </div>
      <div
        ref={editorRef}
        className="rich-email-surface"
        contentEditable={!disabled}
        role="textbox"
        aria-multiline="true"
        aria-label="Message"
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onFocus={() => {
          focusedRef.current = true;
        }}
        onInput={emit}
        onClick={(e) => {
          // Don't navigate away while editing — use the Links list under the preview instead.
          const t = e.target;
          const el = t instanceof Element ? t : t instanceof Node ? t.parentElement : null;
          if (el?.closest?.("a")) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onBlur={() => {
          focusedRef.current = false;
          // Ensure URLs become real anchors before save/send.
          const el = editorRef.current;
          if (el && !disabled) {
            const next = linkifyEmailHtml(el.innerHTML || "");
            if (next !== el.innerHTML) {
              el.innerHTML = next;
              lastEmitted.current = next;
              onChange(next);
              return;
            }
          }
          emit();
        }}
        onPaste={(e) => {
          // Prefer plain text paste to avoid messy Word HTML; keep simple formatting via toolbar.
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
          // Linkify after paste so pasted Zoom / site URLs become anchors.
          const el = editorRef.current;
          if (el) {
            const next = linkifyEmailHtml(el.innerHTML || "");
            el.innerHTML = next;
            lastEmitted.current = next;
            onChange(next);
          } else {
            emit();
          }
        }}
      />
      <style>{`
        .rich-email-editor {
          border: 1px solid var(--border-color);
          border-radius: 10px;
          background: #fff;
          overflow: hidden;
        }
        .rich-email-editor.is-disabled { opacity: 0.65; }
        .rich-email-toolbar {
          display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
          padding: 8px; border-bottom: 1px solid var(--border-color);
          background: #faf6ee;
        }
        .rich-email-tool {
          display: inline-flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid transparent; background: transparent; color: var(--charcoal);
          cursor: pointer;
        }
        .rich-email-tool:hover:not(:disabled) {
          background: rgba(155,47,40,0.08); border-color: rgba(155,47,40,0.2);
        }
        .rich-email-tool:disabled { opacity: 0.4; cursor: not-allowed; }
        .rich-email-tool--wide {
          width: auto; padding: 0 10px; gap: 6px; font-size: 0.8rem; font-weight: 700;
        }
        .rich-email-sep {
          width: 1px; height: 22px; background: var(--border-color); margin: 0 4px;
        }
        .rich-email-select-wrap select {
          height: 32px; border-radius: 8px; border: 1px solid var(--border-color);
          background: #fff; color: var(--charcoal); font: inherit; font-size: 0.85rem;
          padding: 0 8px; max-width: 140px;
        }
        .rich-email-color-wrap input[type="color"] {
          width: 32px; height: 32px; padding: 2px; border-radius: 8px;
          border: 1px solid var(--border-color); background: #fff; cursor: pointer;
        }
        .rich-email-surface {
          min-height: 240px; max-height: 420px; overflow: auto;
          padding: 12px 14px; font: inherit; font-size: 15px; line-height: 1.55;
          color: var(--charcoal); outline: none;
        }
        .rich-email-surface:empty:before {
          content: attr(data-placeholder);
          color: #9a8b7a; pointer-events: none;
        }
        .rich-email-surface p { margin: 0 0 0.75em; }
        .rich-email-surface ul, .rich-email-surface ol { margin: 0 0 0.75em; padding-left: 1.4em; }
        .rich-email-surface a {
          color: #9B2F28 !important;
          font-weight: 700;
          text-decoration: underline !important;
          cursor: pointer;
          pointer-events: auto;
          word-break: break-all;
        }
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }
      `}</style>
    </div>
  );
}
