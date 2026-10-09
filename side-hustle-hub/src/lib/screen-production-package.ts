/**
 * One downloadable screen production package (PDF) per Content Factory post.
 * Copy, still, scene prompts, and the artifact checklist travel together.
 */

import { jsPDF } from "jspdf";
import {
  PDF_CONTENT_BOTTOM,
  PDF_CONTENT_TOP,
  PDF_MARGIN,
  applyPdfPageBranding,
  drawPdfPageChrome,
} from "./pdf-branding";
import { loadPdfLogoDataUrl } from "./pdf-logo";
import { getSprintWindow } from "./gysh-sprints";
import { scenePackageForItem } from "./gysh-scene-packet";
import {
  ROLLOUT_CHANNEL_LABELS,
  type SoftLaunchItem,
} from "./gysh-soft-launch-rollout";

/** Helvetica/WinAnsi cannot paint Unicode dashes, bullets, or middle dots. */
export function pdfSafeProductionText(text: string): string {
  return String(text || "")
    .replace(/\u00a0/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/[•·●]/g, "-")
    .replace(/[☐☑✓✔]/g, "")
    .replace(/…/g, "...")
    .replace(/\r\n/g, "\n");
}

export function screenProductionPackageFilename(item: Pick<SoftLaunchItem, "id">): string {
  const slug = String(item.id || "post")
    .replace(/^sl-/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `GYSH-Scene-Packet-${slug || "post"}.pdf`;
}

function blank(text: string | undefined, fallback: string): string {
  const value = pdfSafeProductionText(text ?? "").trim();
  return value || fallback;
}

export function buildScreenProductionPackagePdf(
  item: SoftLaunchItem,
  logoDataUrl?: string,
): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawPdfPageChrome(doc);
  const margin = PDF_MARGIN;
  const maxW = doc.internal.pageSize.getWidth() - margin * 2;
  const state = { y: PDF_CONTENT_TOP };
  const sprint = getSprintWindow(item.sprint);
  const channel = pdfSafeProductionText(ROLLOUT_CHANNEL_LABELS[item.channel] || item.channel);

  const ensure = (need: number) => {
    if (state.y + need <= PDF_CONTENT_BOTTOM) return;
    doc.addPage();
    drawPdfPageChrome(doc);
    state.y = PDF_CONTENT_TOP;
  };

  const writeHeading = (text: string, size = 13) => {
    const line = pdfSafeProductionText(text).replace(/\s+/g, " ").trim();
    ensure(size + 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(45, 42, 38);
    doc.text(line, margin, state.y);
    state.y += size + 8;
  };

  const writePara = (text: string, size = 10) => {
    const raw = pdfSafeProductionText(text).trim();
    const paragraphs = raw ? raw.split(/\n+/) : ["-"];
    for (const paragraph of paragraphs) {
      const line = paragraph.replace(/[ \t]+/g, " ").trim();
      if (!line) continue;
      const lines = doc.splitTextToSize(line, maxW) as string[];
      const step = size + 3;
      ensure(lines.length * step + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(size);
      doc.setTextColor(45, 42, 38);
      doc.text(lines, margin, state.y);
      state.y += lines.length * step + 4;
    }
    state.y += 4;
  };

  const packet = scenePackageForItem(item);
  writeHeading(packet.title, 16);
  writePara(
    `${packet.taskId} | ${packet.contentFactoryRef} | Sprint ${item.sprint} (${sprint.numericRangeLabel}) | Due ${item.day} | ${channel} | ${item.owner} | ${item.postTime ?? "Anytime"}`,
  );
  writePara(packet.format);
  writePara(packet.purpose);
  writePara(
    "Hand this file to whoever writes, designs, or films the post. Publish the copy as written. Paste each scene into ChatGPT for stills, then into Hedra with its starting and ending frame.",
  );

  writeHeading("Post copy");
  writePara(blank(item.copy, "No caption on this item. Use the title and the scene packet."));

  packet.scenes.forEach((scene) => {
    writeHeading(`Scene ${scene.number} - ${scene.title}`, 13);
    writePara(`${packet.taskId} | ${packet.contentFactoryRef} | Duration: ${scene.duration} | Speaker(s): ${scene.speakers}`);
    if (scene.screenReference) writePara(`Wizard screen reference: ${scene.screenReference}`);
    writeHeading("Dialogue", 11);
    writePara(scene.dialogue);
    writeHeading("Scene action / start to end", 11);
    writePara(scene.action);
    writePara(scene.startToEnd);
    writeHeading("ChatGPT starting image", 11);
    writePara(scene.chatgptStartPrompt);
    writeHeading("ChatGPT ending image", 11);
    writePara(scene.chatgptEndPrompt);
    writeHeading("Full independent Hedra prompt - copy / paste", 11);
    writePara(scene.hedraPrompt);
  });

  if (item.websiteActions?.length) {
    writeHeading("4. Website actions");
    item.websiteActions.forEach((action, i) => writePara(`${i + 1}. ${action}`));
  }

  writeHeading(item.websiteActions?.length ? "5. Artifacts" : "4. Artifacts");
  if (item.artifacts.length === 0) {
    writePara("No artifact checklist on this item.");
  } else {
    item.artifacts.forEach((artifact, i) => writePara(`${i + 1}. ${artifact}`));
  }

  if (item.relatedTestIds?.length) {
    writeHeading("QA");
    writePara(item.relatedTestIds.join(", "));
  }

  applyPdfPageBranding(doc, "Scene packet", logoDataUrl);
  return doc;
}

export async function downloadScreenProductionPackage(item: SoftLaunchItem): Promise<string> {
  let logo: string | undefined;
  try {
    logo = await loadPdfLogoDataUrl();
  } catch {
    logo = undefined;
  }
  const doc = buildScreenProductionPackagePdf(item, logo);
  const name = screenProductionPackageFilename(item);
  doc.save(name);
  return name;
}
