import { cn } from "@/lib/utils";
import { MEDICARE_DISCLAIMER_SECTIONS, MEDICARE_GOV_URL } from "@/lib/medicare-disclaimers";

interface MedicareDisclaimersProps {
  className?: string;
}

function DisclaimerBody({ body, medicareLink }: { body: string; medicareLink?: boolean }) {
  if (!medicareLink) {
    return <>{body}</>;
  }

  const parts = body.split("Medicare.gov");
  if (parts.length === 1) return <>{body}</>;

  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 ? (
            <a
              href={MEDICARE_GOV_URL}
              className="underline hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              Medicare.gov
            </a>
          ) : null}
        </span>
      ))}
    </>
  );
}

export function MedicareDisclaimers({ className }: MedicareDisclaimersProps) {
  return (
    <div
      className={cn("space-y-3 text-left text-sm leading-relaxed text-muted-foreground", className)}
    >
      {MEDICARE_DISCLAIMER_SECTIONS.map((section) => (
        <p key={section.label}>
          <strong className="text-foreground">{section.label}:</strong>{" "}
          <DisclaimerBody
            body={section.body}
            medicareLink={"medicareLink" in section && section.medicareLink}
          />
        </p>
      ))}
    </div>
  );
}
