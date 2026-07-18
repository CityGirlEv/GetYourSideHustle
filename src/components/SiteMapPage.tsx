import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import type { SiteMapSection } from "@/lib/site-map";

function SiteMapEntryRow({ path, label, description, parameterized }: SiteMapSection["entries"][number]) {
  if (parameterized || path.includes("$") || path.endsWith(".xml")) {
    return (
      <li className="py-1.5 border-b border-border/50 last:border-0">
        <span className="font-mono text-sm text-foreground">{path}</span>
        <span className="text-muted-foreground"> — {label}</span>
        {description ? (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
        ) : null}
      </li>
    );
  }

  const [routePath, hash] = path.split("#");

  return (
    <li className="py-1.5 border-b border-border/50 last:border-0">
      <Link
        to={routePath}
        hash={hash}
        className="text-sm font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline"
      >
        {label}
      </Link>
      <span className="text-xs text-muted-foreground ml-2 font-mono">{path}</span>
      {description ? (
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
      ) : null}
    </li>
  );
}

export function SiteMapPage({
  title,
  subtitle,
  sections,
}: {
  title: string;
  subtitle: string;
  sections: SiteMapSection[];
}) {
  return (
    <AppShell title={title} subtitle={subtitle}>
      <div className="max-w-3xl mx-auto space-y-4">
        {sections.map((section) => (
          <Card key={section.title} className="glass p-5 space-y-3">
            <div>
              <h2 className="font-display text-lg font-bold">{section.title}</h2>
              {section.description ? (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{section.description}</p>
              ) : null}
            </div>
            <ul className="divide-y divide-border/40">
              {section.entries.map((entry) => (
                <SiteMapEntryRow key={`${section.title}-${entry.path}`} {...entry} />
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
