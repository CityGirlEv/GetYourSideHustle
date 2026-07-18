import { Play } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { NO_PHI_PII_COLLECTION_NOTE } from "@/lib/plan-comparison-copy";
import { SITE_BRAND_THE } from "@/lib/site-brand";
import { cn } from "@/lib/utils";

export const HOME_HOW_IT_WORKS_VIDEO_SRC = "/videos/how-it-works.mp4";
export const HOME_HOW_IT_WORKS_VIDEO_POSTER = "/videos/how-it-works-poster.jpg";

interface HomeHowItWorksVideoProps {
  className?: string;
}

export function HomeHowItWorksVideo({ className }: HomeHowItWorksVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      video.muted = false;
      await video.play();
      setStarted(true);
    } catch {
      video.muted = true;
      await video.play();
      setStarted(true);
    }
  };

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-muted/20 px-3 pb-5 sm:px-4 sm:pb-6",
        className,
      )}
      aria-labelledby="home-how-it-works-heading"
    >
      <h2
        id="home-how-it-works-heading"
        className="font-display text-2xl font-bold text-primary text-balance text-center sm:text-3xl mb-1 sm:mb-2"
      >
        This Ever Happen To You?
      </h2>

      <div className="flex flex-col items-start gap-5 px-4 sm:px-8 md:px-12 lg:px-16 md:flex-row md:items-center md:gap-6">
        <div className="min-w-0 flex-1 space-y-3 text-left">
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Constant phone calls, mailers, and conflicting advice can make Medicare feel overwhelming —
            and hard to know what actually fits your situation. {SITE_BRAND_THE} helps you benchmark
            your options privately — no phone number, no email, and no salesperson on the line. Watch
            how the tool works before you start.
          </p>

          <div className="space-y-2 text-sm leading-relaxed text-foreground/90 sm:text-base">
            <p>
              Enter basic information common to your situation — nothing that specifically identifies
              you — to explore sample plans available in your area. {NO_PHI_PII_COLLECTION_NOTE}
            </p>
            <p className="text-muted-foreground text-xs leading-snug sm:text-sm">
              We may not represent every plan available in your area. Any information we provide is for
              educational purposes only and is not a complete listing of plans.
            </p>
          </div>

          <p className="text-xs leading-snug text-muted-foreground">
            Educational only — we do not sell insurance or enroll you in coverage. Sample plans for
            illustration; verify details on Medicare.gov before you decide.
          </p>
        </div>

        <div className="relative w-full max-w-[11rem] shrink-0 md:max-w-[13rem] md:ml-auto">
          <div className="relative rounded-[2.25rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-xl shadow-primary/10 ring-1 ring-black/10">
            <div className="pointer-events-none absolute left-1/2 top-2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-neutral-800" />
            <div className="overflow-hidden rounded-[1.5rem] bg-black">
              <video
                ref={videoRef}
                className="aspect-[9/16] w-full bg-black object-cover"
                src={HOME_HOW_IT_WORKS_VIDEO_SRC}
                poster={HOME_HOW_IT_WORKS_VIDEO_POSTER}
                playsInline
                controls={started}
                preload="metadata"
                muted
                loop
                aria-label={`How ${SITE_BRAND_THE} works — short educational walkthrough`}
                onPlay={() => setStarted(true)}
              />
            </div>
          </div>

          {!started ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Button
                type="button"
                size="lg"
                className="pointer-events-auto h-14 w-14 rounded-full shadow-lg"
                onClick={() => void play()}
                aria-label="Play how it works video"
              >
                <Play className="h-6 w-6 fill-current" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
