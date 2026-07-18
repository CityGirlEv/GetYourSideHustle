import { useState } from "react";
import { GitBranch, Network } from "lucide-react";
import { GYSH_SITE_MAP, type SiteMapNode } from "../../lib/site-map";

type ViewMode = "tree" | "org";

function TreeNode({ node, depth = 0 }: { node: SiteMapNode; depth?: number }) {
  const kids = node.children ?? [];
  return (
    <li className={`sitemap-tree-node depth-${Math.min(depth, 4)}`}>
      <div className="sitemap-tree-row">
        <strong>{node.label}</strong>
        {node.blurb && <span>{node.blurb}</span>}
      </div>
      {kids.length > 0 && (
        <ul>
          {kids.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

function OrgBox({ node, accent }: { node: SiteMapNode; accent?: string }) {
  return (
    <div className={`sitemap-org-box${accent ? ` sitemap-org-box--${accent}` : ""}`}>
      <strong>{node.label}</strong>
      {node.blurb && <span>{node.blurb}</span>}
    </div>
  );
}

function OrgBranch({ node }: { node: SiteMapNode }) {
  const kids = node.children ?? [];
  return (
    <div className="sitemap-org-branch">
      <OrgBox node={node} accent={node.id === "public" ? "public" : node.id === "admin" ? "admin" : undefined} />
      {kids.length > 0 && (
        <>
          <div className="sitemap-org-connector" aria-hidden />
          <div className="sitemap-org-row">
            {kids.map((child) => (
              <div key={child.id} className="sitemap-org-col">
                <OrgBox
                  node={child}
                  accent={
                    child.id.startsWith("match") || child.id === "match"
                      ? "match"
                      : child.id === "families" || child.id === "seniors"
                        ? "audience"
                        : undefined
                  }
                />
                {(child.children?.length ?? 0) > 0 && (
                  <>
                    <div className="sitemap-org-connector sitemap-org-connector--short" aria-hidden />
                    <ul className="sitemap-org-leaves">
                      {child.children!.map((leaf) => (
                        <li key={leaf.id}>
                          <span>{leaf.label}</span>
                          {leaf.blurb && <em>{leaf.blurb}</em>}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function SiteMapPage() {
  const [mode, setMode] = useState<ViewMode>("tree");
  const publicBranch = GYSH_SITE_MAP.children?.find((c) => c.id === "public");
  const adminBranch = GYSH_SITE_MAP.children?.find((c) => c.id === "admin");

  return (
    <div className="sitemap-page" data-testid="admin-sitemap">
      <header className="glass sitemap-page__head">
        <div>
          <h2>GYSH Site Map</h2>
          <p>Full public + Admin structure — switch between tree and org chart.</p>
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
            aria-selected={mode === "org"}
            className={`nav-link-btn${mode === "org" ? " active" : ""}`}
            onClick={() => setMode("org")}
            data-testid="sitemap-view-org"
          >
            <Network size={16} /> Org chart
          </button>
        </div>
      </header>

      {mode === "tree" && (
        <section className="glass sitemap-tree" aria-label="Site map tree">
          <ul className="sitemap-tree-root">
            <TreeNode node={GYSH_SITE_MAP} />
          </ul>
        </section>
      )}

      {mode === "org" && (
        <section className="glass sitemap-org" aria-label="Site map org chart">
          <div className="sitemap-org-root">
            <OrgBox node={GYSH_SITE_MAP} accent="root" />
            <div className="sitemap-org-connector" aria-hidden />
            <div className="sitemap-org-split">
              {publicBranch && <OrgBranch node={publicBranch} />}
              {adminBranch && <OrgBranch node={adminBranch} />}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
