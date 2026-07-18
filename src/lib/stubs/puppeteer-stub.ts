/**
 * Edge/worker-safe stub — puppeteer cannot run on Cloudflare Workers.
 * TikTok scouting uses this in production; run locally with real puppeteer in dev.
 */
const unavailable = () => {
  throw new Error(
    "Puppeteer is not available in edge/worker runtime. Run TikTok scouting from local dev.",
  );
};

const puppeteerStub = {
  launch: unavailable,
  connect: unavailable,
  default: { launch: unavailable, connect: unavailable },
};

export default puppeteerStub;
export const launch = unavailable;
export const connect = unavailable;
