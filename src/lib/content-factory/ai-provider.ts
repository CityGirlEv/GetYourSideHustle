import type { ContentAiProvider } from "@/lib/content-factory/types";

export interface ContentGenerationRequest {
  provider: ContentAiProvider;
  topic: string;
  batchId: string;
}

export interface GeneratedAssetInput {
  type: import("@/lib/content-factory/types").ContentAssetType;
  slotIndex: number;
  title: string;
  excerpt: string;
  body: string;
  payload?: Record<string, unknown>;
}

/** Provider interface for future OpenAI / Anthropic / Gemini integrations. */
export interface ContentAiProviderAdapter {
  readonly name: ContentAiProvider;
  generateWeeklyBatchAssets(request: ContentGenerationRequest): Promise<GeneratedAssetInput[]>;
}

export const DEFAULT_CONTENT_AI_PROVIDER: ContentAiProvider = "seed";
