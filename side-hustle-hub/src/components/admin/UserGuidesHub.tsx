import { BookOpen, Shield } from "lucide-react";
import { MemberUserGuide } from "./MemberUserGuide";
import { AdminUserGuide } from "./AdminUserGuide";

export type UserGuideId = "member" | "admin";

type UserGuidesHubProps = {
  activeGuide: UserGuideId;
  onGuideChange: (guide: UserGuideId) => void;
};

export function UserGuidesHub({ activeGuide, onGuideChange }: UserGuidesHubProps) {
  return (
    <div className="user-guides-hub" data-testid="admin-user-guides">
      <div className="user-guides-hub__tabs" role="tablist" aria-label="User guides">
        <button
          type="button"
          role="tab"
          aria-selected={activeGuide === "member"}
          className={`nav-link-btn${activeGuide === "member" ? " active" : ""}`}
          onClick={() => onGuideChange("member")}
          data-testid="user-guide-tab-member"
        >
          <BookOpen size={16} /> Member User Guide
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeGuide === "admin"}
          className={`nav-link-btn${activeGuide === "admin" ? " active" : ""}`}
          onClick={() => onGuideChange("admin")}
          data-testid="user-guide-tab-admin"
        >
          <Shield size={16} /> Admin User Guide
        </button>
      </div>

      {activeGuide === "member" ? <MemberUserGuide /> : <AdminUserGuide />}
    </div>
  );
}
