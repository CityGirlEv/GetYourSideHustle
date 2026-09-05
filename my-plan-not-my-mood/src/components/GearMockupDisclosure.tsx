import React from 'react';
import {
  GEAR_MOCKUP_DISCLOSURE_BODY,
  GEAR_MOCKUP_DISCLOSURE_CLASS,
  GEAR_MOCKUP_DISCLOSURE_LABEL,
  GEAR_MOCKUP_DISCLOSURE_TITLE,
} from '../lib/gearSelections';

export const GearMockupDisclosure: React.FC = () => (
  <aside
    role="note"
    className={GEAR_MOCKUP_DISCLOSURE_CLASS}
    data-testid="gear-mockup-disclosure"
  >
    <div className="flex items-center gap-2">
      <span className="h-px flex-1 bg-[#C2410C]/50" aria-hidden />
      <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#C2410C] font-serif">
        ✦ {GEAR_MOCKUP_DISCLOSURE_LABEL} ✦
      </p>
      <span className="h-px flex-1 bg-[#C2410C]/50" aria-hidden />
    </div>
    <p
      className="text-center font-serif italic text-[11px] leading-tight text-[#9A3412]"
      data-testid="gear-mockup-disclosure-title"
    >
      {GEAR_MOCKUP_DISCLOSURE_TITLE}
    </p>
    <p
      className="text-center text-[10px] leading-snug text-[#3F3832] font-serif"
      data-testid="gear-mockup-disclosure-body"
    >
      {GEAR_MOCKUP_DISCLOSURE_BODY}
    </p>
  </aside>
);
