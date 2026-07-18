import type { CmsLandscapePlanRecord } from "@/lib/cms-landscape-types";
import {
  ensureCmsLandscapeLoaded,
  hydrateCmsLandscapeState,
  type LandscapeLoadOptions,
} from "@/lib/cms-landscape";
import {
  cmsLandscapeFilesAvailable,
  readCmsLandscapeJsonFile,
} from "@/lib/cms-landscape-files.server";

/** Server-only: load CMS landscape from disk when available, else fetch via HTTP. */
export async function ensureCmsLandscapeLoadedServer(
  options?: LandscapeLoadOptions,
): Promise<void> {
  if (cmsLandscapeFilesAvailable()) {
    const [plansFromDisk, indexFromDisk] = await Promise.all([
      readCmsLandscapeJsonFile<Record<string, CmsLandscapePlanRecord>>("plans.json"),
      readCmsLandscapeJsonFile<Record<string, string[]>>("county-index.json"),
    ]);
    if (
      plansFromDisk &&
      Object.keys(plansFromDisk).length > 0 &&
      indexFromDisk
    ) {
      hydrateCmsLandscapeState(plansFromDisk, indexFromDisk);
      return;
    }
  }

  await ensureCmsLandscapeLoaded(options);
}
