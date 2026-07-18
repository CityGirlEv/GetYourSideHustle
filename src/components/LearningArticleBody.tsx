import { renderLearningMarkdown, splitArticleBody } from "@/lib/learning-center";

export function LearningArticleBody({ bodyMd }: { bodyMd: string }) {
  const { mainBody } = splitArticleBody(bodyMd);
  const html = renderLearningMarkdown(mainBody, { withHeadingIds: true });

  return (
    <article
      className="learning-article-body [&>*:first-child]:mt-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
