import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LearningArticleCard } from "@/components/LearningArticleCard";
import { LearningCenterCta } from "@/components/LearningCenterCta";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { listPublishedArticles } from "@/lib/articles";
import {
  LEARNING_CENTER_CATEGORIES,
  LEARNING_CENTER_INTRO,
  LEARNING_CENTER_SCOPE_NOTE,
  type ArticleCategory,
} from "@/lib/learning-center";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { canonicalUrl } from "@/lib/site-url";

const PAGE_URL = canonicalUrl("/learning-center");

export const Route = createFileRoute("/learning-center")({
  loader: () => ({ articles: listPublishedArticles() }),
  head: () => ({
    meta: [
      { title: `Learning Center — ${SITE_BRAND_NAME}` },
      {
        name: "description",
        content:
          "Educational Medicare articles on plan types, enrollment timing, costs, and comparison tips. TPMO-compliant, no sales pressure.",
      },
      { property: "og:title", content: `Learning Center — ${SITE_BRAND_NAME}` },
      {
        property: "og:description",
        content:
          `Plain-language Medicare education from ${SITE_BRAND_NAME}. Compare concepts before you talk to a licensed professional.`,
      },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${SITE_BRAND_NAME} Learning Center`,
          url: PAGE_URL,
          description: LEARNING_CENTER_INTRO,
        }),
      },
    ],
  }),
  component: LearningCenterPage,
});

function LearningCenterPage() {
  const { articles: allArticles } = Route.useLoaderData();
  const [category, setCategory] = useState<ArticleCategory | "all">("all");

  const articles = useMemo(
    () =>
      category === "all" ? allArticles : allArticles.filter((a) => a.category === category),
    [allArticles, category],
  );

  const featured = useMemo(
    () => articles.filter((a) => a.featured).slice(0, 2),
    [articles],
  );
  const rest = useMemo(
    () => articles.filter((a) => !featured.some((f) => f.slug === a.slug)),
    [articles, featured],
  );

  return (
    <AppShell
      title="Learning Center"
      subtitle="Plain-language Medicare education — no enrollment pressure, no personal data required to read."
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="glass rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-start gap-2">
            <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1 text-muted-foreground">
              <p className="text-sm leading-snug">{LEARNING_CENTER_INTRO}</p>
              <p className="text-xs leading-snug border-t border-border/60 pt-1.5">
                {LEARNING_CENTER_SCOPE_NOTE}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {LEARNING_CENTER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                category === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-foreground hover:border-primary/40"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No articles in this category yet.</p>
        ) : (
          <>
            {featured.length > 0 && category === "all" ? (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold">Featured</h2>
                  <Badge variant="outline">Start here</Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {featured.map((article) => (
                    <LearningArticleCard key={article.slug} article={article} featured />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold">
                {category === "all" ? "All articles" : "Articles"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {(category === "all" ? rest : articles).map((article) => (
                  <LearningArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </section>
          </>
        )}

        <LearningCenterCta />

        <p className="text-center text-xs text-muted-foreground">
          Have a scenario already?{" "}
          <Link to="/" className="text-primary font-semibold hover:underline">
            Look up your Scenario ID
          </Link>
          .
        </p>
      </div>
    </AppShell>
  );
}
