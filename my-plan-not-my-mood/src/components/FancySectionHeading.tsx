import React from 'react';
import type { HomePillarDisplay } from '../lib/homePillars';

interface FancySectionHeadingProps {
  title: string;
  display: HomePillarDisplay;
  testId: string;
  align?: 'center' | 'left';
  trailing?: React.ReactNode;
}

export function FancySectionHeading({
  title,
  display,
  testId,
  align = 'left',
  trailing,
}: FancySectionHeadingProps) {
  return (
    <div
      className={`flex flex-col gap-1.5 sm:gap-1 leading-tight min-w-0 ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
    >
      {display.kicker ? <span className="home-heading-kicker">{display.kicker}</span> : null}
      <div className={`flex gap-2 sm:gap-3 min-w-0 max-w-full ${trailing ? 'flex-nowrap items-center' : 'items-baseline'}`}>
        <h2 data-testid={testId} className="home-heading-script min-w-0">
          {display.script}
          <span className="sr-only">{title}</span>
        </h2>
        {trailing}
      </div>
    </div>
  );
}
