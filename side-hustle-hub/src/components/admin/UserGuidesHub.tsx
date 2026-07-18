import { BookOpen, Shield, Sparkles } from "lucide-react";
import { MemberUserGuide } from "./MemberUserGuide";
import { AdminUserGuide } from "./AdminUserGuide";
import { MarketingManual } from "../MarketingManual";
import { MARKETING_GUIDE_MENU, type MarketingGuideId } from "../../lib/marketing-guides";

export type UserGuideId = "member" | "admin" | MarketingGuideId;

type UserGuidesHubProps = {
  activeGuide: UserGuideId;
  onGuideChange: (guide: UserGuideId) => void;
};

const TABS: { id: UserGuideId; label: string; icon: "book" | "shield" | "spark" }[] = [
  { id: "master", label: "Complete Guide", icon: "spark" },
  { id: "adult", label: "Adult Manual", icon: "book" },
  { id: "kids", label: "Kids Manual", icon: "book" },
  { id: "teens", label: "Teens Manual", icon: "book" },
  { id: "seniors", label: "Seniors Manual", icon: "book" },
  { id: "member", label: "Member Tour", icon: "book" },
  { id: "admin", label: "Admin User Guide", icon: "shield" },
];

export function UserGuidesHub({ activeGuide, onGuideChange }: UserGuidesHubProps) {
  const marketingIds = new Set(MARKETING_GUIDE_MENU.map((g) => g.id));

  return (
    <div className="user-guides-hub" data-testid="admin-user-guides">
      <div className="user-guides-hub__tabs" role="tablist" aria-label="User guides">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeGuide === tab.id}
            className={`nav-link-btn${activeGuide === tab.id ? " active" : ""}`}
            onClick={() => onGuideChange(tab.id)}
            data-testid={`user-guide-tab-${tab.id}`}
          >
            {tab.icon === "shield" ? (
              <Shield size={16} />
            ) : tab.icon === "spark" ? (
              <Sparkles size={16} />
            ) : (
              <BookOpen size={16} />
            )}{" "}
            {tab.label}
          </button>
        ))}
      </div>

      {activeGuide === "member" && <MemberUserGuide />}
      {activeGuide === "admin" && <AdminUserGuide />}
      {marketingIds.has(activeGuide as MarketingGuideId) && (
        <MarketingManual guideId={activeGuide as MarketingGuideId} />
      )}
    </div>
  );
}
