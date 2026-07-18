import {
  CHECKLIST_OWNER_TABS,
  type AssigneeFilter,
  type ChecklistProgressCount,
} from "@/lib/submission-checklist-data";
import { ChecklistFilterBubble } from "@/components/ChecklistFilterBubble";
import { cn } from "@/lib/utils";

type ChecklistOwnerTabBarProps = {
  value: AssigneeFilter;
  onChange: (tab: AssigneeFilter) => void;
  progressByTab: Record<AssigneeFilter | "all", ChecklistProgressCount>;
  className?: string;
};

/** Ev's List / Catria's List owner tabs on the compliance checklist. */
export function ChecklistOwnerTabBar({
  value,
  onChange,
  progressByTab,
  className,
}: ChecklistOwnerTabBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1 border-b border-border pb-2", className)}>
      {CHECKLIST_OWNER_TABS.map((tab) => (
        <ChecklistFilterBubble
          key={tab.id}
          label={tab.label}
          active={value === tab.id}
          progress={progressByTab[tab.id]}
          onClick={() => onChange(tab.id)}
        />
      ))}
    </div>
  );
}
