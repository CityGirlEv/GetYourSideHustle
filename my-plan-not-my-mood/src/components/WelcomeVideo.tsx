import React from 'react';
import { cacheBustPublicUrl } from '../lib/spaAssets';
import {
  WELCOME_VIDEO_FRAME_FILL,
  WELCOME_VIDEO_LABEL,
  WELCOME_VIDEO_PATH,
  WELCOME_VIDEO_POSTER,
} from '../lib/welcomeVideo';

type WelcomeVideoProps = {
  testId: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
};

export const WelcomeVideo: React.FC<WelcomeVideoProps> = ({
  testId,
  controls = false,
  autoPlay = false,
  loop = false,
}) => {
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldAutoPlay = autoPlay && !reduceMotion;

  return (
    <div
      className="welcome-video-shell"
      data-testid={`${testId}-shell`}
      style={{ backgroundColor: WELCOME_VIDEO_FRAME_FILL }}
    >
      <video
        className="welcome-video"
        data-testid={testId}
        style={{ backgroundColor: WELCOME_VIDEO_FRAME_FILL }}
        controls={controls}
        playsInline
        preload="metadata"
        poster={cacheBustPublicUrl(WELCOME_VIDEO_POSTER)}
        autoPlay={shouldAutoPlay}
        loop={loop}
        muted={shouldAutoPlay}
        aria-label={WELCOME_VIDEO_LABEL}
      >
        <source src={cacheBustPublicUrl(WELCOME_VIDEO_PATH)} type="video/mp4" />
      </video>
    </div>
  );
};
