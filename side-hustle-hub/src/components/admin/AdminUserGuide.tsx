import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { ADMIN_GUIDE_META, ADMIN_SECTIONS, ADMIN_TOC } from "../../lib/user-guide-content";
import { reservePdfTab } from "../../lib/open-pdf";
import { downloadAdminUserGuidePdf } from "../../lib/user-guide-pdf";
import { GuideChecklist, GuideToc } from "./GuideChecklist";

function allClosedMap(ids: string[]): Record<string, boolean> {
  return Object.fromEntries(ids.map((id) => [id, false]));
}

export function AdminUserGuide() {
  const sectionIds = useMemo(() => ADMIN_SECTIONS.map((s) => s.id), []);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    allClosedMap(sectionIds),
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandSection = (id: string) => {
    setOpenSections((prev) => {
      const next = { ...prev, [id]: true };
      // Parent TOC rows may not match a drawn section — open following child entries.
      if (!sectionIds.includes(id)) {
        const idx = ADMIN_TOC.findIndex((e) => e.id === id);
        if (idx >= 0) {
          for (let i = idx + 1; i < ADMIN_TOC.length; i++) {
            if (ADMIN_TOC[i].level === 1) break;
            next[ADMIN_TOC[i].id] = true;
          }
        }
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenSections(Object.fromEntries(sectionIds.map((id) => [id, true])));
  };

  const collapseAll = () => {
    setOpenSections(Object.fromEntries(sectionIds.map((id) => [id, false])));
  };

  return (
    <article className="user-guide user-guide--admin" data-testid="admin-user-guide">
      <header className="user-guide__hero user-guide__hero--admin">
        <div className="user-guide__hero-text">
          <p className="user-guide__eyebrow">{ADMIN_GUIDE_META.eyebrow}</p>
          <h2>{ADMIN_GUIDE_META.title}</h2>
          <p className="user-guide__lead">{ADMIN_GUIDE_META.lead}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary user-guide__pdf-btn"
          onClick={() => {
            const tab = reservePdfTab();
            void downloadAdminUserGuidePdf(tab).catch(() => tab?.close());
          }}
          data-testid="admin-guide-pdf"
        >
          <Download size={16} /> Open PDF
        </button>
      </header>

      <div className="manual-toc-bar">
        <GuideToc entries={ADMIN_TOC} onNavigate={expandSection} />
        <div className="manual-toc-bar__actions manual-section-controls">
          <button
            type="button"
            className="btn btn-outline manual-toc-bar__btn"
            onClick={expandAll}
            data-testid="admin-guide-expand-all"
          >
            Expand all
          </button>
          <button
            type="button"
            className="btn btn-outline manual-toc-bar__btn"
            onClick={collapseAll}
            data-testid="admin-guide-collapse-all"
          >
            Collapse all
          </button>
        </div>
      </div>

      {ADMIN_SECTIONS.map((section) => {
        const open = openSections[section.id] !== false;
        const panelId = `admin-panel-${section.id}`;
        return (
          <section
            key={section.id}
            className={`user-guide__section manual-section${open ? " is-open" : " is-collapsed"}`}
            id={`guide-${section.id}`}
          >
            <h3 className="manual-section__title">
              <button
                type="button"
                className="manual-section__toggle"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggleSection(section.id)}
              >
                {open ? <ChevronDown size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden />}
                <span className="manual-section__label">{section.title}</span>
              </button>
            </h3>
            {open && (
              <div id={panelId} className="manual-section__panel">
                <GuideChecklist guideId={`admin-${section.id}`} items={section.items} />
              </div>
            )}
          </section>
        );
      })}
    </article>
  );
}
