export interface Brand {
  id?: string;
  name: string;
  short_name?: string;
  website?: string | null;
  logo_asset_id?: string | null;
  colors: string[];
  visual_style?: string | null;
}

export interface CharacterImage {
  id: string;
  file_name: string;
  url: string;
  uploaded_at: string;
}

export interface Character {
  id?: string;
  name: string;
  nickname?: string | null;
  age?: number;
  role: string;
  appearance?: string;
  personality?: string;
  voice?: string;
  wardrobe: string;
  continuity_rules: string;
  reference_asset_ids?: string[];
  reference_images?: CharacterImage[];
}

export interface ImageReferences {
  start_image_url?: string | null;
  end_image_url?: string | null;
  screen_ref_url?: string | null;
  character_ref_urls: string[];
}

export interface CanonicalSceneSpec {
  scene_number: number;
  title: string;
  duration_seconds: number;
  aspect_ratio: string;
  master_concept: string;
  audience: string;
  brand_rules: {
    name: string;
    colors: string[];
    visual_style: string;
  };
  character_continuity_manifest: {
    character_name: string;
    wardrobe: string;
    rules: string;
  }[];
  shot_direction: {
    camera: string;
    motion: string;
    action: string;
    dialogue: string;
  };
  image_references: ImageReferences;
}

export interface Scene {
  id?: string;
  number: number;
  title: string;
  duration_seconds: number;
  dialogue?: string;
  action: string;
  camera_direction?: string;
  animation_direction?: string;
  screen_reference_asset_id?: string | null;
  reference_asset_ids?: string[];
  start_image_asset_id?: string | null;
  end_image_asset_id?: string | null;
  transition?: string;
  canonical_scene_spec: CanonicalSceneSpec;
  provider_prompts: {
    hedra: string;
    [key: string]: string;
  };
}

export interface Project {
  id?: string;
  name: string;
  task_reference?: string | null;
  content_factory_reference?: string | null;
  audience: string;
  aspect_ratio: string;
  brain_dump: string;
  overall_concept: string;
  brand?: Brand;
  characters?: Character[];
  scenes?: Scene[];
}

export interface ProviderAdapter {
  providerName: string;
  generatePrompt(spec: CanonicalSceneSpec): string;
}
