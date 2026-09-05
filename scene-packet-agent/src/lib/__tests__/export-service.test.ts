import { describe, it, expect } from 'vitest';
import { ExportService } from '../services/export.service.js';
import { GYSH_SEED_PROJECT } from '../../seed/seed-gysh.js';

describe('ExportService Package Generator', () => {
  const exportService = new ExportService();

  it('generates a full multi-format export package for a project', () => {
    const pack = exportService.generateExportPackage(GYSH_SEED_PROJECT);

    expect(pack.project_name).toBe(GYSH_SEED_PROJECT.name);
    expect(pack.json_export).toContain('GYSH - Coach Duke Teen Side Hustle Action Plan');
    expect(Object.keys(pack.scene_prompts_txt)).toHaveLength(3);
    expect(pack.scene_prompts_txt['scene_1_hedra.txt']).toContain('SCENE 1: THE HOOK: STOP BEING BROKE');
    expect(pack.scene_prompts_txt['scene_3_hedra.txt']).toContain('SCENE 3: CALL TO ACTION: JOIN TEENS CLUB');
    expect(pack.script_summary_markdown).toContain('# PRODUCTION SCRIPT PACKET');
  });
});
