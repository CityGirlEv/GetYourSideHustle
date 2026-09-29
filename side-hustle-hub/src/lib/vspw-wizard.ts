/**
 * VSPW multi-step wizard — project state + step catalog.
 * Credit estimation stays in vspw-video-usage.ts as a future enhancement.
 */

import { getSessionStore } from "./browser-storage";

export const VSPW_WIZARD_STORAGE_KEY = "gysh_vspw_wizard_project_v1";

export type VspwWizardStepId =
  | "project"
  | "characters"
  | "scenes"
  | "dialogue"
  | "wardrobe"
  | "images"
  | "review"
  | "pack";

export type VspwWizardStepDef = {
  id: VspwWizardStepId;
  number: number;
  title: string;
  shortLabel: string;
  blurb: string;
};

export const VSPW_WIZARD_STEPS: readonly VspwWizardStepDef[] = [
  {
    id: "project",
    number: 1,
    title: "Project setup",
    shortLabel: "Project",
    blurb: "Name the production and note the brand or product you’re filming for.",
  },
  {
    id: "characters",
    number: 2,
    title: "Characters",
    shortLabel: "Characters",
    blurb: "List who appears on camera. You’ll lock wardrobe and dialogue per person next.",
  },
  {
    id: "scenes",
    number: 3,
    title: "Scenes",
    shortLabel: "Scenes",
    blurb: "Break the shoot into timed scenes. Add, reorder, or remove beats here.",
  },
  {
    id: "dialogue",
    number: 4,
    title: "Dialogue",
    shortLabel: "Dialogue",
    blurb: "Edit speaker lines, tone, and action while speaking — without rebuilding the whole pack.",
  },
  {
    id: "wardrobe",
    number: 5,
    title: "Wardrobe",
    shortLabel: "Wardrobe",
    blurb: "Set clothing per character for each scene, or keep clothing from the previous scene.",
  },
  {
    id: "images",
    number: 6,
    title: "Starting & ending images",
    shortLabel: "Images",
    blurb: "Capture approved start/end stills for each scene (upload or describe for now).",
  },
  {
    id: "review",
    number: 7,
    title: "Production Review",
    shortLabel: "Review",
    blurb: "Scan continuity, dialogue, and timing before you export a production pack.",
  },
  {
    id: "pack",
    number: 8,
    title: "Production Pack",
    shortLabel: "Pack",
    blurb: "Your packet summary — prompts and exports grow here as we ship the rest of VSPW.",
  },
] as const;

export type VspwCharacter = {
  id: string;
  name: string;
  notes: string;
};

export type VspwDialogueLine = {
  id: string;
  speaker: string;
  text: string;
  tone: string;
  actionWhileSpeaking: string;
};

export type VspwScene = {
  id: string;
  title: string;
  durationSeconds: number;
  location: string;
  dialogue: VspwDialogueLine[];
  wardrobeNotes: string;
  startImageNote: string;
  endImageNote: string;
  /** Uploaded starting reference still (local session). */
  startImage: VspwReferenceImage | null;
  /** Uploaded ending reference still (local session). */
  endImage: VspwReferenceImage | null;
  /** Use the start still as a Hedra starting-image reference in the ChatGPT packet. */
  useStartImageAsHedraRef: boolean;
  /** Use the end still as a Hedra ending-image / last-frame reference. */
  useEndImageAsHedraRef: boolean;
};

/** Local reference still for start/end (or wardrobe later). */
export type VspwReferenceImage = {
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
};

export const VSPW_REF_IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,image/gif";
/** Original camera / logo files — generous (phone photos, PNG logos). */
export const VSPW_REF_IMAGE_MAX_BYTES = 25_000_000;
/** Downscale long edge so several refs still fit in the local wizard save. */
export const VSPW_REF_IMAGE_STORE_MAX_EDGE = 2560;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode that image."));
    img.src = dataUrl;
  });
}

async function downscaleForWizardStore(
  dataUrl: string,
  originalSize: number,
): Promise<{ dataUrl: string; mimeType: string; size: number } | null> {
  if (typeof document === "undefined") return null;
  try {
    const img = await loadImageElement(dataUrl);
    const maxEdge = Math.max(img.width || 0, img.height || 0);
    if (maxEdge <= VSPW_REF_IMAGE_STORE_MAX_EDGE && originalSize <= 4_000_000) {
      return null;
    }
    const scale = maxEdge > VSPW_REF_IMAGE_STORE_MAX_EDGE ? VSPW_REF_IMAGE_STORE_MAX_EDGE / maxEdge : 1;
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const jpeg = canvas.toDataURL("image/jpeg", 0.88);
    if (!jpeg.startsWith("data:image/")) return null;
    return {
      dataUrl: jpeg,
      mimeType: "image/jpeg",
      size: Math.max(1, Math.round((jpeg.length * 3) / 4)),
    };
  } catch {
    return null;
  }
}

export async function readVspwReferenceImage(file: File): Promise<VspwReferenceImage> {
  const mime = String(file.type || "").toLowerCase();
  if (!mime.startsWith("image/")) {
    throw new Error("Choose an image file (PNG, JPG, WEBP, or GIF).");
  }
  if (file.size > VSPW_REF_IMAGE_MAX_BYTES) {
    const mb = (VSPW_REF_IMAGE_MAX_BYTES / 1_000_000).toFixed(0);
    throw new Error(`Image is too large (max ${mb} MB). Try a JPG or WEBP.`);
  }
  const dataUrl = await readFileAsDataUrl(file);
  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Could not load that image.");
  }
  const stored = (await downscaleForWizardStore(dataUrl, file.size)) ?? {
    dataUrl,
    mimeType: mime || "image/jpeg",
    size: file.size,
  };
  return {
    name: file.name || "reference.jpg",
    mimeType: stored.mimeType,
    size: stored.size,
    dataUrl: stored.dataUrl,
  };
}

export function parseVspwReferenceImage(raw: unknown): VspwReferenceImage | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const dataUrl = String(o.dataUrl || "");
  if (!dataUrl.startsWith("data:image/")) return null;
  return {
    name: String(o.name || "reference.jpg"),
    mimeType: String(o.mimeType || "image/jpeg"),
    size: Math.max(0, Math.floor(Number(o.size) || 0)),
    dataUrl,
  };
}

export type VspwWizardProject = {
  title: string;
  brandOrProduct: string;
  /** Brand logo — used in ChatGPT start/end still prompts. */
  brandLogo: VspwReferenceImage | null;
  characters: VspwCharacter[];
  scenes: VspwScene[];
  stepId: VspwWizardStepId;
  updatedAt: string;
};

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function blankDialogueLine(speaker = ""): VspwDialogueLine {
  return {
    id: newId("dlg"),
    speaker,
    text: "",
    tone: "",
    actionWhileSpeaking: "",
  };
}

export function blankScene(index: number): VspwScene {
  return {
    id: newId("scene"),
    title: `Scene ${index}`,
    durationSeconds: 10,
    location: "",
    dialogue: [blankDialogueLine()],
    wardrobeNotes: "",
    startImageNote: "",
    endImageNote: "",
    startImage: null,
    endImage: null,
    useStartImageAsHedraRef: false,
    useEndImageAsHedraRef: false,
  };
}

export function blankCharacter(): VspwCharacter {
  return { id: newId("char"), name: "", notes: "" };
}

export function defaultVspwWizardProject(): VspwWizardProject {
  return {
    title: "",
    brandOrProduct: "",
    brandLogo: null,
    characters: [blankCharacter()],
    scenes: [blankScene(1)],
    stepId: "project",
    updatedAt: new Date().toISOString(),
  };
}

export function isVspwWizardStepId(raw: unknown): raw is VspwWizardStepId {
  return VSPW_WIZARD_STEPS.some((s) => s.id === raw);
}

export function vspwWizardStepIndex(stepId: VspwWizardStepId): number {
  return VSPW_WIZARD_STEPS.findIndex((s) => s.id === stepId);
}

export function vspwWizardStepById(stepId: VspwWizardStepId): VspwWizardStepDef {
  return VSPW_WIZARD_STEPS.find((s) => s.id === stepId) ?? VSPW_WIZARD_STEPS[0]!;
}

export function nextVspwWizardStep(stepId: VspwWizardStepId): VspwWizardStepId | null {
  const i = vspwWizardStepIndex(stepId);
  if (i < 0 || i >= VSPW_WIZARD_STEPS.length - 1) return null;
  return VSPW_WIZARD_STEPS[i + 1]!.id;
}

export function prevVspwWizardStep(stepId: VspwWizardStepId): VspwWizardStepId | null {
  const i = vspwWizardStepIndex(stepId);
  if (i <= 0) return null;
  return VSPW_WIZARD_STEPS[i - 1]!.id;
}

export function mergeVspwWizardProject(raw: unknown): VspwWizardProject {
  const base = defaultVspwWizardProject();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const stepId = isVspwWizardStepId(o.stepId) ? o.stepId : base.stepId;
  const characters = Array.isArray(o.characters)
    ? o.characters
        .filter((c): c is Record<string, unknown> => Boolean(c) && typeof c === "object")
        .map((c) => ({
          id: String(c.id || newId("char")),
          name: String(c.name || ""),
          notes: String(c.notes || ""),
        }))
    : base.characters;
  const scenes = Array.isArray(o.scenes)
    ? o.scenes
        .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
        .map((s, idx) => {
          const dialogue = Array.isArray(s.dialogue)
            ? s.dialogue
                .filter((d): d is Record<string, unknown> => Boolean(d) && typeof d === "object")
                .map((d) => ({
                  id: String(d.id || newId("dlg")),
                  speaker: String(d.speaker || ""),
                  text: String(d.text || ""),
                  tone: String(d.tone || ""),
                  actionWhileSpeaking: String(d.actionWhileSpeaking || ""),
                }))
            : [blankDialogueLine()];
          return {
            id: String(s.id || newId("scene")),
            title: String(s.title || `Scene ${idx + 1}`),
            durationSeconds: Math.max(1, Math.floor(Number(s.durationSeconds) || 10)),
            location: String(s.location || ""),
            dialogue: dialogue.length ? dialogue : [blankDialogueLine()],
            wardrobeNotes: String(s.wardrobeNotes || ""),
            startImageNote: String(s.startImageNote || ""),
            endImageNote: String(s.endImageNote || ""),
            startImage: parseVspwReferenceImage(s.startImage),
            endImage: parseVspwReferenceImage(s.endImage),
            useStartImageAsHedraRef: Boolean(s.useStartImageAsHedraRef),
            useEndImageAsHedraRef: Boolean(s.useEndImageAsHedraRef),
          };
        })
    : base.scenes;

  return {
    title: String(o.title || ""),
    brandOrProduct: String(o.brandOrProduct || ""),
    brandLogo: parseVspwReferenceImage(o.brandLogo),
    characters: characters.length ? characters : base.characters,
    scenes: scenes.length ? scenes : base.scenes,
    stepId,
    updatedAt: String(o.updatedAt || new Date().toISOString()),
  };
}

export function readVspwWizardProject(): VspwWizardProject {
  try {
    const raw = getSessionStore().getItem(VSPW_WIZARD_STORAGE_KEY);
    if (!raw) return defaultVspwWizardProject();
    return mergeVspwWizardProject(JSON.parse(raw));
  } catch {
    return defaultVspwWizardProject();
  }
}

function stripImageDataUrls(project: VspwWizardProject): VspwWizardProject {
  const meta = (img: VspwReferenceImage | null): VspwReferenceImage | null =>
    img ? { ...img, dataUrl: "" } : null;
  return {
    ...project,
    brandLogo: meta(project.brandLogo),
    scenes: project.scenes.map((s) => ({
      ...s,
      startImage: meta(s.startImage),
      endImage: meta(s.endImage),
    })),
  };
}

export function writeVspwWizardProject(project: VspwWizardProject): void {
  const next = { ...project, updatedAt: new Date().toISOString() };
  try {
    getSessionStore().setItem(VSPW_WIZARD_STORAGE_KEY, JSON.stringify(next));
  } catch {
    try {
      getSessionStore().setItem(VSPW_WIZARD_STORAGE_KEY, JSON.stringify(stripImageDataUrls(next)));
    } catch {
      /* QuotaExceeded — keep in-memory state */
    }
  }
}

export function clearVspwWizardProject(): void {
  try {
    getSessionStore().removeItem(VSPW_WIZARD_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Future enhancement — Hedra credit estimates are not part of the walkthrough MVP. */
export const VSPW_CREDIT_ESTIMATOR_FUTURE_NOTE =
  "Estimated Hedra credit usage per scene is a planned future enhancement. It will live on Production Review / Pack later — not in this walkthrough.";
