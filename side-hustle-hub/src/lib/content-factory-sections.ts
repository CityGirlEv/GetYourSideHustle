/**
 * Content Factory and the pages that live under it.
 * Posting Schedule, Creatives Schedule, and Growth Studio share one tab row.
 */
import type { AdminTab } from "./admin-nav";

export type ContentFactorySectionId = "factory" | "posting" | "creatives" | "studio";

export type ContentFactorySection = {
  id: ContentFactorySectionId;
  label: string;
  tab: AdminTab;
  /** Factory panel. Growth Studio is its own admin tab. */
  panel?: "launch-plan" | "posting" | "creatives";
  /** Site-map id when this page is nested under Content Factory. */
  siteMapId?: string;
};

export const CONTENT_FACTORY_SECTIONS: readonly ContentFactorySection[] = [
  { id: "factory", label: "Content Factory", tab: "factory", panel: "launch-plan" },
  {
    id: "posting",
    label: "Posting Schedule",
    tab: "factory",
    panel: "posting",
    siteMapId: "adm-factory-posting",
  },
  {
    id: "creatives",
    label: "Creatives Schedule",
    tab: "factory",
    panel: "creatives",
    siteMapId: "adm-factory-creatives",
  },
  { id: "studio", label: "Growth Studio", tab: "studio", siteMapId: "adm-studio" },
];

/** Pages listed under Content Factory in the admin menu. */
export const CONTENT_FACTORY_MENU_CHILDREN: readonly ContentFactorySection[] =
  CONTENT_FACTORY_SECTIONS.filter((section) => section.id !== "factory");

export function contentFactorySectionFor(
  tab: AdminTab | undefined,
  panel: string | null | undefined,
): ContentFactorySectionId {
  if (tab === "studio") return "studio";
  if (panel === "posting") return "posting";
  if (panel === "creatives") return "creatives";
  return "factory";
}

export function contentFactorySectionById(
  id: ContentFactorySectionId,
): ContentFactorySection {
  return CONTENT_FACTORY_SECTIONS.find((section) => section.id === id) ?? CONTENT_FACTORY_SECTIONS[0]!;
}
