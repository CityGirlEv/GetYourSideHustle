import { ProviderAdapter, CanonicalSceneSpec } from '../../types/index.js';

export class HedraAdapter implements ProviderAdapter {
  public providerName = 'hedra';

  public generatePrompt(spec: CanonicalSceneSpec): string {
    const charactersText = spec.character_continuity_manifest
      .map(
        (c) =>
          `[CHARACTER: ${c.character_name}] Wardrobe: ${c.wardrobe}. Continuity Rules: ${c.rules}`
      )
      .join('\n');

    const refManifest = [
      spec.image_references.start_image_url
        ? `- START IMAGE: ${spec.image_references.start_image_url}`
        : null,
      spec.image_references.end_image_url
        ? `- END IMAGE: ${spec.image_references.end_image_url}`
        : null,
      spec.image_references.screen_ref_url
        ? `- SCREEN REF: ${spec.image_references.screen_ref_url}`
        : null,
      ...spec.image_references.character_ref_urls.map((url) => `- CHARACTER REF: ${url}`)
    ]
      .filter(Boolean)
      .join('\n');

    return `==================================================
HEDRA CANONICAL SCENE PROMPT — SCENE ${spec.scene_number}: ${spec.title.toUpperCase()}
==================================================

--- GLOBAL VIDEO SETTINGS & BRAND CONTEXT ---
Aspect Ratio: ${spec.aspect_ratio}
Target Audience: ${spec.audience}
Brand: ${spec.brand_rules.name} (Colors: ${spec.brand_rules.colors.join(', ')})
Visual Style: ${spec.brand_rules.visual_style}

--- MASTER CONCEPT & PURPOSE ---
${spec.master_concept}

--- MANDATORY CHARACTER CONTINUITY ---
${charactersText || 'N/A'}

--- SCENE ACTION & VISUAL DIRECTION ---
Shot Scale / Camera: ${spec.shot_direction.camera}
Animation & Motion: ${spec.shot_direction.motion}
Action Description: ${spec.shot_direction.action}

--- SPOKEN DIALOGUE & LIP SYNC ---
Dialogue: "${spec.shot_direction.dialogue}"

--- REFERENCE ASSET MANIFEST ---
${refManifest || 'None'}

--- CONTINUITY & NEGATIVE CONSTRAINTS ---
Do not alter character costume, age, face structure, hair, or brand colors. Standalone scene execution required. Never depend on preceding scene memory.
==================================================`;
  }
}
