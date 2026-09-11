import React, { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Award, 
  CheckSquare, 
  Bookmark, 
  CalendarDays,
  Star,
  Zap,
  Check,
  BookOpen,
  Coins,
  Compass,
  Copy,
  Link2,
  Receipt,
  Sparkles,
  Users,
} from "lucide-react";
import { WaitIndicator } from "./WaitFeedback";
import { ChipScroller } from "./ChipScroller";
import { ShareWinForm } from "./ShareWinForm";
import { BILLING_ACCESS_WAIT_MS, CREDITS_TAB_WAIT_MS } from "../lib/wait-estimate";
import { PasswordField } from "./PasswordField";
import {
  isPaidMembershipTier,
  membershipCancelConfirmCopy,
  membershipDowngradeOptions,
  membershipUpgradeOptions,
  normalizeMembershipTierId,
} from "../lib/membership-cancel";
import { postMembershipCancel } from "../lib/membership-cancel-api";
import {
  CREDIT_EARN_ACTIONS,
  MEMBERSHIP_TIERS,
  formatEarnCreditDelta,
  type AudienceGroup,
} from "../lib/membership";
import {
  creditsBalanceHeadline,
  emptyMemberCreditsSummary,
  fetchMemberCredits,
  formatKidCreditBalance,
  formatCreditCount,
  formatLedgerDelta,
  formatLedgerWhen,
  friendlyCreditsLoadError,
  summarizeMemberCredits,
  type MemberCreditsSummary,
} from "../lib/member-credits";
import { AdminInternalCreditsPanel } from "./AdminInternalCreditsPanel";
import {
  attachPurchaseCreditRunningTotals,
  buildMemberAccessSummary,
  fetchMemberPurchases,
  formatBillingUsd,
  formatCreditsGranted,
  formatPurchaseAmount,
  formatPurchaseDescription,
  formatPurchasePaidAt,
  formatPurchasePaidOn,
  billingCategoryLabel,
  purchaseKindLabel,
  summarizeMemberBilling,
  type MemberAccessSummary,
  type MemberBillingTotals,
  type MemberPurchaseWithCredits,
} from "../lib/member-purchases";
import { buildReferralUrl, getOrCreateReferralCode } from "../lib/referral";
import { inviteFriendCredits, inviteFriendSteps } from "../lib/invite-friend";
import {
  assignSavedBlueprint,
  listSavedBlueprints,
  type SavedBlueprint,
} from "../lib/blueprints-api";
import {
  formatCreditPackPurchaseLabel,
  formatLedgerReason,
} from "../lib/credit-pack-purchase";
import { attachPendingWizardToAccount, clearPendingBlueprint, readPendingBlueprint } from "../lib/pending-blueprint";
import {
  blueprintAgeGroupTitle,
  blueprintMatchLabel,
} from "../lib/blueprint-match-labels";
import { hasLaunchGuide } from "../lib/launch-guides";
import type { BlueprintAgeGroup } from "../lib/gysh-analytics";
import {
  fetchFamilyChildren,
  fetchFamilySettings,
  registerFamilyChild,
  updateFamilySettings,
  type FamilyChild,
} from "../lib/family";
import type { ProgressReportCadence } from "../lib/family-logic";
import { HustleScheduleSuite } from "./HustleScheduleSuite";
import { PageCollapse } from "./PageCollapse";

interface Goal {
  id: string;
  title: string;
  done: boolean;
}

interface Badge {
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

type PortalBlueprint = {
  id: string;
  ageGroup: BlueprintAgeGroup;
  resultIds: string[];
  resultPcts: Record<string, number>;
  topResultId: string | null;
  completedAt: string;
  source: "saved" | "pending";
  childProfileId: string | null;
};

type UserPortalProps = {
  memberName?: string | null;
  membershipTier?: string | null;
  isAdmin?: boolean;
  /** Open Schedule Suite tab on mount / when set. */
  initialPortalTab?: PortalTab;
  focusScheduleId?: string | null;
  onFocusScheduleConsumed?: () => void;
  onOpenMatchWizard?: () => void;
  onOpenJoin?: () => void;
  /** After cancel-to-free — refresh auth/membership in the shell. */
  onMembershipChanged?: (tier: string) => void;
  /** After account soft-delete — sign out in the shell. */
  onAccountDeactivated?: () => void;
  /** Open the Launch Guide / Corner guides for a Blueprint match. */
  onOpenGuide?: (ageGroup: BlueprintAgeGroup, hustleId: string) => void;
  /** Open that kid’s dedicated Kids / Teens dashboard. */
  onOpenKidDashboard?: (kid: {
    id: string;
    displayName: string;
    ageBand: "kids" | "junior";
  }) => void;
};

function toPortalBlueprint(bp: SavedBlueprint): PortalBlueprint {
  return {
    id: bp.id,
    ageGroup: bp.ageGroup,
    resultIds: bp.resultIds ?? [],
    resultPcts: bp.resultPcts ?? {},
    topResultId: bp.topResultId ?? null,
    completedAt: bp.completedAt || bp.updatedAt,
    source: "saved",
    childProfileId: bp.childProfileId ?? null,
  };
}

function fromPendingLocal(pending: {
  ageGroup: BlueprintAgeGroup;
  resultIds: string[];
  resultPcts?: Record<string, number>;
  completedAt: string;
}): PortalBlueprint {
  return {
    id: "pending-local",
    ageGroup: pending.ageGroup,
    resultIds: pending.resultIds,
    resultPcts: pending.resultPcts ?? {},
    topResultId: pending.resultIds[0] ?? null,
    completedAt: pending.completedAt,
    source: "pending",
    childProfileId: null,
  };
}

function PortalSection({
  title,
  testId,
  children,
  className,
  headingTag = "h4",
  defaultOpen = true,
  icon,
}: {
  title: React.ReactNode;
  testId: string;
  children: React.ReactNode;
  className?: string;
  headingTag?: "h3" | "h4" | "h5";
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <PageCollapse
      title={title}
      testId={testId}
      className={`user-portal-section membership-collapse--standout${className ? ` ${className}` : ""}`}
      headingTag={headingTag}
      defaultOpen={defaultOpen}
      icon={icon}
    >
      {children}
    </PageCollapse>
  );
}

function MatchRow({
  match,
  ageGroup,
  onOpenGuide,
}: {
  match: { id: string; rank: number; label: string; pct?: number };
  ageGroup: BlueprintAgeGroup;
  onOpenGuide?: (ageGroup: BlueprintAgeGroup, hustleId: string) => void;
}) {
  const canOpenGuide =
    Boolean(onOpenGuide) &&
    (ageGroup === "adult" ? hasLaunchGuide(match.id) : true);

  return (
    <li>
      <span className="user-portal-blueprint-rank">{match.rank}</span>
      <span className="user-portal-blueprint-match-body">
        <strong>{match.label}</strong>
        {typeof match.pct === "number" && <em>{match.pct}% match</em>}
      </span>
      {canOpenGuide && (
        <button
          type="button"
          className="btn btn-outline user-portal-blueprint-guide-btn"
          data-testid={`user-portal-guide-${match.id}`}
          onClick={() => onOpenGuide?.(ageGroup, match.id)}
        >
          <BookOpen size={14} aria-hidden /> Guide
        </button>
      )}
    </li>
  );
}

export type PortalTab =
  | "blueprint"
  | "schedule"
  | "family"
  | "credits"
  | "referral"
  | "purchases"
  | "earn"
  | "milestones"
  | "bookmarks";

const PORTAL_TABS: { id: PortalTab; label: string; icon: React.ReactNode }[] = [
  { id: "blueprint", label: "Blueprint", icon: <Compass size={15} aria-hidden /> },
  { id: "schedule", label: "Schedule Suite", icon: <CalendarDays size={15} aria-hidden /> },
  { id: "family", label: "Family", icon: <Users size={15} aria-hidden /> },
  { id: "credits", label: "Credits", icon: <Coins size={15} aria-hidden /> },
  { id: "referral", label: "Referral", icon: <Link2 size={15} aria-hidden /> },
  { id: "purchases", label: "Billing/Access", icon: <Receipt size={15} aria-hidden /> },
  { id: "earn", label: "Ways to Earn", icon: <Sparkles size={15} aria-hidden /> },
  { id: "milestones", label: "Milestones", icon: <CheckSquare size={15} aria-hidden /> },
  { id: "bookmarks", label: "Bookmarks", icon: <Bookmark size={15} aria-hidden /> },
];

export const UserPortal: React.FC<UserPortalProps> = ({
  memberName,
  membershipTier: membershipTierProp,
  isAdmin = false,
  initialPortalTab,
  focusScheduleId,
  onFocusScheduleConsumed,
  onOpenMatchWizard,
  onOpenJoin,
  onMembershipChanged,
  onAccountDeactivated,
  onOpenGuide,
  onOpenKidDashboard,
}) => {
  const [portalTab, setPortalTab] = useState<PortalTab>(initialPortalTab ?? "blueprint");
  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", title: "Complete the GYSH Match Wizard", done: true },
    { id: "2", title: "Run profit estimates on two side hustles", done: true },
    { id: "3", title: "Select a niche keyword list for POD shirts", done: false },
    { id: "4", title: "Request sample packaging from manufacturer", done: false },
    { id: "5", title: "Verify local city STR/Airbnb permit guidelines", done: false },
  ]);
  const [referralCode, setReferralCode] = useState("GYSHHOME");
  const [referralUrl, setReferralUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [credits, setCredits] = useState<MemberCreditsSummary | null>(null);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [purchases, setPurchases] = useState<MemberPurchaseWithCredits[]>([]);
  const [purchasesAccess, setPurchasesAccess] = useState<MemberAccessSummary | null>(null);
  const [purchasesBilling, setPurchasesBilling] = useState<MemberBillingTotals | null>(null);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesLoaded, setPurchasesLoaded] = useState(false);
  const [planActionBusy, setPlanActionBusy] = useState(false);
  const [planActionMsg, setPlanActionMsg] = useState("");
  const [planActionError, setPlanActionError] = useState("");
  const [confirmPlanAction, setConfirmPlanAction] = useState<
    "cancel_to_free" | "deactivate_account" | null
  >(null);
  const [localMembershipTier, setLocalMembershipTier] = useState(
    () => String(membershipTierProp || "free"),
  );
  const [blueprints, setBlueprints] = useState<PortalBlueprint[]>([]);
  const [blueprintsLoading, setBlueprintsLoading] = useState(true);
  const [blueprintsError, setBlueprintsError] = useState<string | null>(null);
  const [familyChildren, setFamilyChildren] = useState<FamilyChild[]>([]);
  const [familyLoading, setFamilyLoading] = useState(true);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [familyMessage, setFamilyMessage] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [kidName, setKidName] = useState("");
  const [kidAgeBand, setKidAgeBand] = useState<"kids" | "junior">("kids");
  const [kidLoginEmail, setKidLoginEmail] = useState("");
  const [kidLoginPassword, setKidLoginPassword] = useState("");
  const [kidLoginPasswordConfirm, setKidLoginPasswordConfirm] = useState("");
  const [juniorSignupId, setJuniorSignupId] = useState<string | null>(null);
  const [registeringKid, setRegisteringKid] = useState(false);
  const [pendingAssignBlueprintId, setPendingAssignBlueprintId] = useState<string | null>(null);
  const [reportCadence, setReportCadence] = useState<ProgressReportCadence>("none");
  const [assignBusyId, setAssignBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (initialPortalTab) setPortalTab(initialPortalTab);
  }, [initialPortalTab]);

  useEffect(() => {
    setLocalMembershipTier(String(membershipTierProp || "free"));
  }, [membershipTierProp]);

  const effectiveMembershipTier = localMembershipTier;
  const downgradeOptions = useMemo(
    () => membershipDowngradeOptions(effectiveMembershipTier),
    [effectiveMembershipTier],
  );
  const upgradeOptions = useMemo(
    () => membershipUpgradeOptions(effectiveMembershipTier),
    [effectiveMembershipTier],
  );
  const currentTierDef = useMemo(() => {
    const id = normalizeMembershipTierId(effectiveMembershipTier);
    return MEMBERSHIP_TIERS.find((t) => t.id === id) ?? MEMBERSHIP_TIERS[0]!;
  }, [effectiveMembershipTier]);
  const linkedKidLoginCount = useMemo(
    () => familyChildren.filter((c) => Boolean(c.hasLogin)).length,
    [familyChildren],
  );

  const runPlanAction = async (action: "cancel_to_free" | "deactivate_account") => {
    setPlanActionBusy(true);
    setPlanActionError("");
    setPlanActionMsg("");
    try {
      const result = await postMembershipCancel(action);
      setConfirmPlanAction(null);
      setPlanActionMsg(result.message || "Done.");
      if (result.loggedOut || action === "deactivate_account") {
        onAccountDeactivated?.();
        return;
      }
      const nextTier = String(result.user?.membershipTier || "free");
      setLocalMembershipTier(nextTier);
      onMembershipChanged?.(nextTier);
      setPurchasesLoaded(false);
    } catch (err: unknown) {
      setPlanActionError(err instanceof Error ? err.message : "Could not update membership.");
    } finally {
      setPlanActionBusy(false);
    }
  };

  useEffect(() => {
    if (focusScheduleId) setPortalTab("schedule");
  }, [focusScheduleId]);

  useEffect(() => {
    const code = getOrCreateReferralCode();
    setReferralCode(code);
    setReferralUrl(buildReferralUrl(code));
  }, []);

  const loadCredits = useCallback(() => {
    setCreditsLoading(true);
    void fetchMemberCredits()
      .then((payload) => {
        setCredits(summarizeMemberCredits(payload));
        setCreditsError(null);
      })
      .catch((err: unknown) => {
        setCredits(
          emptyMemberCreditsSummary({
            membershipTier: effectiveMembershipTier,
            audience: null,
          }),
        );
        setCreditsError(friendlyCreditsLoadError(err));
      })
      .finally(() => {
        setCreditsLoading(false);
      });
  }, [effectiveMembershipTier]);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  useEffect(() => {
    if (portalTab !== "purchases" || purchasesLoaded) return;
    let cancelled = false;
    setPurchasesLoading(true);
    void fetchMemberPurchases()
      .then((payload) => {
        if (cancelled) return;
        const list = attachPurchaseCreditRunningTotals(
          Array.isArray(payload.purchases) ? payload.purchases : [],
        );
        setPurchases(list);
        setPurchasesBilling(summarizeMemberBilling(list));
        setPurchasesAccess(
          buildMemberAccessSummary({
            membershipTier: payload.membershipTier ?? effectiveMembershipTier,
            audience: payload.audience,
            purchases: list,
          }),
        );
        setPurchasesError(null);
        setPurchasesLoaded(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPurchases([]);
        setPurchasesBilling(null);
        setPurchasesAccess(
          buildMemberAccessSummary({
            membershipTier: membershipTierProp,
            audience: credits?.audience ?? "adult",
            purchases: [],
          }),
        );
        setPurchasesError(err instanceof Error ? err.message : "Could not load purchase history.");
        setPurchasesLoaded(true);
      })
      .finally(() => {
        if (!cancelled) setPurchasesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [portalTab, purchasesLoaded, membershipTierProp, credits?.audience]);

  useEffect(() => {
    let cancelled = false;
    setBlueprintsLoading(true);
    void (async () => {
      try {
        let rows = await listSavedBlueprints();
        if (rows.length === 0 && readPendingBlueprint()?.resultIds?.length) {
          const attached = await attachPendingWizardToAccount(null);
          if (attached) rows = await listSavedBlueprints();
        }
        if (cancelled) return;
        if (rows.length > 0) {
          setBlueprints(rows.map(toPortalBlueprint));
          clearPendingBlueprint();
          setBlueprintsError(null);
          return;
        }
        const pending = readPendingBlueprint();
        if (pending?.resultIds?.length) {
          setBlueprints([fromPendingLocal(pending)]);
          setBlueprintsError(null);
          return;
        }
        setBlueprints([]);
        setBlueprintsError(null);
      } catch (err: unknown) {
        if (cancelled) return;
        const pending = readPendingBlueprint();
        if (pending?.resultIds?.length) {
          setBlueprints([fromPendingLocal(pending)]);
          setBlueprintsError(null);
          return;
        }
        setBlueprints([]);
        setBlueprintsError(err instanceof Error ? err.message : "Could not load your Blueprint.");
      } finally {
        if (!cancelled) setBlueprintsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshFamily = async () => {
    setFamilyLoading(true);
    setFamilyError(null);
    try {
      const [kids, settings] = await Promise.all([fetchFamilyChildren(), fetchFamilySettings()]);
      setFamilyChildren(kids);
      setReportCadence(settings.progressReportCadence || "none");
    } catch (err: unknown) {
      setFamilyError(err instanceof Error ? err.message : "Could not load family profiles.");
    } finally {
      setFamilyLoading(false);
    }
  };

  useEffect(() => {
    void refreshFamily();
  }, []);

  const audience: AudienceGroup = credits?.audience ?? "adult";

  const earnActions = useMemo(
    () => CREDIT_EARN_ACTIONS.filter((a) => a.audiences.includes(audience)),
    [audience],
  );

  const tierLabel = credits
    ? credits.enrolledLabel
    : membershipTierProp
      ? MEMBERSHIP_TIERS.find((t) => t.id === membershipTierProp)?.name ?? "Free"
      : null;

  const badges: Badge[] = [
    { name: "Scout Apprentice 🏷️", desc: "Searched product databases for profitable margins", icon: "🏷️", unlocked: true },
    { name: "Hustle Rookie 🚀", desc: "Completed your first GYSH Match Wizard questionnaire", icon: "🚀", unlocked: true },
    { name: "Superhost Trainee 🏡", desc: "Calculated Airbnb nightly yields and operating costs", icon: "🏡", unlocked: true },
    { name: "First Sale 🎉", desc: "Receive your first customer purchase confirmation", icon: "🎉", unlocked: false },
    { name: "Ad Manager 📊", desc: "Set up Facebook/TikTok business manager tracking pixels", icon: "📊", unlocked: false },
  ];

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
      if (g.id === id) return { ...g, done: !g.done };
      return g;
      }),
    );
  };

  const copyReferral = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const completedGoalsCount = goals.filter((g) => g.done).length;
  const progressPercent = Math.round((completedGoalsCount / goals.length) * 100);
  const displayName = (memberName || "").trim() || "there";

  const childNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of familyChildren) map.set(c.id, c.displayName);
    return map;
  }, [familyChildren]);

  const resetRegisterForm = () => {
    setKidName("");
    setKidAgeBand("kids");
    setKidLoginEmail("");
    setKidLoginPassword("");
    setKidLoginPasswordConfirm("");
    setJuniorSignupId(null);
    setPendingAssignBlueprintId(null);
    setRegisterOpen(false);
  };

  /** Open Register form — prefilled from kid Join data when available. */
  const openRegisterForKid = (
    child: FamilyChild,
    opts?: { blueprintId?: string },
  ) => {
    setKidName(child.displayName || "");
    setKidAgeBand(child.ageBand === "junior" ? "junior" : "kids");
    setKidLoginEmail(child.childEmail || "");
    setKidLoginPassword("");
    setKidLoginPasswordConfirm("");
    setJuniorSignupId(
      child.juniorSignupId || (child.source === "signup" ? child.id : null),
    );
    setPendingAssignBlueprintId(opts?.blueprintId ?? null);
    setRegisterOpen(true);
    setPortalTab("family");
    setFamilyMessage(null);
    setFamilyError(null);
  };

  const handleRegisterKid = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisteringKid(true);
    setFamilyMessage(null);
    setFamilyError(null);
    if (!kidLoginEmail.trim().includes("@")) {
      setFamilyError("Kid login needs a valid email.");
      setRegisteringKid(false);
      return;
    }
    if (kidLoginPassword.length < 8) {
      setFamilyError("Kid login password must be at least 8 characters.");
      setRegisteringKid(false);
      return;
    }
    if (kidLoginPassword !== kidLoginPasswordConfirm) {
      setFamilyError("Kid passwords do not match.");
      setRegisteringKid(false);
      return;
    }
    try {
      const child = await registerFamilyChild({
        displayName: kidName,
        ageBand: kidAgeBand,
        loginEmail: kidLoginEmail.trim(),
        loginPassword: kidLoginPassword,
        juniorSignupId: juniorSignupId || undefined,
      });
      setFamilyChildren((prev) => {
        const withoutSignup = prev.filter(
          (c) =>
            c.id !== juniorSignupId &&
            c.juniorSignupId !== juniorSignupId &&
            !(c.source === "signup" && c.displayName === child.displayName),
        );
        return [...withoutSignup, child];
      });
      const assignBpId = pendingAssignBlueprintId;
      resetRegisterForm();
      if (assignBpId) {
        await assignSavedBlueprint({ blueprintId: assignBpId, childProfileId: child.id });
        setBlueprints((prev) =>
          prev.map((bp) =>
            bp.id === assignBpId ? { ...bp, childProfileId: child.id } : bp,
          ),
        );
        setFamilyMessage(
          `${child.displayName} is registered and the Blueprint is assigned to them.`,
        );
        setPortalTab("blueprint");
      } else {
        setFamilyMessage(`${child.displayName} is linked to your parent coach profile.`);
        setPortalTab("family");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not register your kid.";
      setFamilyError(
        /session invalid|session expired|not authenticated/i.test(msg)
          ? "Your sign-in expired. Log out, log back in, then save the kid profile again."
          : msg,
      );
    } finally {
      setRegisteringKid(false);
    }
  };

  const handleAssignBlueprint = async (blueprintId: string, childProfileId: string) => {
    setAssignBusyId(blueprintId);
    setFamilyMessage(null);
    setFamilyError(null);
    try {
      const assignee = childProfileId === "self" ? null : childProfileId;
      await assignSavedBlueprint({ blueprintId, childProfileId: assignee });
      setBlueprints((prev) =>
        prev.map((bp) =>
          bp.id === blueprintId ? { ...bp, childProfileId: assignee } : bp,
        ),
      );
      setFamilyMessage(
        assignee
          ? `Blueprint assigned to ${childNameById.get(assignee) || "your kid"}.`
          : "Blueprint kept on your parent profile.",
      );
    } catch (err: unknown) {
      setFamilyError(err instanceof Error ? err.message : "Could not assign Blueprint.");
    } finally {
      setAssignBusyId(null);
    }
  };

  const handleReportCadence = async (cadence: ProgressReportCadence) => {
    setReportCadence(cadence);
    setFamilyError(null);
    try {
      await updateFamilySettings({ progressReportCadence: cadence });
      setFamilyMessage(
        cadence === "none"
          ? "Progress report emails turned off."
          : `${cadence === "daily" ? "Daily" : "Weekly"} kid progress emails enabled.`,
      );
    } catch (err: unknown) {
      setFamilyError(err instanceof Error ? err.message : "Could not save report preference.");
    }
  };

  return (
    <div className="user-portal" data-testid="user-portal">
      <div className="user-portal-main">
        <div className="glass user-portal-welcome">
          <h2>Welcome back, {displayName}!</h2>
          <p>
            Your Side Hustle Blueprint, family coach tools, and credits live here — use the tabs
            below to review matches, register kids, share your referral link, and earn more credits.
          </p>
          <p className="user-portal-welcome-links">
            <button
              type="button"
              className="user-portal-inline-link"
              data-testid="user-portal-open-purchases"
              onClick={() => setPortalTab("purchases")}
            >
              <Receipt size={14} aria-hidden /> View billing &amp; access
            </button>
            {" · "}
            <button
              type="button"
              className="user-portal-inline-link"
              data-testid="user-portal-open-credits"
              onClick={() => setPortalTab("credits")}
            >
              <Coins size={14} aria-hidden /> Credits &amp; enrollment
            </button>
            {" · "}
            <button
              type="button"
              className="user-portal-inline-link"
              data-testid="user-portal-open-referral"
              onClick={() => setPortalTab("referral")}
            >
              <Link2 size={14} aria-hidden /> Referral
            </button>
          </p>
        </div>

        <ChipScroller
          trackClassName="user-portal-tabs"
          ariaLabel="My Dashboard sections"
          testId="user-portal-tabs"
        >
          {PORTAL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`user-portal-tab-${tab.id}`}
              aria-selected={portalTab === tab.id}
              aria-controls={`user-portal-panel-${tab.id}`}
              className={`user-portal-tab${portalTab === tab.id ? " is-active" : ""}`}
              data-testid={`user-portal-tab-${tab.id}`}
              onClick={() => setPortalTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </ChipScroller>

        <div className="glass user-portal-panel" data-testid="user-portal-panel">
          {portalTab === "blueprint" && (
            <section
              id="user-portal-panel-blueprint"
              role="tabpanel"
              aria-labelledby="user-portal-tab-blueprint"
              data-testid="user-portal-blueprint"
            >
              <div className="user-portal-blueprint-head">
                <h3 id="user-portal-blueprint-heading">
                  <Compass size={20} aria-hidden /> Your Side Hustle Blueprint
                </h3>
                {onOpenMatchWizard && (
                  <button type="button" className="btn btn-outline" onClick={onOpenMatchWizard}>
                    Retake Match Wizard
                  </button>
                )}
              </div>

              {blueprintsLoading && (
                <WaitIndicator
                  className="user-portal-credits-muted"
                  data-testid="user-portal-blueprint-loading"
                  message="Loading your Blueprint…"
                  style={{ marginTop: 0 }}
                />
              )}
              {!blueprintsLoading && blueprintsError && (
                <p className="user-portal-credits-error" data-testid="user-portal-blueprint-error">
                  {blueprintsError}
                </p>
              )}
              {!blueprintsLoading && !blueprintsError && blueprints.length === 0 && (
                <div className="user-portal-blueprint-empty" data-testid="user-portal-blueprint-empty">
                  <p>
                    No Blueprint saved yet. Take the GYSH Match Wizard to unlock personalized Side
                    Hustle matches.
                  </p>
                  {onOpenMatchWizard && (
                    <button type="button" className="btn btn-primary" onClick={onOpenMatchWizard}>
                      <Compass size={16} aria-hidden /> Start Match Wizard
                    </button>
                  )}
                </div>
              )}
              {!blueprintsLoading &&
                blueprints.map((bp) => {
                  const title = blueprintAgeGroupTitle(bp.ageGroup);
                  const matches = bp.resultIds.map((id, i) => ({
                    id,
                    rank: i + 1,
                    label: blueprintMatchLabel(bp.ageGroup, id),
                    pct: bp.resultPcts[id],
                  }));
                  const topMatches = matches.slice(0, 3);
                  const moreMatches = matches.slice(3);
                  return (
                    <div
                      key={bp.id}
                      className="user-portal-blueprint-block"
                      data-testid={`user-portal-blueprint-${bp.ageGroup}`}
                    >
                      <div className="user-portal-blueprint-block-head">
                        <strong>{title}</strong>
                        <span className="user-portal-blueprint-summary-meta">
                          Top {Math.min(3, matches.length)} of {matches.length}
                          {bp.completedAt
                            ? ` · ${new Date(bp.completedAt).toLocaleDateString()}`
                            : ""}
                          {bp.childProfileId
                            ? ` · Assigned to ${childNameById.get(bp.childProfileId) || "kid"}`
                            : " · Assigned to you"}
                        </span>
                      </div>
                      {bp.source === "saved" && (
                        <div className="user-portal-blueprint-assign-wrap">
                          <label className="user-portal-blueprint-assign">
                            <span>Map Blueprint to</span>
                            <select
                              value={bp.childProfileId || "self"}
                              disabled={assignBusyId === bp.id}
                              data-testid={`user-portal-blueprint-assign-${bp.id}`}
                              onChange={(e) => void handleAssignBlueprint(bp.id, e.target.value)}
                            >
                              <option value="self">Myself (parent)</option>
                              {familyChildren
                                .filter((c) => c.source === "profile" && !c.needsRegistration)
                                .map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.displayName}
                                    {c.ageBand === "junior" ? " · Teens" : " · Kids"}
                                  </option>
                                ))}
                            </select>
                          </label>
                          {familyChildren.some(
                            (c) => c.needsRegistration || c.source === "signup",
                          ) && (
                            <div
                              className="user-portal-blueprint-register-kids"
                              data-testid={`user-portal-blueprint-register-kids-${bp.id}`}
                            >
                              <span>Need to assign to a kid who joined but isn&apos;t registered?</span>
                              <ul>
                                {familyChildren
                                  .filter((c) => c.needsRegistration || c.source === "signup")
                                  .map((c) => (
                                    <li key={c.id}>
                                      <button
                                        type="button"
                                        className="user-portal-kid-register-link"
                                        data-testid={`user-portal-blueprint-register-${bp.id}-${c.id}`}
                                        onClick={() =>
                                          openRegisterForKid(c, { blueprintId: bp.id })
                                        }
                                      >
                                        Register {c.displayName}
                                      </button>
                                      {c.childEmail ? (
                                        <span className="user-portal-kid-register-meta">
                                          {" "}
                                          ({c.childEmail})
                                        </span>
                                      ) : null}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      <ol className="user-portal-blueprint-matches">
                        {topMatches.map((m) => (
                          <MatchRow
                            key={`${bp.id}-${m.id}`}
                            match={m}
                            ageGroup={bp.ageGroup}
                            onOpenGuide={onOpenGuide}
                          />
                        ))}
                      </ol>
                      {moreMatches.length > 0 && (
                        <details
                          className="user-portal-blueprint-details user-portal-blueprint-more"
                          data-testid={`user-portal-blueprint-more-${bp.ageGroup}`}
                        >
                          <summary>
                            <span className="user-portal-blueprint-summary-main">
                              <strong>
                                {moreMatches.length} more match
                                {moreMatches.length === 1 ? "" : "es"}
                              </strong>
                              <span className="user-portal-blueprint-summary-meta">
                                Matches 4–{matches.length}
                              </span>
                            </span>
                            <span className="collapse-show-hide" aria-hidden="true" />
                          </summary>
                          <ol className="user-portal-blueprint-matches">
                            {moreMatches.map((m) => (
                              <MatchRow
                                key={`${bp.id}-${m.id}`}
                                match={m}
                                ageGroup={bp.ageGroup}
                                onOpenGuide={onOpenGuide}
                              />
                            ))}
                          </ol>
                        </details>
                      )}
                    </div>
                  );
                })}
            </section>
          )}

          {portalTab === "schedule" && (
            <HustleScheduleSuite
              membershipTier={membershipTierProp ?? credits?.membershipTier}
              isAdmin={isAdmin}
              tierLoading={creditsLoading && !membershipTierProp && !isAdmin}
              memberName={memberName}
              familyChildren={familyChildren}
              blueprints={blueprints}
              blueprintsLoading={blueprintsLoading}
              focusScheduleId={focusScheduleId}
              onFocusScheduleConsumed={onFocusScheduleConsumed}
              onOpenJoin={onOpenJoin}
              onOpenMatchWizard={onOpenMatchWizard}
              onOpenGuide={onOpenGuide}
            />
          )}

          {portalTab === "family" && (
            <section
              id="user-portal-panel-family"
              role="tabpanel"
              aria-labelledby="user-portal-tab-family"
              className="user-portal-family"
              data-testid="user-portal-family"
            >
              <div className="user-portal-blueprint-head">
                <h3 id="user-portal-family-heading">
                  <Users size={20} aria-hidden /> Family Coach
                </h3>
                <button
                  type="button"
                  className="btn btn-primary"
                  data-testid="user-portal-register-my-kid"
                  onClick={() => {
                    if (registerOpen) {
                      resetRegisterForm();
                    } else {
                      setJuniorSignupId(null);
                      setPendingAssignBlueprintId(null);
                      setKidName("");
                      setKidLoginEmail("");
                      setKidLoginPassword("");
                      setKidLoginPasswordConfirm("");
                      setKidAgeBand("kids");
                      setRegisterOpen(true);
                    }
                    setPortalTab("family");
                  }}
                >
                  Register My Kid
                </button>
              </div>
              <p className="user-portal-panel-lead">
                Create a profile for each kid, link Match Wizard Blueprints to them or yourself, and
                choose email progress reports. If a kid joined with your email, click their name to
                register — the form fills with the info they entered.
              </p>

              {familyMessage && (
                <p className="user-portal-family-ok" data-testid="user-portal-family-message">
                  {familyMessage}
                </p>
              )}
              {familyError && (
                <p className="user-portal-credits-error" data-testid="user-portal-family-error">
                  {familyError}
                </p>
              )}

              {registerOpen && (
                <form
                  className="user-portal-register-kid"
                  data-testid="user-portal-register-kid-form"
                  onSubmit={(e) => void handleRegisterKid(e)}
                >
                  <h4>
                    {juniorSignupId
                      ? `Register ${kidName || "this kid"}`
                      : "Register My Kid"}
                  </h4>
                  {juniorSignupId ? (
                    <p className="user-portal-register-kid-prefill" data-testid="register-kid-prefill-note">
                      Prefilled from their Kids Corner join
                      {pendingAssignBlueprintId
                        ? " — we will assign the Blueprint after you save."
                        : "."}
                    </p>
                  ) : null}
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-kid-name">
                      Kid first name / nickname
                    </label>
                    <input
                      id="register-kid-name"
                      className="text-input"
                      required
                      value={kidName}
                      onChange={(e) => setKidName(e.target.value)}
                      data-testid="register-kid-name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-kid-age">
                      Age band
                    </label>
                    <select
                      id="register-kid-age"
                      className="text-input"
                      value={kidAgeBand}
                      onChange={(e) => setKidAgeBand(e.target.value === "junior" ? "junior" : "kids")}
                      data-testid="register-kid-age"
                    >
                      <option value="kids">Kids (4–12)</option>
                      <option value="junior">Teens (13–17)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-kid-email">
                      Kid login email
                      {juniorSignupId ? " (from their join)" : " (required)"}
                    </label>
                    <input
                      id="register-kid-email"
                      className="text-input"
                      type="email"
                      required
                      value={kidLoginEmail}
                      onChange={(e) => setKidLoginEmail(e.target.value)}
                      data-testid="register-kid-email"
                    />
                  </div>
                  <PasswordField
                    id="register-kid-password"
                    label="Kid login password (required — they sign in with this)"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={kidLoginPassword}
                    onChange={setKidLoginPassword}
                    showStrength
                    data-testid="register-kid-password"
                  />
                  <PasswordField
                    id="register-kid-password-confirm"
                    label="Confirm kid login password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={kidLoginPasswordConfirm}
                    onChange={setKidLoginPasswordConfirm}
                    data-testid="register-kid-password-confirm"
                  />
                  <p className="user-portal-credits-muted" style={{ marginTop: 6 }}>
                    We email the kid and you when their login is ready.
                  </p>
                  <div className="user-portal-register-kid-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => resetRegisterForm()}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={registeringKid}
                      data-testid="register-kid-submit"
                    >
                      {registeringKid
                        ? "Saving…"
                        : pendingAssignBlueprintId
                          ? "Save & assign Blueprint"
                          : "Save kid profile"}
                    </button>
                  </div>
                </form>
              )}

              {familyLoading && (
                <WaitIndicator
                  className="user-portal-credits-muted"
                  data-testid="user-portal-family-loading"
                  message="Loading linked kids…"
                  style={{ marginTop: 0 }}
                />
              )}

              {!familyLoading && familyChildren.length === 0 && (
                <p className="user-portal-credits-muted" data-testid="user-portal-family-empty">
                  No kids linked yet. Tap Register My Kid to create a profile, or approve a Kids
                  Corner consent email if they signed up with your address.
                </p>
              )}

              {!familyLoading && familyChildren.length > 0 && (
                <ul className="user-portal-family-list" data-testid="user-portal-family-list">
                  {familyChildren.map((c) => {
                    const needsReg = Boolean(c.needsRegistration || c.source === "signup");
                    const assigned = needsReg
                      ? []
                      : blueprints.filter((bp) => bp.childProfileId === c.id);
                    const dashLabel =
                      c.ageBand === "junior" ? "Teens dashboard" : "Kids dashboard";
                    return (
                      <li key={c.id} data-testid={`user-portal-family-child-${c.id}`}>
                        <div className="user-portal-family-child-head">
                          <div className="user-portal-family-child-name-row">
                            {needsReg ? (
                              <button
                                type="button"
                                className="user-portal-kid-register-link"
                                data-testid={`user-portal-register-kid-link-${c.id}`}
                                onClick={() => openRegisterForKid(c)}
                              >
                                Register {c.displayName}
                              </button>
                            ) : (
                              <>
                                <strong className="user-portal-family-child-name">
                                  {c.displayName}
                                </strong>
                                {onOpenKidDashboard ? (
                                  <button
                                    type="button"
                                    className="user-portal-kid-dashboard-link"
                                    data-testid={`user-portal-kid-dashboard-${c.id}`}
                                    onClick={() =>
                                      onOpenKidDashboard({
                                        id: c.id,
                                        displayName: c.displayName,
                                        ageBand: c.ageBand === "junior" ? "junior" : "kids",
                                      })
                                    }
                                  >
                                    {dashLabel}
                                  </button>
                                ) : null}
                              </>
                            )}
                          </div>
                          <span>
                            {c.ageBand === "junior" ? "Teens" : "Kids"}
                            {needsReg ? " · not registered yet" : ""}
                            {c.status === "pending_parent" ? " · awaiting your consent" : ""}
                            {c.hasLogin ? " · login enabled" : ""}
                            {c.childEmail && needsReg ? ` · ${c.childEmail}` : ""}
                          </span>
                        </div>
                        {needsReg ? (
                          <em>
                            Click Register to create their profile — we&apos;ll use the info they
                            entered when they joined.
                          </em>
                        ) : (
                          <details
                            className="user-portal-family-blueprints"
                            data-testid={`user-portal-family-blueprints-${c.id}`}
                          >
                            <summary>
                              <span>
                                Blueprints{" "}
                                <strong>({assigned.length})</strong>
                              </span>
                              <span className="collapse-show-hide" aria-hidden="true" />
                            </summary>
                            {assigned.length === 0 ? (
                              <p className="user-portal-family-blueprints-empty">
                                No Blueprint assigned yet — map one under the Blueprint tab.
                              </p>
                            ) : (
                              <ul className="user-portal-family-blueprint-items">
                                {assigned.map((bp) => {
                                  const matches = (bp.resultIds ?? []).map((id, i) => ({
                                    id,
                                    rank: i + 1,
                                    label: blueprintMatchLabel(bp.ageGroup, id),
                                    pct: bp.resultPcts[id],
                                  }));
                                  const topMatches = matches.slice(0, 3);
                                  const moreMatches = matches.slice(3);
                                  return (
                                    <li key={bp.id}>
                                      <div className="user-portal-blueprint-block-head">
                                        <strong>{blueprintAgeGroupTitle(bp.ageGroup)}</strong>
                                        <span className="user-portal-blueprint-summary-meta">
                                          Top {Math.min(3, matches.length)} of {matches.length}
                                          {bp.completedAt
                                            ? ` · ${new Date(bp.completedAt).toLocaleDateString()}`
                                            : ""}
                                        </span>
                                      </div>
                                      <ol className="user-portal-blueprint-matches">
                                        {topMatches.map((m) => (
                                          <MatchRow
                                            key={`${bp.id}-${m.id}`}
                                            match={m}
                                            ageGroup={bp.ageGroup}
                                            onOpenGuide={onOpenGuide}
                                          />
                                        ))}
                                      </ol>
                                      {moreMatches.length > 0 ? (
                                        <details className="user-portal-blueprint-details user-portal-blueprint-more">
                                          <summary>
                                            <span className="user-portal-blueprint-summary-main">
                                              <strong>
                                                {moreMatches.length} more match
                                                {moreMatches.length === 1 ? "" : "es"}
                                              </strong>
                                            </span>
                                            <span className="collapse-show-hide" aria-hidden="true" />
                                          </summary>
                                          <ol className="user-portal-blueprint-matches">
                                            {moreMatches.map((m) => (
                                              <MatchRow
                                                key={`${bp.id}-${m.id}`}
                                                match={m}
                                                ageGroup={bp.ageGroup}
                                                onOpenGuide={onOpenGuide}
                                              />
                                            ))}
                                          </ol>
                                        </details>
                                      ) : null}
                                      {onOpenKidDashboard ? (
                                        <button
                                          type="button"
                                          className="btn btn-outline user-portal-family-blueprint-open"
                                          onClick={() =>
                                            onOpenKidDashboard({
                                              id: c.id,
                                              displayName: c.displayName,
                                              ageBand: c.ageBand === "junior" ? "junior" : "kids",
                                            })
                                          }
                                        >
                                          Open {dashLabel}
                                        </button>
                                      ) : null}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </details>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              <PortalSection
                testId="user-portal-family-reports"
                className="user-portal-family-reports"
                title="Kid progress emails"
              >
                <p>
                  Get a digest of linked kids&apos; logins and assigned Blueprints. You also get an
                  email every time a linked kid signs in.
                </p>
                <div className="user-portal-family-report-options">
                  {(
                    [
                      ["none", "Off"],
                      ["daily", "Daily"],
                      ["weekly", "Weekly"],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="kid-progress-cadence"
                        checked={reportCadence === value}
                        onChange={() => void handleReportCadence(value)}
                        data-testid={`user-portal-report-${value}`}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </PortalSection>
            </section>
          )}

          {portalTab === "credits" && (
            <section
              id="user-portal-panel-credits"
              role="tabpanel"
              aria-labelledby="user-portal-tab-credits"
              className="user-portal-credits"
              data-testid="user-portal-credits"
            >
              <h3 id="user-portal-credits-heading">
                <Coins size={20} aria-hidden /> Your Credits
              </h3>
              {isAdmin ? <AdminInternalCreditsPanel onGranted={loadCredits} /> : null}
              {creditsLoading && (
                <WaitIndicator
                  className="user-portal-credits-muted"
                  data-testid="user-portal-credits-loading"
                  message="Loading your credit balance…"
                  estimateMs={CREDITS_TAB_WAIT_MS}
                  style={{ marginTop: 0 }}
                />
              )}
              {!creditsLoading && creditsError && (
                <p className="user-portal-credits-error" data-testid="user-portal-credits-error">
                  {creditsError}
                </p>
              )}
              {!creditsLoading && credits && (
                <>
                  <div
                    className="user-portal-credits-enrolled"
                    data-testid="user-portal-credits-enrolled"
                  >
                    <p className="user-portal-credits-label">Enrolled in</p>
                    <p
                      className="user-portal-credits-enrolled-plan"
                      data-testid="user-portal-credits-enrolled-plan"
                    >
                      {credits.enrolledLabel}
                    </p>
                    <p className="user-portal-credits-muted">
                      {credits.monthlyAllowance > 0
                        ? `Plan includes ${credits.monthlyAllowance} credits / month`
                        : "Free plan — earn or purchase credits anytime"}
                      {onOpenJoin ? (
                        <>
                          {" "}
                          —{" "}
                          <button
                            type="button"
                            className="user-portal-inline-link"
                            onClick={onOpenJoin}
                            data-testid="user-portal-upgrade-membership"
                          >
                            Upgrade membership
                          </button>
                        </>
                      ) : null}
                    </p>
                  </div>

                  <div className="user-portal-credit-card" data-testid="user-portal-credits-available">
                    <p className="user-portal-credits-label">Credit balance</p>
                    <p
                      className="user-portal-credits-balance"
                      data-testid="user-portal-credits-balance"
                    >
                      {creditsBalanceHeadline(credits.balance)}
                    </p>
                    <p className="user-portal-credits-muted">
                      {formatKidCreditBalance(credits.balance)} available · 1 credit = $1 — same for
                      workshops, Story Time, and 1-on-1s at every age
                    </p>
                  </div>

                  <PortalSection
                    testId="user-portal-credits-totals"
                    className="user-portal-credits-totals"
                    title="Running totals"
                  >
                    <ul>
                      <li data-testid="user-portal-credits-total-earned">
                        <span>Earned (all time)</span>
                        <strong>{formatKidCreditBalance(credits.totals.earned)}</strong>
                      </li>
                      <li data-testid="user-portal-credits-total-spent">
                        <span>Spent (all time)</span>
                        <strong>{formatKidCreditBalance(credits.totals.spent)}</strong>
                      </li>
                      <li data-testid="user-portal-credits-total-balance">
                        <span>Current balance</span>
                        <strong>{formatKidCreditBalance(credits.totals.balance)}</strong>
                      </li>
                    </ul>
                    <p className="user-portal-credits-muted">{credits.ratioLabel}</p>
                  </PortalSection>

                  {credits.creditPacks.length > 0 ? (
                    <PortalSection
                      testId="user-portal-credits-packs"
                      className="user-portal-credits-packs"
                      title="Credit packs purchased"
                    >
                      <ul>
                        {credits.creditPacks.map((pack) => (
                          <li key={pack.sessionId}>
                            <div className="user-portal-credits-pack-copy">
                              <span>{formatCreditPackPurchaseLabel(pack)}</span>
                              {pack.paidAt ? (
                                <time className="user-portal-purchase-date" dateTime={pack.paidAt}>
                                  {formatPurchasePaidOn(pack.paidAt)}
                                </time>
                              ) : null}
                            </div>
                            <strong>{formatKidCreditBalance(pack.credits)}</strong>
                          </li>
                        ))}
                      </ul>
                    </PortalSection>
                  ) : null}

                  <div className="user-portal-credits-meta">
                    <p data-testid="user-portal-credits-tier">
                      Plan: <strong>{tierLabel}</strong>
                    </p>
                    {credits.monthlyAllowance > 0 ? (
                      <p data-testid="user-portal-credits-allowance">
                        Plan includes up to <strong>{credits.monthlyAllowance}</strong> credits /
                        month
                      </p>
                    ) : (
                      <p data-testid="user-portal-credits-allowance">
                        Earn or purchase credits anytime
                        {onOpenJoin ? (
                          <>
                            {" "}
                            — see packs on{" "}
                            <button
                              type="button"
                              className="user-portal-inline-link"
                              onClick={onOpenJoin}
                            >
                              Join
                            </button>
                            .
                          </>
                        ) : (
                          " — see packs on Join."
                        )}
                      </p>
                    )}
                  </div>
                  <PortalSection
                    testId="user-portal-credits-history-section"
                    className="user-portal-credits-history"
                    title="Credit ledger (running total)"
                  >
                    {credits.recent.length === 0 ? (
                      <p
                        className="user-portal-credits-muted"
                        data-testid="user-portal-credits-history-empty"
                      >
                        No credit activity yet. Refer a friend or open Ways to Earn to grow your
                        balance.
                      </p>
                    ) : (
                      <div className="user-portal-purchases-table-wrap">
                        <table
                          className="user-portal-purchases-table user-portal-credits-ledger"
                          data-testid="user-portal-credits-history"
                        >
                          <caption className="sr-only">
                            Credit ledger with date, change, and running balance
                          </caption>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Transaction</th>
                              <th>Change</th>
                              <th>Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {credits.recent.map((entry) => {
                              const when = entry.occurredAt || entry.createdAt;
                              return (
                                <tr key={entry.id} data-testid={`user-portal-credits-row-${entry.id}`}>
                                  <td>
                                    <time
                                      className="user-portal-credits-history-date"
                                      dateTime={when}
                                    >
                                      {formatLedgerWhen(when)}
                                    </time>
                                  </td>
                                  <td>{formatLedgerReason(entry.reason)}</td>
                                  <td>
                                    <strong
                                      className={`user-portal-credits-history-delta ${entry.delta >= 0 ? "is-credit" : "is-debit"}`}
                                    >
                                      {formatLedgerDelta(entry.delta)}
                                    </strong>
                                  </td>
                                  <td>
                                    <span
                                      className="user-portal-credits-running"
                                      data-testid="user-portal-credits-running"
                                    >
                                      {formatCreditCount(entry.balanceAfter)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </PortalSection>
                </>
              )}
            </section>
          )}

          {portalTab === "referral" && (
            <section
              id="user-portal-panel-referral"
              role="tabpanel"
              aria-labelledby="user-portal-tab-referral"
              className="user-portal-referral"
              data-testid="user-portal-referral"
            >
              <h3>
                <Link2 size={20} aria-hidden /> Referral
              </h3>
              <p className="user-portal-panel-lead">
                Share for <strong>+{inviteFriendCredits()} credits</strong>. Your code is{" "}
                <strong>{referralCode}</strong>. You can also copy the same link next to My Dashboard
                in the page header.
              </p>
              <ol className="invite-friend-steps">
                {inviteFriendSteps(true).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="user-portal-referral-row">
                <input
                  id="user-referral-link"
                  className="flat-input"
                  readOnly
                  value={referralUrl}
                  data-testid="user-referral-link"
                  aria-label="Your referral link"
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void copyReferral()}
                  data-testid="user-referral-copy"
                >
                  <Copy size={16} aria-hidden /> {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </section>
          )}

          {portalTab === "purchases" && (
            <section
              id="user-portal-panel-purchases"
              role="tabpanel"
              aria-labelledby="user-portal-tab-purchases"
              className="user-portal-purchases"
              data-testid="user-portal-purchases"
            >
              <h3 id="user-portal-purchases-heading">
                <Receipt size={20} aria-hidden /> Billing / Access
              </h3>
              <p className="user-portal-panel-lead">
                Your membership access, paid sessions, and Stripe billing history in one place.
              </p>

              <PortalSection
                testId="user-portal-plan-manage"
                className="user-portal-plan-manage"
                title="Change plan or deactivate"
                defaultOpen
              >
                <p data-testid="user-portal-plan-current">
                  Current plan: <strong>{currentTierDef.name}</strong>
                  {isPaidMembershipTier(effectiveMembershipTier)
                    ? " (paid membership)"
                    : " (Free account)"}
                </p>

                <div className="user-portal-plan-links" data-testid="user-portal-plan-links">
                  {upgradeOptions.length > 0 ? (
                    <p className="user-portal-plan-link-row" data-testid="user-portal-plan-upgrades">
                      <span className="user-portal-plan-link-label">Upgrade account:</span>
                      {upgradeOptions.map((opt, i) => (
                        <span key={opt.id}>
                          {i > 0 ? <span aria-hidden> · </span> : null}
                          <button
                            type="button"
                            className="user-portal-inline-link"
                            disabled={!onOpenJoin || planActionBusy}
                            data-testid={`user-portal-upgrade-${opt.id}`}
                            onClick={() => onOpenJoin?.()}
                          >
                            {opt.name}
                            {opt.priceMonthlyUsd > 0 ? ` ($${opt.priceMonthlyUsd}/mo)` : ""}
                          </button>
                        </span>
                      ))}
                    </p>
                  ) : (
                    <p className="user-portal-credits-muted" data-testid="user-portal-plan-top-tier">
                      You are on the highest plan.
                    </p>
                  )}

                  {downgradeOptions.length > 0 ? (
                    <p className="user-portal-plan-link-row" data-testid="user-portal-plan-downgrades">
                      <span className="user-portal-plan-link-label">Downgrade account:</span>
                      {downgradeOptions.map((opt, i) => (
                        <span key={opt.id}>
                          {i > 0 ? <span aria-hidden> · </span> : null}
                          {opt.id === "free" ? (
                            <button
                              type="button"
                              className="user-portal-inline-link"
                              disabled={planActionBusy}
                              data-testid="user-portal-cancel-to-free"
                              onClick={() => setConfirmPlanAction("cancel_to_free")}
                            >
                              Free
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="user-portal-inline-link"
                              disabled={!onOpenJoin || planActionBusy}
                              data-testid={`user-portal-downgrade-open-${opt.id}`}
                              onClick={() => onOpenJoin?.()}
                            >
                              {opt.name}
                              {opt.priceMonthlyUsd > 0 ? ` ($${opt.priceMonthlyUsd}/mo)` : ""}
                            </button>
                          )}
                        </span>
                      ))}
                    </p>
                  ) : (
                    <p className="user-portal-credits-muted" data-testid="user-portal-plan-already-free">
                      You are on Free — use deactivate below if you want to leave GYSH.
                    </p>
                  )}
                </div>

                {confirmPlanAction ? (
                  <div
                    className="user-portal-plan-confirm"
                    role="alertdialog"
                    aria-labelledby="user-portal-plan-confirm-title"
                    data-testid="user-portal-plan-confirm"
                  >
                    <p id="user-portal-plan-confirm-title">
                      <strong>
                        {confirmPlanAction === "cancel_to_free"
                          ? "Downgrade account?"
                          : "Deactivate account?"}
                      </strong>
                    </p>
                    <p>
                      {membershipCancelConfirmCopy(confirmPlanAction, {
                        linkedKidCount: linkedKidLoginCount,
                      })}
                    </p>
                    <div className="user-portal-plan-confirm-actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={planActionBusy}
                        data-testid="user-portal-plan-confirm-cancel"
                        onClick={() => setConfirmPlanAction(null)}
                      >
                        Keep my plan
                      </button>
                      <button
                        type="button"
                        className={
                          confirmPlanAction === "deactivate_account" ? "btn btn-danger" : "btn btn-primary"
                        }
                        disabled={planActionBusy}
                        data-testid="user-portal-plan-confirm-yes"
                        onClick={() => void runPlanAction(confirmPlanAction)}
                      >
                        {confirmPlanAction === "cancel_to_free"
                          ? "Yes, downgrade to Free"
                          : "Yes, deactivate my account"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="user-portal-plan-link-row user-portal-plan-deactivate-row">
                    <button
                      type="button"
                      className="user-portal-inline-link user-portal-inline-link--danger"
                      disabled={planActionBusy}
                      data-testid="user-portal-deactivate-account"
                      onClick={() => setConfirmPlanAction("deactivate_account")}
                    >
                      Deactivate account
                    </button>
                  </p>
                )}

                {planActionMsg ? (
                  <p className="user-portal-plan-msg" data-testid="user-portal-plan-msg">
                    {planActionMsg}
                  </p>
                ) : null}
                {planActionError ? (
                  <p className="user-portal-credits-error" data-testid="user-portal-plan-error">
                    {planActionError}
                  </p>
                ) : null}
              </PortalSection>

              {purchasesLoading && (
                <WaitIndicator
                  className="user-portal-credits-muted"
                  data-testid="user-portal-purchases-loading"
                  message="Loading billing history…"
                  estimateMs={BILLING_ACCESS_WAIT_MS}
                  style={{ marginTop: 0 }}
                />
              )}

              {!purchasesLoading && purchasesError && (
                <p className="user-portal-credits-error" data-testid="user-portal-purchases-error">
                  {purchasesError}
                </p>
              )}

              {!purchasesLoading && purchasesAccess && (
                <PortalSection
                  testId="user-portal-purchases-access"
                  className="user-portal-purchases-access"
                  title="What you have access to"
                  defaultOpen={false}
                >
                  <p data-testid="user-portal-purchases-enrolled">
                    Enrolled in <strong>{purchasesAccess.enrolledLabel}</strong>
                    {purchasesAccess.scheduleSuite ? " · Schedule Suite unlocked" : ""}
                    {purchasesAccess.membershipPaidAt ? (
                      <>
                        {" "}
                        · since{" "}
                        <time dateTime={purchasesAccess.membershipPaidAt}>
                          {formatPurchasePaidOn(purchasesAccess.membershipPaidAt)}
                        </time>
                      </>
                    ) : null}
                  </p>
                  {purchasesAccess.features.length > 0 ? (
                    <ul className="user-portal-purchases-features" data-testid="user-portal-purchases-features">
                      {purchasesAccess.features.map((f) => (
                        <li key={f.id}>
                          <strong>{f.label}</strong>
                          <span>{f.detail}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {purchasesAccess.purchasedSessions.length > 0 ? (
                    <PortalSection
                      testId="user-portal-purchases-sessions"
                      title="A-la-carte sessions purchased"
                      headingTag="h5"
                    >
                      <ul>
                        {purchasesAccess.purchasedSessions.map((row) => (
                          <li key={row.id}>
                            <span>{row.label}</span>
                            <time className="user-portal-purchase-date" dateTime={row.paidAt}>
                              {formatPurchasePaidOn(row.paidAt)}
                            </time>
                          </li>
                        ))}
                      </ul>
                    </PortalSection>
                  ) : null}
                  {purchasesAccess.creditPacks.length > 0 ? (
                    <PortalSection
                      testId="user-portal-purchases-packs"
                      title="Credit packs purchased"
                      headingTag="h5"
                    >
                      <ul>
                        {purchasesAccess.creditPacks.map((row) => (
                          <li key={row.id}>
                            <span>{row.label}</span>
                            <time className="user-portal-purchase-date" dateTime={row.paidAt}>
                              {formatPurchasePaidOn(row.paidAt)}
                            </time>
                          </li>
                        ))}
                      </ul>
                    </PortalSection>
                  ) : null}
                  {onOpenJoin ? (
                    <p>
                      <button
                        type="button"
                        className="user-portal-inline-link"
                        onClick={onOpenJoin}
                        data-testid="user-portal-purchases-upgrade"
                      >
                        Upgrade membership or buy a-la-carte
                      </button>
                    </p>
                  ) : null}
                </PortalSection>
              )}

              {!purchasesLoading && purchasesBilling && (
                <PortalSection
                  testId="user-portal-purchases-totals"
                  className="user-portal-purchases-totals"
                  title="Billing totals"
                >
                  <div className="user-portal-purchases-table-wrap">
                    <table className="user-portal-purchases-table">
                      <caption className="sr-only">Payments received</caption>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Count</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">Payments recorded</th>
                          <td>{purchasesBilling.count}</td>
                          <td>{formatBillingUsd(purchasesBilling.amountUsd)}</td>
                        </tr>
                        {Object.entries(purchasesBilling.byKind).map(([kind, row]) => (
                          <tr key={kind} data-testid={`user-portal-billing-category-${kind}`}>
                            <th scope="row">{billingCategoryLabel(kind)}</th>
                            <td>{row.count}</td>
                            <td>{formatBillingUsd(row.amountUsd)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </PortalSection>
              )}

              {!purchasesLoading && (
                <PortalSection
                  testId="user-portal-purchases-history"
                  className="user-portal-purchases-history"
                  title="Billing history"
                >
                  {purchases.length === 0 ? (
                    <p
                      className="user-portal-credits-muted"
                      data-testid="user-portal-purchases-empty"
                    >
                      No Stripe purchases yet. Membership checkouts, a-la-carte sessions, and credit
                      packs will show up here after payment.
                    </p>
                  ) : (
                    <div className="user-portal-purchases-table-wrap">
                      <table className="user-portal-purchases-table user-portal-purchases-history-table">
                        <caption className="sr-only">
                          Billing history with Kid and adult credits granted and running totals
                        </caption>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Credits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchases.map((p) => (
                            <tr key={p.id} data-testid={`user-portal-purchase-row-${p.id}`}>
                              <td>
                                <time dateTime={p.paidAt}>{formatPurchasePaidAt(p.paidAt)}</time>
                              </td>
                              <td>{purchaseKindLabel(p.kind)}</td>
                              <td>{formatPurchaseDescription(p)}</td>
                              <td>{formatPurchaseAmount(p)}</td>
                              <td>
                                <div className="user-portal-credits-stack">
                                  <strong data-testid="user-portal-purchase-kid-granted">
                                    {formatCreditsGranted(p.kidCreditsGranted)}
                                  </strong>
                                  {p.kidCreditsRunning > 0 ? (
                                    <span
                                      className="user-portal-credits-stack-sub"
                                      data-testid="user-portal-purchase-kid-running"
                                    >
                                      {formatKidCreditBalance(p.kidCreditsRunning)} total
                                    </span>
                                  ) : (
                                    <span className="user-portal-credits-stack-sub">—</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </PortalSection>
              )}
            </section>
          )}

          {portalTab === "earn" && (
            <section
              id="user-portal-panel-earn"
              role="tabpanel"
              aria-labelledby="user-portal-tab-earn"
              data-testid="user-portal-earn-credits"
            >
              <h3>
                <Sparkles size={20} aria-hidden /> Ways to Earn Credits
          </h3>
              <p className="user-portal-panel-lead">
                Treat this like an earnings checklist — refer, finish a guide, launch, and share a win.
                Earn actions grow your credit balance.
              </p>
              <ul className="user-portal-earn-list">
                {earnActions.map((a) => (
                  <li key={a.id} data-testid={`user-earn-${a.id}`}>
                    <strong className="user-portal-earn-delta">{formatEarnCreditDelta(a.credits)}</strong>
                    <span>
                      <strong className="user-portal-earn-label">{a.label}</strong>
                      <em className="user-portal-earn-detail">{a.detail}</em>
                    </span>
                  </li>
                ))}
              </ul>
              <ShareWinForm />
            </section>
          )}

          {portalTab === "milestones" && (
            <section
              id="user-portal-panel-milestones"
              role="tabpanel"
              aria-labelledby="user-portal-tab-milestones"
              data-testid="user-portal-milestones"
            >
              <h3>
                <CheckSquare size={20} style={{ color: "var(--accent-purple)" }} /> My Active
                Milestones
              </h3>
              <div className="user-portal-goal-list">
                {goals.map((g) => (
              <div 
                key={g.id} 
                onClick={() => toggleGoal(g.id)}
                className={`checklist-item ${g.done ? "completed" : ""}`}
                style={{ margin: 0 }}
              >
                    <div className="checklist-checkbox">{g.done && <Check size={12} />}</div>
                <div className="checklist-text">
                  <span style={{ fontSize: "0.925rem" }}>{g.title}</span>
                </div>
              </div>
            ))}
              </div>
              <div className="user-portal-progress">
                <div className="user-portal-progress-labels">
                  <span>Overall Roadmap Completion</span>
                  <span>{progressPercent}% Complete</span>
                </div>
                <div className="user-portal-progress-track">
                  <div
                    className="user-portal-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
          </div>
        </div>
            </section>
          )}

          {portalTab === "bookmarks" && (
            <section
              id="user-portal-panel-bookmarks"
              role="tabpanel"
              aria-labelledby="user-portal-tab-bookmarks"
              data-testid="user-portal-bookmarks"
            >
              <h3>
            <Bookmark size={20} style={{ color: "var(--accent-pink)" }} /> Bookmarked Hustles
          </h3>
              <div className="user-portal-bookmarks">
                <div className="user-portal-bookmark-card">
                  <span className="glow-badge pink">Real Estate</span>
                  <h4>Airbnb Hosting</h4>
                  <p>Active guide progress: 33%</p>
            </div>
                <div className="user-portal-bookmark-card">
                  <span className="glow-badge purple">E-Commerce</span>
                  <h4>Print-on-Demand</h4>
                  <p>Active guide progress: 50%</p>
            </div>
          </div>
            </section>
          )}
        </div>
      </div>

      <div className="user-portal-side">
        <PortalSection
          testId="user-portal-unlocked-badges"
          title="Unlocked Badges"
          headingTag="h3"
          icon={<Award size={20} aria-hidden />}
        >
          <div className="user-portal-badges">
            {badges.map((b, idx) => (
              <div key={idx} className={`user-portal-badge${b.unlocked ? " is-unlocked" : ""}`}>
                <div className="user-portal-badge-icon">
                  {b.unlocked ? (
                    <Star size={20} style={{ color: "white", fill: "white" }} />
                  ) : (
                    <Zap size={20} style={{ color: "var(--text-primary)" }} />
                  )}
                </div>
                <div>
                  <h4>{b.name}</h4>
                  <p>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </PortalSection>

        <PortalSection
          testId="user-portal-hustle-level"
          title="Hustle Level: 3"
          headingTag="h3"
        >
          <p>
            Earn 120 more XP by completing milestones to unlock &quot;Level 4: Affiliate Expert&quot;.
          </p>
          <div className="user-portal-progress-track">
            <div className="user-portal-progress-fill is-pink" style={{ width: "60%" }} />
          </div>
        </PortalSection>
      </div>
    </div>
  );
};
