import type { jsPDF } from "jspdf";

/**
 * Open a blank tab synchronously (must run in the click handler, before any await).
 * Chrome treats post-await window.open as non-user-gesture; blob tabs then often
 * fail with ERR_FILE_NOT_FOUND (-6).
 */
export function reservePdfTab(): Window | null {
  const tab = window.open("", "_blank");
  if (tab) {
    try {
      tab.opener = null;
      tab.document.title = "Opening PDF…";
    } catch {
      /* ignore */
    }
  }
  return tab;
}

function pdfBlob(doc: jsPDF): Blob {
  try {
    const direct = doc.output("blob") as Blob;
    if (direct instanceof Blob && direct.size > 0) return direct;
  } catch {
    /* fall through */
  }
  return new Blob([doc.output("arraybuffer")], { type: "application/pdf" });
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Viewer chrome: fixed Close + Print bar over an embedded PDF. */
function buildPdfViewerHtml(blobUrl: string, filename: string): string {
  const title = escapeHtml(filename.replace(/\.pdf$/i, "") || "PDF");
  const safeUrl = blobUrl.replace(/"/g, "&quot;");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    :root {
      --cream: #f7f3ed;
      --wine: #9b2f28;
      --charcoal: #2d2a26;
      --bar-h: 56px;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      height: 100%;
      background: #1a1816;
      font-family: Inter, system-ui, Segoe UI, sans-serif;
      color: var(--charcoal);
      overflow: hidden;
    }
    .pdf-viewer-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2147483647;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px 12px;
      min-height: var(--bar-h);
      padding: 8px 14px;
      background: linear-gradient(180deg, var(--cream), #ebe3d6);
      border-bottom: 2px solid var(--wine);
      box-shadow: 0 2px 10px rgba(0,0,0,0.18);
    }
    .pdf-viewer-bar__title {
      flex: 1 1 160px;
      min-width: 0;
      font-size: 0.95rem;
      font-weight: 750;
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pdf-viewer-bar__actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
      margin-left: auto;
    }
    .pdf-viewer-btn {
      appearance: none;
      border: 1px solid rgba(155, 47, 40, 0.35);
      background: #fff;
      color: var(--wine);
      font: inherit;
      font-size: 0.95rem;
      font-weight: 700;
      padding: 10px 18px;
      border-radius: 8px;
      cursor: pointer;
      line-height: 1.2;
      min-width: 96px;
    }
    .pdf-viewer-btn:hover {
      background: rgba(155, 47, 40, 0.08);
      border-color: rgba(155, 47, 40, 0.5);
    }
    .pdf-viewer-btn--primary {
      background: var(--wine);
      border-color: var(--wine);
      color: #fff;
    }
    .pdf-viewer-btn--primary:hover {
      background: #7a241f;
      border-color: #7a241f;
      color: #fff;
    }
    .pdf-viewer-frame {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
      background: #525659;
      margin-top: var(--bar-h);
      height: calc(100% - var(--bar-h));
    }
    @media print {
      .pdf-viewer-bar { display: none !important; }
      .pdf-viewer-frame { margin-top: 0 !important; height: 100% !important; }
    }
  </style>
</head>
<body>
  <header class="pdf-viewer-bar" role="toolbar" aria-label="PDF actions">
    <div class="pdf-viewer-bar__title">${title}</div>
    <div class="pdf-viewer-bar__actions">
      <button type="button" class="pdf-viewer-btn" id="pdf-close" aria-label="Close PDF">Close</button>
      <button type="button" class="pdf-viewer-btn pdf-viewer-btn--primary" id="pdf-print" aria-label="Print PDF">Print</button>
    </div>
  </header>
  <iframe class="pdf-viewer-frame" id="pdf-frame" title="${title}" src="${safeUrl}"></iframe>
  <script>
    (function () {
      var frame = document.getElementById("pdf-frame");
      var closeBtn = document.getElementById("pdf-close");
      var printBtn = document.getElementById("pdf-print");

      function closeViewer() {
        try {
          window.close();
        } catch (e) {}
        if (!window.closed) {
          try {
            if (window.history.length > 1) {
              window.history.back();
              return;
            }
          } catch (e2) {}
          try {
            window.location.href = "about:blank";
          } catch (e3) {}
        }
      }

      function printViewer() {
        // Prefer printing the embedded PDF so Close/Print stay on this viewer tab.
        try {
          var win = frame && frame.contentWindow;
          if (win) {
            win.focus();
            win.print();
            return;
          }
        } catch (e1) {}
        try {
          var printTab = window.open("${safeUrl}", "_blank");
          if (printTab) {
            var printed = false;
            var doPrint = function () {
              if (printed) return;
              printed = true;
              try {
                printTab.focus();
                printTab.print();
              } catch (e2) {}
            };
            printTab.addEventListener("load", function () {
              setTimeout(doPrint, 250);
            });
            setTimeout(doPrint, 1200);
            return;
          }
        } catch (e3) {}
        window.print();
      }

      if (closeBtn) closeBtn.addEventListener("click", closeViewer);
      if (printBtn) printBtn.addEventListener("click", printViewer);
      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape") closeViewer();
      });
    })();
  </script>
</body>
</html>`;
}

function writeViewerToWindow(tab: Window, blobUrl: string, filename: string): boolean {
  try {
    tab.document.open();
    tab.document.write(buildPdfViewerHtml(blobUrl, filename));
    tab.document.close();
    try {
      tab.focus();
    } catch {
      /* ignore */
    }
    return true;
  } catch {
    return false;
  }
}

const OVERLAY_ID = "gysh-pdf-viewer-overlay";

/** Full-screen overlay in the current window when a popup tab is unavailable. */
function showInlinePdfOverlay(blobUrl: string, filename: string): void {
  document.getElementById(OVERLAY_ID)?.remove();

  const root = document.createElement("div");
  root.id = OVERLAY_ID;
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", filename);
  Object.assign(root.style, {
    position: "fixed",
    inset: "0",
    zIndex: "99999",
    display: "flex",
    flexDirection: "column",
    background: "#1a1816",
  } as CSSStyleDeclaration);

  const bar = document.createElement("div");
  bar.setAttribute("role", "toolbar");
  bar.setAttribute("aria-label", "PDF actions");
  Object.assign(bar.style, {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px 12px",
    minHeight: "56px",
    padding: "8px 14px",
    background: "linear-gradient(180deg, #f7f3ed, #ebe3d6)",
    borderBottom: "2px solid #9b2f28",
    color: "#2d2a26",
    fontFamily: "Inter, system-ui, sans-serif",
    flexShrink: "0",
    zIndex: "1",
  } as CSSStyleDeclaration);

  const title = document.createElement("div");
  title.textContent = filename.replace(/\.pdf$/i, "") || "PDF";
  Object.assign(title.style, {
    flex: "1 1 160px",
    minWidth: "0",
    fontSize: "0.95rem",
    fontWeight: "750",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  } as CSSStyleDeclaration);

  const actions = document.createElement("div");
  Object.assign(actions.style, { display: "flex", gap: "8px", flexShrink: "0" });

  const mkBtn = (label: string, primary?: boolean) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.setAttribute("aria-label", `${label} PDF`);
    Object.assign(b.style, {
      appearance: "none",
      border: primary ? "1px solid #9b2f28" : "1px solid rgba(155, 47, 40, 0.35)",
      background: primary ? "#9b2f28" : "#fff",
      color: primary ? "#fff" : "#9b2f28",
      font: "inherit",
      fontSize: "0.95rem",
      fontWeight: "700",
      padding: "10px 18px",
      borderRadius: "8px",
      cursor: "pointer",
      minWidth: "96px",
    } as CSSStyleDeclaration);
    return b;
  };

  const closeBtn = mkBtn("Close");
  const printBtn = mkBtn("Print", true);

  const iframe = document.createElement("iframe");
  iframe.title = filename;
  iframe.src = blobUrl;
  Object.assign(iframe.style, {
    flex: "1 1 auto",
    width: "100%",
    border: "0",
    background: "#525659",
  } as CSSStyleDeclaration);

  const close = () => {
    root.remove();
    window.removeEventListener("keydown", onKey);
  };
  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") close();
  };

  closeBtn.addEventListener("click", close);
  printBtn.addEventListener("click", () => {
    try {
      const printTab = window.open(blobUrl, "_blank");
      if (printTab) {
        let printed = false;
        const doPrint = () => {
          if (printed) return;
          printed = true;
          try {
            printTab.focus();
            printTab.print();
          } catch {
            /* ignore */
          }
        };
        printTab.addEventListener("load", () => {
          window.setTimeout(doPrint, 250);
        });
        window.setTimeout(doPrint, 1200);
        return;
      }
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    }
  });
  window.addEventListener("keydown", onKey);

  actions.append(closeBtn, printBtn);
  bar.append(title, actions);
  root.append(bar, iframe);
  document.body.appendChild(root);
}

/**
 * Show a jsPDF document in a browser viewer with Close + Print.
 * Always use the branded HTML viewer (never navigate the tab straight to the
 * blob URL — that drops Close/Print and uses the browser’s native PDF chrome).
 * Fall back to an in-page overlay, then download.
 */
export function openPdfInBrowser(
  doc: jsPDF,
  filename: string,
  reservedTab?: Window | null,
): void {
  const blob = pdfBlob(doc);
  if (blob.size < 1) {
    throw new Error("PDF blob was empty — generation failed.");
  }
  const url = URL.createObjectURL(blob);
  const name = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  const tab = reservedTab && !reservedTab.closed ? reservedTab : null;
  if (tab && writeViewerToWindow(tab, url, name)) {
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
    return;
  }

  // Fresh blank tab — must stay blank so we can document.write the viewer.
  if (!tab) {
    const fresh = window.open("", "_blank");
    if (fresh && writeViewerToWindow(fresh, url, name)) {
      window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
      return;
    }
    try {
      fresh?.close();
    } catch {
      /* ignore */
    }
  } else {
    try {
      tab.close();
    } catch {
      /* ignore */
    }
  }

  // Popup blocked — keep the user in-app with the same Close / Print chrome.
  try {
    showInlinePdfOverlay(url, name);
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
    return;
  } catch {
    /* fall through */
  }

  triggerDownload(url, name);
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
