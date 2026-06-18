import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const imageSizes = {
  /** Learning Center article page — beside the title */
  page: "w-32 sm:w-44 md:w-48 lg:w-56 shrink-0",
  /** Newsletter admin preview cards */
  newsletter: "w-28 sm:w-32 md:w-36 shrink-0",
  /** Article list cards */
  card: "w-28 sm:w-32 shrink-0",
} as const;

export function ArticleTitleWithImage({
  title,
  excerpt,
  imageSrc,
  imageAlt = "",
  size = "page",
  titleAs = "h1",
  className,
  titleClassName,
  excerptClassName,
  footer,
  titleHref,
}: {
  title: string;
  excerpt?: string;
  imageSrc?: string;
  imageAlt?: string;
  size?: keyof typeof imageSizes;
  titleAs?: "h1" | "h2" | "h3";
  className?: string;
  titleClassName?: string;
  excerptClassName?: string;
  footer?: ReactNode;
  titleHref?: { to: string; params?: Record<string, string> };
}) {
  const TitleTag = titleAs;

  const titleContent = titleHref ? (
    <Link
      to={titleHref.to}
      params={titleHref.params}
      className={cn("hover:underline", titleClassName)}
    >
      {title}
    </Link>
  ) : (
    title
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-start gap-3 sm:gap-4 md:gap-5">
        {imageSrc ? (
          <figure className={imageSizes[size]}>
            <img
              src={imageSrc}
              alt={imageAlt || title}
              className="w-full rounded-lg border border-border/70 shadow-sm aspect-[3/2] object-cover"
              loading="lazy"
              decoding="async"
            />
          </figure>
        ) : null}

        <TitleTag
          className={cn(
            "min-w-0 flex-1 font-display font-bold text-primary leading-tight",
            size === "page"
              ? "text-2xl sm:text-3xl lg:text-4xl"
              : size === "newsletter"
                ? "text-sm sm:text-base font-semibold"
                : "text-lg",
            !titleHref ? titleClassName : undefined,
          )}
        >
          {titleContent}
        </TitleTag>
      </div>

      {excerpt ? (
        <p
          className={cn(
            "text-muted-foreground leading-relaxed",
            size === "page" ? "text-base sm:text-lg max-w-3xl" : "text-xs sm:text-sm",
            excerptClassName,
          )}
        >
          {excerpt}
        </p>
      ) : null}

      {footer}
    </div>
  );
}
