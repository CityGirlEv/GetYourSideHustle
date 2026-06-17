import { renderLearningMarkdown, splitArticleBody } from "@/lib/learning-center";

export function LearningArticleBody({ bodyMd }: { bodyMd: string }) {
  const { mainBody } = splitArticleBody(bodyMd);
  const html = renderLearningMarkdown(mainBody, { withHeadingIds: true });

  return (
    <article
      className="learning-article-body space-y-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
