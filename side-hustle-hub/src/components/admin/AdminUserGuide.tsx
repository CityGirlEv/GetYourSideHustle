import { Download } from "lucide-react";
import { ADMIN_GUIDE_META, ADMIN_SECTIONS, ADMIN_TOC } from "../../lib/user-guide-content";
import { downloadAdminUserGuidePdf } from "../../lib/user-guide-pdf";
import { GuideChecklist, GuideToc } from "./GuideChecklist";

export function AdminUserGuide() {
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
          onClick={() => downloadAdminUserGuidePdf()}
          data-testid="admin-guide-pdf"
        >
          <Download size={16} /> Download PDF
        </button>
      </header>

      <GuideToc entries={ADMIN_TOC} />

      {ADMIN_SECTIONS.map((section) => (
        <section key={section.id} className="user-guide__section" id={`guide-${section.id}`}>
          <h3>{section.title}</h3>
          <GuideChecklist guideId={`admin-${section.id}`} items={section.items} />
        </section>
      ))}
    </article>
  );
}
