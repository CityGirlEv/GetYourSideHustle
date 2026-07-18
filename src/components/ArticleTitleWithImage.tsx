import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const imageSizes = {
  /** Learning Center article page — beside the title */
  page: "w-28 sm:w-36 md:w-40 lg:w-44 shrink-0",
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
    <div className={cn(className)}>
      <div className="flex items-start gap-3 sm:gap-3.5 md:gap-4">
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

        <div className="min-w-0 flex-1 space-y-1.5">
          <TitleTag
            className={cn(
              "font-display font-bold text-primary leading-tight",
              size === "page"
                ? "text-xl sm:text-2xl lg:text-3xl"
                : size === "newsletter"
                  ? "text-sm sm:text-base font-semibold"
                  : "text-lg",
              !titleHref ? titleClassName : undefined,
            )}
          >
            {titleContent}
          </TitleTag>

          {excerpt ? (
            <p
              className={cn(
                "text-muted-foreground leading-snug",
                size === "page" ? "text-sm sm:text-base" : "text-xs sm:text-sm",
                excerptClassName,
              )}
            >
              {excerpt}
            </p>
          ) : null}

          {footer ? <div className="pt-0.5">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
