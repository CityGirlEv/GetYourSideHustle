/**
 * Route-level code splits — keep these off the public home JS.
 * Lazy imports recover from mid-deploy missing chunks (reload / refresh banner).
 */
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { lazyImportWithStaleRecovery } from "./lib/first-load";

// Props vary per page; keep lazy wrappers permissive so App can pass real props.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyPage(
  factory: () => Promise<{ default: ComponentType<any> }>,
): LazyExoticComponent<ComponentType<any>> {
  return lazy(lazyImportWithStaleRecovery(factory));
}

export const AdminPortal = lazyPage(() =>
  import("./components/AdminPortal").then((m) => ({ default: m.AdminPortal })),
);
export const MarketingManual = lazyPage(() =>
  import("./components/MarketingManual").then((m) => ({ default: m.MarketingManual })),
);
export const HustleQuiz = lazyPage(() =>
  import("./components/HustleQuiz").then((m) => ({ default: m.HustleQuiz })),
);
export const FindMineWizardSelector = lazyPage(() =>
  import("./components/FindMineWizardSelector").then((m) => ({
    default: m.FindMineWizardSelector,
  })),
);
export const CalculatorSection = lazyPage(() =>
  import("./components/CalculatorSection").then((m) => ({ default: m.CalculatorSection })),
);
export const StepByStepGuides = lazyPage(() =>
  import("./components/StepByStepGuides").then((m) => ({ default: m.StepByStepGuides })),
);
export const FreeGuidesPage = lazyPage(() =>
  import("./components/FreeGuidesPage").then((m) => ({ default: m.FreeGuidesPage })),
);
export const CommunityHub = lazyPage(() =>
  import("./components/CommunityHub").then((m) => ({ default: m.CommunityHub })),
);
export const NewsletterPage = lazyPage(() =>
  import("./components/NewsletterPage").then((m) => ({ default: m.NewsletterPage })),
);
export const KidsCorner = lazyPage(() =>
  import("./components/KidsCorner").then((m) => ({ default: m.KidsCorner })),
);
export const SeniorSideHustles = lazyPage(() =>
  import("./components/SeniorSideHustles").then((m) => ({ default: m.SeniorSideHustles })),
);
export const UserPortal = lazyPage(() =>
  import("./components/UserPortal").then((m) => ({ default: m.UserPortal })),
);
export const KidDashboard = lazyPage(() =>
  import("./components/KidDashboard").then((m) => ({ default: m.KidDashboard })),
);
export const ScheduleDuePopup = lazyPage(() =>
  import("./components/ScheduleDuePopup").then((m) => ({ default: m.ScheduleDuePopup })),
);
export const BetaPhasePopup = lazyPage(() =>
  import("./components/BetaPhasePopup").then((m) => ({ default: m.BetaPhasePopup })),
);
export const DailyProgressReport = lazyPage(() =>
  import("./components/admin/DailyProgressReport").then((m) => ({
    default: m.DailyProgressReport,
  })),
);
export const WorkshopsHub = lazyPage(() =>
  import("./components/WorkshopsHub").then((m) => ({ default: m.WorkshopsHub })),
);
export const AboutPage = lazyPage(() =>
  import("./components/AboutPage").then((m) => ({ default: m.AboutPage })),
);
export const ContactPage = lazyPage(() =>
  import("./components/ContactPage").then((m) => ({ default: m.ContactPage })),
);
export const PrivacyPolicyPage = lazyPage(() =>
  import("./components/PrivacyPolicyPage").then((m) => ({ default: m.PrivacyPolicyPage })),
);
export const BetaNdaPage = lazyPage(() =>
  import("./components/BetaNdaPage").then((m) => ({ default: m.BetaNdaPage })),
);
export const BetaCreditsGuidePage = lazyPage(() =>
  import("./components/BetaCreditsGuidePage").then((m) => ({ default: m.BetaCreditsGuidePage })),
);
export const BetaPointsPage = lazyPage(() =>
  import("./components/BetaPointsPage").then((m) => ({ default: m.BetaPointsPage })),
);
export const JoinPage = lazyPage(() =>
  import("./components/JoinPage").then((m) => ({ default: m.JoinPage })),
);
export const MembershipSignupPage = lazyPage(() =>
  import("./components/MembershipSignupPage").then((m) => ({ default: m.MembershipSignupPage })),
);
export const LaunchChecklistPage = lazyPage(() =>
  import("./components/LaunchChecklistPage").then((m) => ({ default: m.LaunchChecklistPage })),
);
export const ParentConsentPage = lazyPage(() =>
  import("./components/ParentConsentPage").then((m) => ({ default: m.ParentConsentPage })),
);
export const BetaTesterDashboard = lazyPage(() =>
  import("./components/BetaTesterDashboard").then((m) => ({ default: m.BetaTesterDashboard })),
);
export const ShopPage = lazyPage(() =>
  import("./components/ShopPage").then((m) => ({ default: m.ShopPage })),
);
