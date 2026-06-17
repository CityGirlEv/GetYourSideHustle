import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ArticleListItem } from "@/lib/articles";
import { categoryLabel } from "@/lib/learning-center";

export function LearningArticleCard({
  article,
  featured = false,
}: {
  article: ArticleListItem;
  featured?: boolean;
}) {
  const readMin = article.readMinutes;
  return (
    <Card
      className={`h-full overflow-hidden flex flex-col hover:border-primary/40 transition-colors ${featured ? "border-primary/30 bg-primary/5" : ""}`}
    >
      {article.featuredImage ? (
        <img
          src={article.featuredImage}
          alt=""
          className="w-full h-36 object-cover border-b border-border"
        />
      ) : null}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            {categoryLabel(article.category)}
          </Badge>
          {featured || article.featured ? (
            <Badge className="text-[10px] bg-emerald/90">Featured</Badge>
          ) : null}
          <span className="text-[11px] text-muted-foreground ml-auto">{readMin} min read</span>
        </div>
        <Link
          to="/learning-center/$slug"
          params={{ slug: article.slug }}
          className="font-display text-lg font-bold text-primary hover:underline leading-snug"
        >
          {article.title}
        </Link>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{article.excerpt}</p>
        <Link
          to="/learning-center/$slug"
          params={{ slug: article.slug }}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Read article →
        </Link>
      </div>
    </Card>
  );
}
