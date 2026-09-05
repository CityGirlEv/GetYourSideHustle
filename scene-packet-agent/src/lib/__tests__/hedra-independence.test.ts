import { describe, it, expect } from 'vitest';
import { PromptBuilderService } from '../services/prompt-builder.service.js';
import { GYSH_SEED_PROJECT } from '../../seed/seed-gysh.js';

describe('Hedra Prompt Independence & Canonical Spec Engine', () => {
  const service = new PromptBuilderService();

  it('generates a canonical scene spec containing all brand and character rules', () => {
    const scene = GYSH_SEED_PROJECT.scenes![0];
    const spec = service.buildCanonicalSpec(GYSH_SEED_PROJECT, scene);

    expect(spec.scene_number).toBe(1);
    expect(spec.aspect_ratio).toBe('9:16');
    expect(spec.brand_rules.name).toBe('Get Your Side Hustle');
    expect(spec.character_continuity_manifest).toHaveLength(1);
    expect(spec.character_continuity_manifest[0].character_name).toBe('Delbert (Coach Duke)');
    expect(spec.character_continuity_manifest[0].wardrobe).toContain('GYSH streetwear');
  });

  it('generates a 100% self-contained Hedra prompt for Scene 1', () => {
    const scene = GYSH_SEED_PROJECT.scenes![0];
    const prompt = service.generateHedraPrompt(GYSH_SEED_PROJECT, scene);

    expect(prompt).toContain('HEDRA CANONICAL SCENE PROMPT — SCENE 1');
    expect(prompt).toContain('Get Your Side Hustle');
    expect(prompt).toContain('Delbert (Coach Duke)');
    expect(prompt).toContain('Preserve face, age, proportions, silhouette, cap, gear and wardrobe.');
    expect(prompt).toContain('Yo! If you\'re 13 to 17 and tired of being broke');
    expect(prompt).not.toContain('same as Scene');
    expect(prompt).not.toContain('previous scene');
  });

  it('generates a 100% self-contained Hedra prompt for Scene 3 that can run independently without Scene 1 context', () => {
    const scene3 = GYSH_SEED_PROJECT.scenes![2];
    const prompt3 = service.generateHedraPrompt(GYSH_SEED_PROJECT, scene3);

    expect(prompt3).toContain('HEDRA CANONICAL SCENE PROMPT — SCENE 3');
    expect(prompt3).toContain('Aspect Ratio: 9:16');
    expect(prompt3).toContain('Brand: Get Your Side Hustle');
    expect(prompt3).toContain('[CHARACTER: Delbert (Coach Duke)] Wardrobe: Black/blue/yellow GYSH streetwear');
    expect(prompt3).toContain('Dialogue: "Want the full blueprint? Hit the link at getyoursidehustle.com');
    expect(prompt3).toContain('Standalone scene execution required. Never depend on preceding scene memory.');

    // Critical assertion: Scene 3 prompt must stand completely alone
    expect(prompt3.toLowerCase()).not.toContain('same as scene');
    expect(prompt3.toLowerCase()).not.toContain('continue from last scene');
  });
});
