/** End-user training deck — served from public/downloads after `npm run generate:user-guide-pptx`. */
export const END_USER_GUIDE_PPTX_FILENAME = "Part-B-Optimizer-End-User-Guide.pptx";

export function endUserGuidePptxPath(): string {
  return `/downloads/${END_USER_GUIDE_PPTX_FILENAME}`;
}

/** Microsoft Office Online embed — requires a publicly reachable HTTPS file URL. */
export function officeOnlinePptxEmbedUrl(absoluteFileUrl: string): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteFileUrl)}`;
}
