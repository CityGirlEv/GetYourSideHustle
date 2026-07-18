import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Share2,
} from "lucide-react";
import { ArticleTitleWithImage } from "@/components/ArticleTitleWithImage";
import { LearningArticleBody } from "@/components/LearningArticleBody";
import { LearningArticleCard } from "@/components/LearningArticleCard";
import { LearningCenterCta } from "@/components/LearningCenterCta";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Article, ArticleListItem } from "@/lib/articles";
import {
  LEARNING_ARTICLE_DISCLAIMER,
  categoryLabel,
  estimateReadMinutes,
  extractHeadings,
  formatArticleDate,
  getArticleLastUpdated,
  renderLearningMarkdown,
  splitArticleBody,
  type ArticleFaqItem,
} from "@/lib/learning-center";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { canonicalUrl } from "@/lib/site-url";

interface LearningArticleTemplateProps {
  article: Article;
  related: ArticleListItem[];
  previous: ArticleListItem | null;
  next: ArticleListItem | null;
}

function ArticleTableOfContents({
  headings,
  className = "",
  variant = "sidebar",
}: {
  headings: ReturnType<typeof extractHeadings>;
  className?: string;
  variant?: "sidebar" | "mobile";
}) {
  if (!headings.length) return null;

  return (
    <nav aria-label="Table of contents" className={className}>
      <p
        className={`font-semibold text-foreground ${variant === "sidebar" ? "text-sm mb-2" : "text-xs mb-1.5 px-1"}`}
      >
        On this page
      </p>
      <ul
        className={
          variant === "mobile"
            ? "flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
            : "space-y-1.5 border-l border-border pl-3"
        }
      >
        {headings.map((heading) => (
          <li key={heading.id} className={variant === "mobile" ? "shrink-0" : undefined}>
            <a
              href={`#${heading.id}`}
              className={
                variant === "mobile"
                  ? "inline-flex text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:border-primary/40 hover:bg-muted/40 transition-colors whitespace-nowrap"
                  : `block text-sm leading-snug hover:text-primary transition-colors ${
                      heading.level === 3 ? "pl-3 text-muted-foreground" : "text-foreground"
                    }`
              }
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ArticleFaqSection({ faq }: { faq: ArticleFaqItem[] }) {
  if (!faq.length) return null;

  return (
    <section id="article-faq" className="scroll-mt-28 space-y-2">
      <h2 className="font-display text-xl font-bold text-primary">Frequently asked questions</h2>
      <Accordion type="single" collapsible className="rounded-lg border border-border bg-background/60 px-4">
        {faq.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index}`}>
            <AccordionTrigger className="text-left text-sm sm:text-base">{item.question}</AccordionTrigger>
            <AccordionContent>
              <div
                className="learning-article-body text-sm text-muted-foreground leading-relaxed pb-2"
                dangerouslySetInnerHTML={{
                  __html: renderLearningMarkdown(item.answer),
                }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function ArticleShareButtons({ title, slug }: { title: string; slug: string }) {
  const shareUrl = useMemo(
    () => (typeof window !== "undefined" ? canonicalUrl(`/learning-center/${slug}`) : ""),
    [slug],
  );

  const shareArticle = async () => {
    const url = shareUrl || canonicalUrl(`/learning-center/${slug}`);
    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch {
        /* fallback */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Article link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" variant="outline" onClick={() => void shareArticle()}>
        <Share2 className="h-4 w-4 mr-1.5" />
        Share
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-muted-foreground"
        onClick={() => {
          const url = shareUrl || canonicalUrl(`/learning-center/${slug}`);
          void navigator.clipboard.writeText(url).then(
            () => toast.success("Link copied"),
            () => toast.error("Could not copy link"),
          );
        }}
      >
        <Copy className="h-4 w-4 mr-1.5" />
        Copy link
      </Button>
    </div>
  );
}

function ArticleAuthorBox() {
  return (
    <section
      id="article-author"
      className="scroll-mt-28 rounded-xl border border-border bg-muted/20 p-3 sm:p-4 flex gap-3"
    >
      <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
        <BookOpen className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{SITE_BRAND_NAME} Editorial Team</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Plain-language Medicare education reviewed for accuracy and CMS-compliant tone. We do not sell
          insurance, recommend specific carriers, or enroll you in coverage.
        </p>
      </div>
    </section>
  );
}

function ArticleDownloadCta({
  article,
  downloadLabel,
  downloadPath,
}: {
  article: Article;
  downloadLabel?: string;
  downloadPath?: string;
}) {
  const label = downloadLabel || "Download this guide";

  if (downloadPath) {
    return (
      <Button asChild variant="outline" className="w-full justify-center">
        <a href={downloadPath} download>
          <Download className="h-4 w-4 mr-1.5" />
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full justify-center"
      onClick={() => {
        void import("@/lib/article-pdf")
          .then((mod) =>
            mod.downloadArticleGuide({
              title: article.title,
              slug: article.slug,
              excerpt: article.excerpt,
              category: article.category,
              bodyMd: article.bodyMd,
              featuredImage: article.featuredImage,
              publishedAt: article.publishedAt,
              lastUpdated: article.lastUpdated,
            }),
          )
          .then(() => toast.success("Executive guide PDF downloaded"))
          .catch(() => toast.error("Could not generate PDF. Try again."));
      }}
    >
      <Download className="h-4 w-4 mr-1.5" />
      {label}
    </Button>
  );
}

function ArticlePrevNext({
  previous,
  next,
}: {
  previous: ArticleListItem | null;
  next: ArticleListItem | null;
}) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Previous and next articles"
      className="grid gap-3 sm:grid-cols-2 border-t border-border pt-4"
    >
      {previous ? (
        <Link
          to="/learning-center/$slug"
          params={{ slug: previous.slug }}
          className="group rounded-lg border border-border p-4 hover:border-primary/40 hover:bg-muted/20 transition-colors"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </span>
          <span className="block text-sm font-semibold text-primary group-hover:underline leading-snug">
            {previous.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          to="/learning-center/$slug"
          params={{ slug: next.slug }}
          className="group rounded-lg border border-border p-4 hover:border-primary/40 hover:bg-muted/20 transition-colors sm:text-right"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground mb-1 sm:justify-end">
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
          <span className="block text-sm font-semibold text-primary group-hover:underline leading-snug">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}

export function LearningArticleTemplate({
  article,
  related,
  previous,
  next,
}: LearningArticleTemplateProps) {
  const readMin = estimateReadMinutes(article.bodyMd);
  const headings = extractHeadings(article.bodyMd);
  const { faq } = splitArticleBody(article.bodyMd);
  const publishedLabel = formatArticleDate(article.publishedAt);
  const updatedLabel = formatArticleDate(getArticleLastUpdated(article));
  const showUpdated = Boolean(updatedLabel && updatedLabel !== publishedLabel);

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
      <Button asChild variant="ghost" size="sm" className="px-0 text-primary -mb-1">
        <Link to="/learning-center">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Learning Center
        </Link>
      </Button>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge variant="secondary">{categoryLabel(article.category)}</Badge>
          {article.featured ? <Badge className="bg-emerald/90">Featured</Badge> : null}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            {readMin} min read
          </span>
          {publishedLabel ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Published {publishedLabel}
            </span>
          ) : null}
          {showUpdated ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              Updated {updatedLabel}
            </span>
          ) : null}
        </div>

        <ArticleTitleWithImage
          title={article.title}
          excerpt={article.excerpt}
          imageSrc={article.featuredImage}
          size="page"
          footer={<ArticleShareButtons title={article.title} slug={article.slug} />}
        />
      </header>

      {headings.length ? (
        <div className="lg:hidden sticky top-0 z-20 -mx-1 px-1 py-2 bg-background/95 backdrop-blur border-b border-border">
          <ArticleTableOfContents headings={headings} variant="mobile" />
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)_240px] xl:grid-cols-[240px_minmax(0,1fr)_260px] gap-5 xl:gap-7 items-start">
        {headings.length ? (
          <aside className="hidden lg:block sticky top-24 self-start">
            <ArticleTableOfContents headings={headings} variant="sidebar" />
          </aside>
        ) : (
          <div className="hidden lg:block" />
        )}

        <main className="min-w-0 space-y-5">
          <LearningArticleBody bodyMd={article.bodyMd} />

          <ArticleFaqSection faq={faq} />

          <ArticleAuthorBox />

          <section
            id="article-disclaimer"
            className="scroll-mt-28 rounded-lg border border-border bg-muted/30 p-3 sm:p-4"
          >
            <strong className="block text-sm text-foreground mb-1.5">Educational disclaimer</strong>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {LEARNING_ARTICLE_DISCLAIMER}
            </p>
          </section>

          <div className="space-y-3 lg:hidden">
            <ArticleDownloadCta
              article={article}
              downloadLabel={article.downloadLabel}
              downloadPath={article.downloadPath}
            />
            <LearningCenterCta compact />
          </div>

          {related.length ? (
            <section id="related-articles" className="scroll-mt-28 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold text-primary">Related articles</h2>
                <Link
                  to="/learning-center"
                  className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {related.map((item) => (
                  <LearningArticleCard key={item.slug} article={item} />
                ))}
              </div>
            </section>
          ) : null}

          <ArticlePrevNext previous={previous} next={next} />
        </main>

        <aside className="hidden lg:block sticky top-24 self-start space-y-3">
          <Card className="p-3 space-y-2.5 border-primary/20 bg-primary/5">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-primary">Take action</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Save this guide or build a sample Medicare plan comparison to compare plans educationally.
              </p>
            </div>
            <ArticleDownloadCta
              article={article}
              downloadLabel={article.downloadLabel}
              downloadPath={article.downloadPath}
            />
          </Card>
          <LearningCenterCta compact />
        </aside>
      </div>
    </div>
  );
}
