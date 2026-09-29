import { useRef, type MutableRefObject, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { sectionStartsOpen } from "../lib/narrow-viewport";
import { useNarrowViewport } from "../lib/use-narrow-viewport";

type PageCollapseProps = {
  title: ReactNode;
  testId: string;
  children: ReactNode;
  className?: string;
  /** Desktop (and non-narrow) start state. */
  defaultOpen?: boolean;
  /** When true, phones start closed even if defaultOpen is true. */
  collapseOnNarrow?: boolean;
  icon?: ReactNode;
  detailsRef?: React.RefObject<HTMLDetailsElement | null>;
  id?: string;
  headingTag?: "h2" | "h3" | "h4" | "h5";
};

export function PageCollapse({
  title,
  testId,
  children,
  className,
  defaultOpen = true,
  collapseOnNarrow = false,
  icon,
  detailsRef,
  id,
  headingTag = "h3",
}: PageCollapseProps) {
  const narrow = useNarrowViewport();
  const startOpen = sectionStartsOpen({ defaultOpen, collapseOnNarrow, narrow });
  const appliedDefaultOpen = useRef(false);
  const Heading = headingTag;

  const setDetailsRef = (el: HTMLDetailsElement | null) => {
    if (detailsRef) {
      (detailsRef as MutableRefObject<HTMLDetailsElement | null>).current = el;
    }
    if (el && startOpen && !appliedDefaultOpen.current) {
      el.open = true;
      appliedDefaultOpen.current = true;
    }
  };

  return (
    <details
      id={id}
      ref={setDetailsRef}
      className={`glass membership-collapse page-collapse${className ? ` ${className}` : ""}`}
      data-testid={testId}
    >
      <summary className="membership-collapse__summary">
        <Heading className="membership-collapse__title">
          {icon}
          {title}
          <ChevronRight size={20} className="membership-collapse__arrow" aria-hidden />
        </Heading>
        <span className="collapse-show-hide" aria-hidden="true" />
      </summary>
      <div className="membership-collapse__body">{children}</div>
    </details>
  );
}
