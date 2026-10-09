import React from "react";
import { navigateAdminDeepLink } from "../../lib/admin-deep-links";
import {
  CONTENT_FACTORY_SECTIONS,
  type ContentFactorySectionId,
} from "../../lib/content-factory-sections";

/** Shared tabs so Content Factory, both schedules, and Growth Studio open each other. */
export const ContentFactorySectionTabs: React.FC<{
  active: ContentFactorySectionId;
}> = ({ active }) => (
  <div
    className="content-factory-section-tabs"
    role="tablist"
    aria-label="Content Factory pages"
    data-testid="content-factory-section-tabs"
  >
    {CONTENT_FACTORY_SECTIONS.map((section) => {
      const selected = section.id === active;
      return (
        <button
          key={section.id}
          type="button"
          role="tab"
          aria-selected={selected}
          className={`nav-link-btn${selected ? " active" : ""}`}
          data-testid={`content-factory-section-${section.id}`}
          onClick={() =>
            navigateAdminDeepLink({
              tab: section.tab,
              ...(section.panel ? { panel: section.panel } : {}),
            })
          }
        >
          {section.label}
        </button>
      );
    })}
  </div>
);
