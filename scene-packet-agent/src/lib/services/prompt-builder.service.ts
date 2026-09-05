import { Project, Scene, CanonicalSceneSpec } from '../../types/index.js';
import { HedraAdapter } from '../adapters/hedra.adapter.js';

export class PromptBuilderService {
  private hedraAdapter = new HedraAdapter();

  public buildCanonicalSpec(project: Project, scene: Scene): CanonicalSceneSpec {
    const brand = project.brand || {
      name: 'Default Brand',
      colors: ['#000000', '#FFFFFF'],
      visual_style: 'Standard video production'
    };

    const characters = project.characters || [];
    const characterManifest = characters.map((c) => ({
      character_name: c.nickname ? `${c.name} (${c.nickname})` : c.name,
      wardrobe: c.wardrobe,
      rules: c.continuity_rules
    }));

    const characterRefUrls: string[] = [];
    characters.forEach((c) => {
      if (c.reference_images) {
        c.reference_images.forEach((img) => {
          characterRefUrls.push(`${c.name} Reference: ${img.file_name} (${img.url})`);
        });
      }
    });

    return {
      scene_number: scene.number,
      title: scene.title,
      duration_seconds: scene.duration_seconds,
      aspect_ratio: project.aspect_ratio || '9:16',
      master_concept: project.overall_concept || project.brain_dump,
      audience: project.audience,
      brand_rules: {
        name: brand.name,
        colors: brand.colors,
        visual_style: brand.visual_style || 'High contrast modern social media aesthetic'
      },
      character_continuity_manifest: characterManifest,
      shot_direction: {
        camera: scene.camera_direction || 'Medium shot',
        motion: scene.animation_direction || 'Natural motion',
        action: scene.action,
        dialogue: scene.dialogue || ''
      },
      image_references: {
        start_image_url: scene.start_image_asset_id ? `asset://${scene.start_image_asset_id}` : null,
        end_image_url: scene.end_image_asset_id ? `asset://${scene.end_image_asset_id}` : null,
        screen_ref_url: scene.screen_reference_asset_id ? `asset://${scene.screen_reference_asset_id}` : null,
        character_ref_urls: characterRefUrls
      }
    };
  }

  public generateHedraPrompt(project: Project, scene: Scene): string {
    const canonicalSpec = this.buildCanonicalSpec(project, scene);
    const prompt = this.hedraAdapter.generatePrompt(canonicalSpec);

    const forbiddenPhrases = [
      'same as scene',
      'previous scene',
      'same character rules as before',
      'continue from last scene'
    ];

    const lowerPrompt = prompt.toLowerCase();
    for (const phrase of forbiddenPhrases) {
      if (lowerPrompt.includes(phrase)) {
        throw new Error(
          `Prompt validation error: Found relative scene dependency "${phrase}". Every prompt must be 100% self-contained!`
        );
      }
    }

    return prompt;
  }
}
