import { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { linkifyEmailHtml } from "../../lib/email-html";

type Props = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  testId?: string;
  placeholder?: string;
  /** Show Visual / HTML source toggle (default true). */
  allowSource?: boolean;
  minHeight?: number;
};

const FONT_FACES = [
  { label: "Font", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
];

/** Browser fontSize command uses 1–7. */
const FONT_SIZES = [
  { label: "Size", value: "" },
  { label: "Tiny", value: "1" },
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "4" },
  { label: "Larger", value: "5" },
  { label: "Huge", value: "6" },
  { label: "Giant", value: "7" },
];

const BLOCK_STYLES = [
  { label: "Style", value: "" },
  { label: "Paragraph", value: "p" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Quote", value: "blockquote" },
  { label: "Preformatted", value: "pre" },
];

export function RichTextEmailEditor({
  value,
  onChange,
  disabled = false,
  testId,
  placeholder = "Write your message…",
  allowSource = true,
  minHeight = 240,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  /** Tracks last HTML we pushed to the parent (or loaded from props). null = not hydrated yet. */
  const lastEmitted = useRef<string | null>(null);
  const focusedRef = useRef(false);
  const [mode, setMode] = useState<"visual" | "source">("visual");
  const [sourceDraft, setSourceDraft] = useState(value || "");

  // Load / sync editor DOM from props — never while the user is typing (avoids caret reset).
  useEffect(() => {
    if (mode === "source") {
      if (!focusedRef.current) setSourceDraft(value || "");
      return;
    }
    const el = editorRef.current;
    if (!el) return;
    if (focusedRef.current) return;
    if (lastEmitted.current === value) return;
    const next = value && value.trim() ? value : "<p><br></p>";
    // Assign without emitting — some browsers fire `input` on innerHTML writes.
    el.innerHTML = next;
    lastEmitted.current = value || next;
  }, [value, mode]);

  const emit = () => {
    const html = editorRef.current?.innerHTML || "";
    lastEmitted.current = html;
    onChange(html);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const run = (command: string, arg?: string) => {
    if (disabled || mode === "source") return;
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

  const applyBlock = (tag: string) => {
    if (!tag) return;
    run("formatBlock", tag);
  };

  const applyLink = () => {
    if (disabled || mode === "source") return;
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
    if (mode === "source") {
      const next = linkifyEmailHtml(sourceDraft || "");
      setSourceDraft(next);
      lastEmitted.current = next;
      onChange(next);
      return;
    }
    const el = editorRef.current;
    if (!el) return;
    const next = linkifyEmailHtml(el.innerHTML || "");
    el.innerHTML = next;
    lastEmitted.current = next;
    onChange(next);
  };

  const switchMode = (next: "visual" | "source") => {
    if (next === mode) return;
    if (next === "source") {
      const html = editorRef.current?.innerHTML ?? value ?? "";
      setSourceDraft(html);
      lastEmitted.current = html;
      onChange(html);
      focusedRef.current = false;
      setMode("source");
      return;
    }
    // source → visual
    const html = sourceDraft || "<p><br></p>";
    lastEmitted.current = html;
    onChange(html);
    focusedRef.current = false;
    setMode("visual");
  };

  const toolbarDisabled = disabled || mode === "source";

  return (
    <div className={`rich-email-editor${disabled ? " is-disabled" : ""}`} data-testid={testId}>
      <div className="rich-email-toolbar" role="toolbar" aria-label="Message formatting">
        {allowSource ? (
          <div className="rich-email-mode" role="group" aria-label="Editor mode">
            <button
              type="button"
              className={`rich-email-mode__btn${mode === "visual" ? " is-active" : ""}`}
              disabled={disabled}
              onClick={() => switchMode("visual")}
              data-testid={testId ? `${testId}-mode-visual` : undefined}
            >
              Visual
            </button>
            <button
              type="button"
              className={`rich-email-mode__btn${mode === "source" ? " is-active" : ""}`}
              disabled={disabled}
              onClick={() => switchMode("source")}
              data-testid={testId ? `${testId}-mode-source` : undefined}
            >
              <Code2 size={14} /> HTML
            </button>
          </div>
        ) : null}

        <button type="button" className="rich-email-tool" title="Undo" aria-label="Undo" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("undo")}>
          <Undo2 size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Redo" aria-label="Redo" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("redo")}>
          <Redo2 size={15} />
        </button>
        <span className="rich-email-sep" aria-hidden />

        <button type="button" className="rich-email-tool" title="Bold" aria-label="Bold" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("bold")}>
          <Bold size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Italic" aria-label="Italic" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("italic")}>
          <Italic size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Underline" aria-label="Underline" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("underline")}>
          <Underline size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Strikethrough" aria-label="Strikethrough" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("strikeThrough")}>
          <Strikethrough size={15} />
        </button>
        <span className="rich-email-sep" aria-hidden />

        <label className="rich-email-select-wrap">
          <span className="sr-only">Paragraph style</span>
          <select
            aria-label="Paragraph style"
            disabled={toolbarDisabled}
            defaultValue=""
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              applyBlock(e.target.value);
              e.target.value = "";
            }}
          >
            {BLOCK_STYLES.map((f) => (
              <option key={f.label} value={f.value} disabled={!f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="rich-email-tool" title="Heading 1" aria-label="Heading 1" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => applyBlock("h1")}>
          <Heading1 size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Heading 2" aria-label="Heading 2" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => applyBlock("h2")}>
          <Heading2 size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Heading 3" aria-label="Heading 3" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => applyBlock("h3")}>
          <Heading3 size={15} />
        </button>
        <span className="rich-email-sep" aria-hidden />

        <label className="rich-email-select-wrap">
          <span className="sr-only">Font</span>
          <select
            aria-label="Font"
            disabled={toolbarDisabled}
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
            disabled={toolbarDisabled}
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
            disabled={toolbarDisabled}
            onMouseDown={(e) => e.preventDefault()}
            onChange={(e) => run("foreColor", e.target.value)}
          />
        </label>
        <label className="rich-email-color-wrap" title="Highlight color">
          <span className="sr-only">Highlight color</span>
          <span className="rich-email-color-wrap__icon" aria-hidden>
            <Highlighter size={12} />
          </span>
          <input
            type="color"
            aria-label="Highlight color"
            defaultValue="#fff4e8"
            disabled={toolbarDisabled}
            onMouseDown={(e) => e.preventDefault()}
            onChange={(e) => {
              const color = e.target.value;
              // hiliteColor is WebKit; backColor covers other engines.
              run("hiliteColor", color);
              try {
                document.execCommand("backColor", false, color);
              } catch {
                /* ignore */
              }
              emit();
            }}
          />
        </label>
        <span className="rich-email-sep" aria-hidden />

        <button type="button" className="rich-email-tool" title="Align left" aria-label="Align left" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("justifyLeft")}>
          <AlignLeft size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Align center" aria-label="Align center" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("justifyCenter")}>
          <AlignCenter size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Align right" aria-label="Align right" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("justifyRight")}>
          <AlignRight size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Justify" aria-label="Justify" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("justifyFull")}>
          <AlignJustify size={15} />
        </button>
        <span className="rich-email-sep" aria-hidden />

        <button type="button" className="rich-email-tool" title="Bulleted list" aria-label="Bulleted list" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("insertUnorderedList")}>
          <List size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Numbered list" aria-label="Numbered list" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("insertOrderedList")}>
          <ListOrdered size={15} />
        </button>
        <button type="button" className="rich-email-tool" title="Insert link" aria-label="Insert link" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={applyLink}>
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
          data-testid={testId ? `${testId}-autolink` : "agenda-email-autolink"}
        >
          <Link2 size={15} /> Auto-link
        </button>
        <button type="button" className="rich-email-tool" title="Clear formatting" aria-label="Clear formatting" disabled={toolbarDisabled} onMouseDown={(e) => e.preventDefault()} onClick={() => run("removeFormat")}>
          <RemoveFormatting size={15} />
        </button>
      </div>

      {mode === "source" ? (
        <textarea
          className="rich-email-source"
          data-testid={testId ? `${testId}-source` : undefined}
          disabled={disabled}
          value={sourceDraft}
          style={{ minHeight }}
          spellCheck={false}
          aria-label="HTML source"
          onFocus={() => {
            focusedRef.current = true;
          }}
          onChange={(e) => {
            setSourceDraft(e.target.value);
            lastEmitted.current = e.target.value;
            onChange(e.target.value);
          }}
          onBlur={() => {
            focusedRef.current = false;
          }}
        />
      ) : (
        <div
          ref={editorRef}
          className="rich-email-surface"
          contentEditable={!disabled}
          role="textbox"
          aria-multiline="true"
          aria-label="Message"
          data-placeholder={placeholder}
          data-testid={testId ? `${testId}-visual` : undefined}
          suppressContentEditableWarning
          style={{ minHeight }}
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
      )}
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
        .rich-email-mode {
          display: inline-flex; border: 1px solid var(--border-color); border-radius: 8px;
          overflow: hidden; margin-right: 4px;
        }
        .rich-email-mode__btn {
          display: inline-flex; align-items: center; gap: 4px;
          height: 32px; padding: 0 10px; border: 0; background: #fff;
          color: var(--charcoal); font: inherit; font-size: 0.8rem; font-weight: 700;
          cursor: pointer;
        }
        .rich-email-mode__btn.is-active {
          background: rgba(155,47,40,0.12); color: #9B2F28;
        }
        .rich-email-mode__btn:disabled { opacity: 0.4; cursor: not-allowed; }
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
        .rich-email-color-wrap {
          position: relative; display: inline-flex; align-items: center;
        }
        .rich-email-color-wrap input[type="color"] {
          width: 32px; height: 32px; padding: 2px; border-radius: 8px;
          border: 1px solid var(--border-color); background: #fff; cursor: pointer;
        }
        .rich-email-color-wrap__icon {
          position: absolute; right: -2px; bottom: -2px; pointer-events: none;
          background: #fff; border-radius: 4px; line-height: 0; color: #9B2F28;
        }
        .rich-email-surface {
          max-height: 520px; overflow: auto;
          padding: 12px 14px; font: inherit; font-size: 15px; line-height: 1.55;
          color: var(--charcoal); outline: none;
        }
        .rich-email-source {
          display: block; width: 100%; box-sizing: border-box; border: 0;
          max-height: 520px; overflow: auto; resize: vertical;
          padding: 12px 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 0.85rem; line-height: 1.45; color: var(--charcoal);
          background: #fffdf8; outline: none;
        }
        .rich-email-surface:empty:before {
          content: attr(data-placeholder);
          color: #9a8b7a; pointer-events: none;
        }
        .rich-email-surface p { margin: 0 0 0.75em; }
        .rich-email-surface h1 { margin: 0 0 0.5em; font-size: 1.6rem; }
        .rich-email-surface h2 { margin: 0 0 0.5em; font-size: 1.35rem; }
        .rich-email-surface h3 { margin: 0 0 0.5em; font-size: 1.15rem; }
        .rich-email-surface blockquote {
          margin: 0 0 0.75em; padding: 8px 12px; border-left: 4px solid #9B2F28;
          background: #fff4e8; color: #5a4a3a;
        }
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
