import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { LearningArticleTemplate } from "@/components/LearningArticleTemplate";
import {
  getArticleNeighbors,
  getPublishedArticleBySlug,
  getRelatedArticles,
} from "@/lib/articles";
import { getArticleLastUpdated } from "@/lib/learning-center";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { canonicalUrl, ogImageUrl } from "@/lib/site-url";

export const Route = createFileRoute("/learning-center_/$slug")({
  loader: ({ params }) => {
    const article = getPublishedArticleBySlug(params.slug);
    if (!article) throw notFound();
    return {
      article,
      related: getRelatedArticles(article, 3),
      ...getArticleNeighbors(params.slug),
    };
  },
  head: ({ loaderData }) => {
    const { article } = loaderData;
    const url = canonicalUrl(`/learning-center/${article.slug}`);
    const ogImage = article.featuredImage || ogImageUrl();
    const lastUpdated = getArticleLastUpdated(article);
    return {
      meta: [
        {
          title: `${article.title.slice(0, 36)}${article.title.length > 36 ? "..." : ""} — ${SITE_BRAND_NAME}`,
        },
        { name: "description", content: article.metaDescription },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.metaDescription },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage.startsWith("http") ? ogImage : canonicalUrl(ogImage) },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: article.title },
        { name: "twitter:description", content: article.metaDescription },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.metaDescription,
            datePublished: article.publishedAt,
            dateModified: lastUpdated ?? article.publishedAt,
            image: ogImage.startsWith("http") ? ogImage : canonicalUrl(ogImage),
            author: { "@type": "Organization", name: SITE_BRAND_NAME },
            publisher: {
              "@type": "Organization",
              name: SITE_BRAND_NAME,
              logo: { "@type": "ImageObject", url: ogImageUrl() },
            },
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  component: LearningArticlePage,
});

function LearningArticlePage() {
  const { article, related, previous, next } = Route.useLoaderData();

  return (
    <AppShell title="">
      <LearningArticleTemplate
        article={article}
        related={related}
        previous={previous}
        next={next}
      />
    </AppShell>
  );
}
