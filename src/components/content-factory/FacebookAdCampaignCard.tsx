import { useCallback, type RefObject } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, ExternalLink, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildFacebookAdLaunchSteps,
  buildFacebookAdProduceSteps,
  facebookAdStepCopyContent,
  facebookAdStepCopyLabel,
  facebookAdStepStorageId,
  formatFacebookAdPasteBlock,
  formatFacebookAdScheduleNote,
  getFacebookAdScheduleDates,
  type FacebookAdCampaign,
  type FacebookAdLaunchStep,
} from "@/lib/content-factory/facebook-ad-launch";
import type { EditorialMilestone } from "@/lib/content-factory/weekly-editorial-schedule";
import { formatEditorialTimeLabel } from "@/lib/content-factory/weekly-editorial-schedule";
import {
  FACEBOOK_AD_LAUNCH_TIME,
  FACEBOOK_AD_PRODUCE_TIME,
} from "@/lib/content-factory/facebook-ad-launch";

function CopyBlock({ label, value }: { label: string; value: string }) {
  const copy = useCallback(() => {
    if (typeof navigator?.clipboard?.writeText !== "function") return;
    void navigator.clipboard.writeText(value).then(() => {
      toast.success(`${label} copied`);
    });
  }, [label, value]);

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-primary">{label}</span>
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={copy}>
          <Copy className="h-3.5 w-3.5 mr-1" />
          Copy
        </Button>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed">
        {value}
      </pre>
    </div>
  );
}

function AdChecklist({
  steps,
  eventDate,
  campaign,
  completedEvents,
  onToggleCompleted,
}: {
  steps: FacebookAdLaunchStep[];
  eventDate: string;
  campaign: FacebookAdCampaign;
  completedEvents?: Record<string, boolean>;
  onToggleCompleted?: (storageId: string, legacyId?: string) => void;
}) {
  return (
    <ol className="space-y-2">
      {steps.map((step, index) => {
        const storageId = facebookAdStepStorageId(eventDate, step.id);
        const legacyId = `facebook_ad:${step.id}`;
        const checked = !!(completedEvents?.[storageId] ?? completedEvents?.[legacyId]);
        return (
          <li
            key={step.id}
            className={`rounded-lg border border-border/50 bg-background/50 px-3 py-2 ${
              checked ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleCompleted?.(storageId, legacyId)}
                className="mt-1 h-4 w-4 rounded border-input cursor-pointer"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <span className={`text-sm ${checked ? "line-through" : ""}`}>
                  <span className="font-bold tabular-nums text-muted-foreground mr-1">
                    {index + 1}.
                  </span>
                  {step.label}
                </span>
                {step.detail ? (
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                ) : null}
                {(() => {
                  const copyLabel = facebookAdStepCopyLabel(step);
                  const copyValue = facebookAdStepCopyContent(step, campaign);
                  if (!copyLabel || !copyValue) return null;
                  return <CopyBlock label={copyLabel} value={copyValue} />;
                })()}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function FacebookAdCreativeSection({ campaign }: { campaign: FacebookAdCampaign }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold">Campaign strategy</h3>
      <CopyBlock label="Traffic first — not Page Likes (v1)" value={campaign.strategyNote} />

      <h3 className="text-sm font-bold pt-1">Meta & CMS compliance</h3>
      <CopyBlock label="Compliance checklist" value={campaign.metaComplianceNotes} />

      <h3 className="text-sm font-bold pt-1">Hedra video — conversational story (~28s)</h3>
      <CopyBlock label="Step 1 — character image (create once)" value={campaign.hedraCharacterImagePrompt} />
      <CopyBlock label="Full voiceover script" value={campaign.voiceoverScript} />
      <CopyBlock label="Hedra workflow" value={campaign.hedraNotes} />
      {campaign.hedraScenes.map((scene) => (
        <div key={scene.id} className="space-y-2 rounded-lg border border-border/40 p-3">
          <p className="text-xs font-semibold text-primary">{scene.label}</p>
          <CopyBlock label="VO for Hedra lip-sync (exact)" value={scene.voiceoverLine} />
          <CopyBlock label="Motion prompt (saved character)" value={scene.prompt} />
        </div>
      ))}
      <CopyBlock label="All prompts in one block" value={campaign.videoPrompt} />
      <CopyBlock label="Image fallback" value={campaign.imageNote} />
    </div>
  );
}

export function FacebookAdCampaignOverview({
  campaign,
  focusMilestone,
  produceRef,
  launchRef,
  completedEvents,
  onToggleCompleted,
}: {
  campaign: FacebookAdCampaign;
  focusMilestone?: EditorialMilestone;
  produceRef?: RefObject<HTMLDivElement | null>;
  launchRef?: RefObject<HTMLDivElement | null>;
  completedEvents?: Record<string, boolean>;
  onToggleCompleted?: (storageId: string, legacyId?: string) => void;
}) {
  const dates = getFacebookAdScheduleDates();
  const produceSteps = buildFacebookAdProduceSteps(dates);
  const launchSteps = buildFacebookAdLaunchSteps(dates);
  const pasteAll = formatFacebookAdPasteBlock(campaign);

  const copyAll = useCallback(() => {
    void navigator.clipboard.writeText(pasteAll).then(() => {
      toast.success("Full ad copy block copied");
    });
  }, [pasteAll]);

  const produceTime = formatEditorialTimeLabel(FACEBOOK_AD_PRODUCE_TIME);
  const launchTime = formatEditorialTimeLabel(FACEBOOK_AD_LAUNCH_TIME);

  return (
    <Card id={`ad-${campaign.id}`} className="glass p-5 space-y-5 scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-bold">{campaign.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{campaign.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            Prep {dates.produceDate} · {produceTime}
          </Badge>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            Launch {dates.launchDate} · {launchTime}
          </Badge>
        </div>
      </div>

      <p className="text-xs rounded-md border border-amber-300/50 bg-amber-50/80 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100 px-3 py-2 leading-relaxed">
        {formatFacebookAdScheduleNote(dates)}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <CopyBlock label="Objective" value={campaign.targeting.objective} />
        <CopyBlock label="Daily budget" value={campaign.targeting.dailyBudget} />
        <CopyBlock label="Audience" value={`${campaign.targeting.locations} · Ages ${campaign.targeting.ageRange}`} />
        <CopyBlock label="Interests" value={campaign.targeting.interests} />
        <CopyBlock label="Placements" value={campaign.targeting.placements} />
        <CopyBlock label="CTA button" value={campaign.copy.callToAction} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold">Ad copy for Meta</h3>
          <Button type="button" size="sm" variant="outline" onClick={copyAll}>
            <Copy className="h-3.5 w-3.5 mr-1" />
            Copy all fields
          </Button>
        </div>
        <CopyBlock label="Primary text" value={campaign.copy.primaryText} />
        <CopyBlock label="Headline" value={campaign.copy.headline} />
        <CopyBlock label="Description" value={campaign.copy.description} />
        <CopyBlock label="Destination URL" value={campaign.copy.destinationUrl} />
        <CopyBlock label="Disclaimer (must appear in primary text)" value={campaign.copy.disclaimer} />
      </div>

      <div className="space-y-3">
        <FacebookAdCreativeSection campaign={campaign} />
      </div>

      <div
        ref={produceRef}
        className={`space-y-2 rounded-lg border border-border/40 p-3 ${
          focusMilestone === "produce" ? "ring-2 ring-primary/40 border-primary/30" : ""
        }`}
      >
        <h3 className="text-sm font-bold">
          Tonight ({dates.produceDate} · {produceTime}) — setup checklist
        </h3>
        <AdChecklist
          steps={produceSteps}
          eventDate={dates.produceDate}
          campaign={campaign}
          completedEvents={completedEvents}
          onToggleCompleted={onToggleCompleted}
        />
      </div>

      <div
        ref={launchRef}
        className={`space-y-2 rounded-lg border border-border/40 p-3 ${
          focusMilestone === "launch" ? "ring-2 ring-primary/40 border-primary/30" : ""
        }`}
      >
        <h3 className="text-sm font-bold">
          Tomorrow ({dates.launchDate} · {launchTime}) — go-live checklist
        </h3>
        <AdChecklist
          steps={launchSteps}
          eventDate={dates.launchDate}
          campaign={campaign}
          completedEvents={completedEvents}
          onToggleCompleted={onToggleCompleted}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <a href="https://adsmanager.facebook.com/" target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="default">
            Open Meta Ads Manager
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </a>
        <Link to="/admin/calendar" search={{ view: "daily", date: dates.produceDate }}>
          <Button type="button" variant="outline">
            View on calendar
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export function FacebookAdCampaignCard({
  campaign,
  milestone,
  highlighted = false,
  completedEvents,
  onToggleCompleted,
}: {
  campaign: FacebookAdCampaign;
  milestone: EditorialMilestone;
  highlighted?: boolean;
  completedEvents?: Record<string, boolean>;
  onToggleCompleted?: (storageId: string, legacyId?: string) => void;
}) {
  const dates = getFacebookAdScheduleDates();
  const eventDate = milestone === "produce" ? dates.produceDate : dates.launchDate;
  const time =
    milestone === "produce"
      ? formatEditorialTimeLabel(FACEBOOK_AD_PRODUCE_TIME)
      : formatEditorialTimeLabel(FACEBOOK_AD_LAUNCH_TIME);
  const steps =
    milestone === "produce"
      ? buildFacebookAdProduceSteps(dates)
      : buildFacebookAdLaunchSteps(dates);
  const pasteAll = formatFacebookAdPasteBlock(campaign);

  const copyAll = useCallback(() => {
    void navigator.clipboard.writeText(pasteAll).then(() => {
      toast.success("Full ad copy block copied");
    });
  }, [pasteAll]);

  return (
    <Card
      id={`ad-${campaign.id}-${milestone}`}
      className={`glass p-5 space-y-4 scroll-mt-24 ${
        highlighted ? "ring-2 ring-primary/40 border-primary/30" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-bold">{campaign.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{campaign.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{milestone === "produce" ? "Prep tonight" : "Launch tomorrow"}</Badge>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            {eventDate} · {time}
          </Badge>
        </div>
      </div>

      <p className="text-xs rounded-md border border-amber-300/50 bg-amber-50/80 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100 px-3 py-2 leading-relaxed">
        {formatFacebookAdScheduleNote(dates)}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <CopyBlock label="Objective" value={campaign.targeting.objective} />
        <CopyBlock label="Daily budget" value={campaign.targeting.dailyBudget} />
        <CopyBlock label="Audience" value={`${campaign.targeting.locations} · Ages ${campaign.targeting.ageRange}`} />
        <CopyBlock label="Interests" value={campaign.targeting.interests} />
        <CopyBlock label="Placements" value={campaign.targeting.placements} />
        <CopyBlock label="CTA button" value={campaign.copy.callToAction} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold">Ad copy for Meta</h3>
          <Button type="button" size="sm" variant="outline" onClick={copyAll}>
            <Copy className="h-3.5 w-3.5 mr-1" />
            Copy all fields
          </Button>
        </div>
        <CopyBlock label="Primary text" value={campaign.copy.primaryText} />
        <CopyBlock label="Headline" value={campaign.copy.headline} />
        <CopyBlock label="Description" value={campaign.copy.description} />
        <CopyBlock label="Destination URL" value={campaign.copy.destinationUrl} />
        <CopyBlock label="Disclaimer (must appear in primary text)" value={campaign.copy.disclaimer} />
      </div>

      <FacebookAdCreativeSection campaign={campaign} />

      <div className="space-y-2">
        <h3 className="text-sm font-bold">
          {milestone === "produce" ? "Tonight — setup checklist" : "Tomorrow — go-live checklist"}
        </h3>
        <AdChecklist
          steps={steps}
          eventDate={eventDate}
          campaign={campaign}
          completedEvents={completedEvents}
          onToggleCompleted={onToggleCompleted}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <a
          href="https://adsmanager.facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button type="button" variant="default">
            Open Meta Ads Manager
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </a>
        <Link to="/admin/calendar" search={{ view: "daily", date: eventDate }}>
          <Button type="button" variant="outline">
            View on calendar
          </Button>
        </Link>
      </div>
    </Card>
  );
}
