import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Home,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import {
  GYSH_ADMIN_MAP,
  GYSH_PUBLIC_MAP,
  GYSH_SITE_MAP,
  hrefForSiteMapNode,
  type SiteMapHref,
  type SiteMapNode,
} from "../../lib/site-map";

type ViewMode = "tree" | "diagram";

function kindLabel(kind?: SiteMapNode["kind"]): string | null {
  if (kind === "menu") return "Menu";
  if (kind === "submenu") return "Submenu";
  if (kind === "page") return "Page";
  if (kind === "section") return "Section";
  return null;
}

function NodeLabel({
  node,
  onNavigate,
}: {
  node: SiteMapNode;
  onNavigate?: (href: SiteMapHref) => void;
}) {
  const href = hrefForSiteMapNode(node.id);
  const badge = kindLabel(node.kind);
  const clickable = Boolean(href && onNavigate);

  const inner = (
    <>
      <span className="sitemap-link-text">
        <strong>{node.label}</strong>
        {clickable && <ExternalLink size={13} className="sitemap-link-icon" aria-hidden />}
      </span>
      {badge && <span className={`sitemap-kind-badge sitemap-kind-badge--${node.kind}`}>{badge}</span>}
    </>
  );

  if (clickable && href && onNavigate) {
    return (
      <button
        type="button"
        className="sitemap-link"
        onClick={() => onNavigate(href)}
        title={`Open ${node.label}`}
      >
        {inner}
      </button>
    );
  }

  return <div className="sitemap-link sitemap-link--static">{inner}</div>;
}

function TreeNode({
  node,
  depth = 0,
  defaultOpen = true,
  onNavigate,
}: {
  node: SiteMapNode;
  depth?: number;
  defaultOpen?: boolean;
  onNavigate?: (href: SiteMapHref) => void;
}) {
  const kids = node.children ?? [];
  const hasKids = kids.length > 0;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <li className={`sitemap-tree-node depth-${Math.min(depth, 5)}`} data-kind={node.kind ?? "item"}>
      <div className="sitemap-tree-row">
        {hasKids ? (
          <button
            type="button"
            className="sitemap-tree-toggle"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            title={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="sitemap-tree-toggle sitemap-tree-toggle--leaf" aria-hidden />
        )}
        <div className="sitemap-tree-copy">
          <div className="sitemap-tree-title-line">
            <NodeLabel node={node} onNavigate={onNavigate} />
          </div>
          {node.blurb && <span className="sitemap-tree-blurb">{node.blurb}</span>}
        </div>
      </div>
      {hasKids && open && (
        <ul className="sitemap-tree-children">
          {kids.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              defaultOpen={depth < 2}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function InfoSubItems({
  nodes,
  onNavigate,
}: {
  nodes: SiteMapNode[];
  onNavigate?: (href: SiteMapHref) => void;
}) {
  return (
    <ul className="sitemap-info-subs">
      {nodes.map((n) => {
        const nested = n.children ?? [];
        const href = hrefForSiteMapNode(n.id);
        const clickable = Boolean(href && onNavigate);
        return (
          <li key={n.id} className="sitemap-info-sub">
            <div className="sitemap-info-sub__head">
              <span className="sitemap-info-sub__dot" aria-hidden />
              {clickable && href && onNavigate ? (
                <button
                  type="button"
                  className="sitemap-link sitemap-link--inline"
                  onClick={() => onNavigate(href)}
                  title={`Open ${n.label}`}
                >
                  <span className="sitemap-info-sub__label">{n.label}</span>
                  <ExternalLink size={12} className="sitemap-link-icon" aria-hidden />
                </button>
              ) : (
                <span className="sitemap-info-sub__label">{n.label}</span>
              )}
              {n.kind && (
                <span className={`sitemap-kind-badge sitemap-kind-badge--${n.kind}`}>
                  {kindLabel(n.kind)}
                </span>
              )}
            </div>
            {n.blurb && <p className="sitemap-info-sub__blurb">{n.blurb}</p>}
            {nested.length > 0 && (
              <ul className="sitemap-info-pages">
                {nested.map((p) => {
                  const ph = hrefForSiteMapNode(p.id);
                  const pClick = Boolean(ph && onNavigate);
                  return (
                    <li key={p.id}>
                      {pClick && ph && onNavigate ? (
                        <button
                          type="button"
                          className="sitemap-link sitemap-link--inline"
                          onClick={() => onNavigate(ph)}
                          title={`Open ${p.label}`}
                        >
                          <span>{p.label}</span>
                          <ExternalLink size={11} className="sitemap-link-icon" aria-hidden />
                        </button>
                      ) : (
                        <span>{p.label}</span>
                      )}
                      {p.blurb && <em>{p.blurb}</em>}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function SiteMapInfographic({
  onNavigate,
}: {
  onNavigate?: (href: SiteMapHref) => void;
}) {
  const menus = GYSH_PUBLIC_MAP.children ?? [];
  const adminGroups = GYSH_ADMIN_MAP.children ?? [];
  const homeHref = hrefForSiteMapNode(GYSH_PUBLIC_MAP.id);
  const adminHref = hrefForSiteMapNode(GYSH_ADMIN_MAP.id);

  return (
    <div className="sitemap-info" data-testid="sitemap-infographic">
      <div className="sitemap-info-legend" aria-label="Legend">
        <span className="sitemap-info-legend__item">
          <span className="sitemap-info-swatch sitemap-info-swatch--home" /> Home
        </span>
        <span className="sitemap-info-legend__item">
          <span className="sitemap-info-swatch sitemap-info-swatch--menu" /> Menu
        </span>
        <span className="sitemap-info-legend__item">
          <span className="sitemap-info-swatch sitemap-info-swatch--submenu" /> Submenu
        </span>
        <span className="sitemap-info-legend__item">
          <span className="sitemap-info-swatch sitemap-info-swatch--admin" /> Admin
        </span>
        <span className="sitemap-info-legend__item sitemap-info-legend__hint">
          Click any linked title to open that page
        </span>
      </div>

      <div className="sitemap-info-tier sitemap-info-tier--home">
        {homeHref && onNavigate ? (
          <button
            type="button"
            className="sitemap-info-home sitemap-info-home--link"
            onClick={() => onNavigate(homeHref)}
            title="Open Home"
          >
            <Home size={22} aria-hidden />
            <div>
              <strong>
                {GYSH_PUBLIC_MAP.label} <ExternalLink size={14} aria-hidden />
              </strong>
              {GYSH_PUBLIC_MAP.blurb && <span>{GYSH_PUBLIC_MAP.blurb}</span>}
            </div>
          </button>
        ) : (
          <div className="sitemap-info-home">
            <Home size={22} aria-hidden />
            <div>
              <strong>{GYSH_PUBLIC_MAP.label}</strong>
              {GYSH_PUBLIC_MAP.blurb && <span>{GYSH_PUBLIC_MAP.blurb}</span>}
            </div>
          </div>
        )}
        <p className="sitemap-info-flow-label">Primary header menus</p>
        <div className="sitemap-info-arrow" aria-hidden>
          <span />
        </div>
      </div>

      <div className="sitemap-info-tier">
        <div className="sitemap-info-grid" role="list">
          {menus.map((menu, i) => {
            const subs = menu.children ?? [];
            const menuHref = hrefForSiteMapNode(menu.id);
            return (
              <article key={menu.id} className="sitemap-info-card" role="listitem">
                <header className="sitemap-info-card__head">
                  <span className="sitemap-info-card__num" aria-hidden>
                    {i + 1}
                  </span>
                  <div className="sitemap-info-card__titles">
                    {menuHref && onNavigate ? (
                      <button
                        type="button"
                        className="sitemap-link sitemap-link--card-title"
                        onClick={() => onNavigate(menuHref)}
                        title={`Open ${menu.label}`}
                      >
                        <strong>{menu.label}</strong>
                        <ExternalLink size={13} className="sitemap-link-icon" aria-hidden />
                      </button>
                    ) : (
                      <strong>{menu.label}</strong>
                    )}
                    <span className="sitemap-kind-badge sitemap-kind-badge--menu">Menu</span>
                  </div>
                </header>
                {menu.blurb && <p className="sitemap-info-card__blurb">{menu.blurb}</p>}
                {subs.length > 0 ? (
                  <>
                    <p className="sitemap-info-card__subhead">Submenus</p>
                    <InfoSubItems nodes={subs} onNavigate={onNavigate} />
                  </>
                ) : (
                  <p className="sitemap-info-card__empty">Opens this page directly</p>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <div className="sitemap-info-tier sitemap-info-tier--admin">
        <div className="sitemap-info-arrow" aria-hidden>
          <span />
        </div>
        {adminHref && onNavigate ? (
          <button
            type="button"
            className="sitemap-info-admin-banner sitemap-info-admin-banner--link"
            onClick={() => onNavigate(adminHref)}
            title="Open Admin Studio"
          >
            <Shield size={20} aria-hidden />
            <div>
              <strong>
                {GYSH_ADMIN_MAP.label} <ExternalLink size={14} aria-hidden />
              </strong>
              {GYSH_ADMIN_MAP.blurb && <span>{GYSH_ADMIN_MAP.blurb}</span>}
            </div>
          </button>
        ) : (
          <div className="sitemap-info-admin-banner">
            <Shield size={20} aria-hidden />
            <div>
              <strong>{GYSH_ADMIN_MAP.label}</strong>
              {GYSH_ADMIN_MAP.blurb && <span>{GYSH_ADMIN_MAP.blurb}</span>}
            </div>
          </div>
        )}
        <div className="sitemap-info-grid sitemap-info-grid--admin" role="list">
          {adminGroups.map((group) => {
            const items = group.children ?? [];
            const groupHref = hrefForSiteMapNode(group.id);
            return (
              <article
                key={group.id}
                className="sitemap-info-card sitemap-info-card--admin"
                role="listitem"
              >
                <header className="sitemap-info-card__head">
                  <div className="sitemap-info-card__titles">
                    {groupHref && onNavigate ? (
                      <button
                        type="button"
                        className="sitemap-link sitemap-link--card-title"
                        onClick={() => onNavigate(groupHref)}
                        title={`Open ${group.label}`}
                      >
                        <strong>{group.label}</strong>
                        <ExternalLink size={13} className="sitemap-link-icon" aria-hidden />
                      </button>
                    ) : (
                      <strong>{group.label}</strong>
                    )}
                    <span className="sitemap-kind-badge sitemap-kind-badge--section">Group</span>
                  </div>
                </header>
                {items.length > 0 && <InfoSubItems nodes={items} onNavigate={onNavigate} />}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SiteMapPage({
  onNavigate,
}: {
  onNavigate?: (href: SiteMapHref) => void;
} = {}) {
  const [mode, setMode] = useState<ViewMode>("tree");

  let body: ReactNode;
  if (mode === "tree") {
    body = (
      <section className="glass sitemap-tree" aria-label="Site map tree — menus and submenus">
        <p className="sitemap-view-lead">
          Expandable hierarchy of menus and submenus. Click a linked title to open that page.
        </p>
        <ul className="sitemap-tree-root">
          <TreeNode node={GYSH_SITE_MAP} depth={0} defaultOpen onNavigate={onNavigate} />
        </ul>
      </section>
    );
  } else {
    body = (
      <section className="glass sitemap-diagram" aria-label="Site map infographic — top down from Home">
        <p className="sitemap-view-lead">
          Infographic from <strong>Home</strong> down through each header menu and its submenus.
          Click any linked title to jump there.
        </p>
        <SiteMapInfographic onNavigate={onNavigate} />
      </section>
    );
  }

  return (
    <div className="sitemap-page" data-testid="admin-sitemap">
      <header className="glass sitemap-page__head">
        <div>
          <h2>GYSH Site Map</h2>
          <p>Menus and submenus in hierarchical Tree or top-down Diagram (infographic) views.</p>
        </div>
        <div className="sitemap-page__toggles" role="tablist" aria-label="Site map view">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "tree"}
            className={`nav-link-btn${mode === "tree" ? " active" : ""}`}
            onClick={() => setMode("tree")}
            data-testid="sitemap-view-tree"
          >
            <GitBranch size={16} /> Tree
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "diagram"}
            className={`nav-link-btn${mode === "diagram" ? " active" : ""}`}
            onClick={() => setMode("diagram")}
            data-testid="sitemap-view-diagram"
          >
            <LayoutDashboard size={16} /> Diagram
          </button>
        </div>
      </header>

      {body}
    </div>
  );
}
