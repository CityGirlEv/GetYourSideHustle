import { Project, Scene } from '../../types/index.js';
import { PromptBuilderService } from './prompt-builder.service.js';

export interface ExportPackage {
  project_id?: string;
  project_name: string;
  generated_at: string;
  json_export: string;
  scene_prompts_txt: { [filename: string]: string };
  script_summary_markdown: string;
}

export class ExportService {
  private promptBuilder = new PromptBuilderService();

  public generateExportPackage(project: Project): ExportPackage {
    const jsonExport = JSON.stringify(project, null, 2);
    const scenePromptsTxt: { [filename: string]: string } = {};

    let markdownSummary = `# PRODUCTION SCRIPT PACKET: ${project.name}\n\n`;
    markdownSummary += `**Audience:** ${project.audience} | **Aspect Ratio:** ${project.aspect_ratio}\n`;
    markdownSummary += `**Task Reference:** ${project.task_reference || 'N/A'} | **Content Factory Ref:** ${project.content_factory_reference || 'N/A'}\n\n`;
    markdownSummary += `## Master Concept\n${project.overall_concept || project.brain_dump}\n\n`;

    markdownSummary += `## Brand Context\n`;
    if (project.brand) {
      markdownSummary += `- **Brand:** ${project.brand.name}\n`;
      markdownSummary += `- **Website:** ${project.brand.website || 'N/A'}\n`;
      markdownSummary += `- **Colors:** ${project.brand.colors.join(', ')}\n`;
      markdownSummary += `- **Style:** ${project.brand.visual_style || 'N/A'}\n\n`;
    }

    markdownSummary += `## Characters\n`;
    (project.characters || []).forEach((char) => {
      markdownSummary += `### ${char.name} (${char.nickname || 'N/A'})\n`;
      markdownSummary += `- **Role:** ${char.role} | **Age:** ${char.age || 'N/A'}\n`;
      markdownSummary += `- **Wardrobe:** ${char.wardrobe}\n`;
      markdownSummary += `- **Continuity Rules:** ${char.continuity_rules}\n\n`;
    });

    markdownSummary += `## Scene Breakdown & Independent Hedra Prompts\n`;

    (project.scenes || []).forEach((scene: Scene) => {
      const hedraPrompt = this.promptBuilder.generateHedraPrompt(project, scene);
      scenePromptsTxt[`scene_${scene.number}_hedra.txt`] = hedraPrompt;

      markdownSummary += `### Scene ${scene.number}: ${scene.title}\n`;
      markdownSummary += `- **Duration:** ${scene.duration_seconds}s\n`;
      markdownSummary += `- **Action:** ${scene.action}\n`;
      markdownSummary += `- **Dialogue:** "${scene.dialogue || ''}"\n\n`;
      markdownSummary += `\`\`\`text\n${hedraPrompt}\n\`\`\`\n\n---\n\n`;
    });

    return {
      project_name: project.name,
      generated_at: new Date().toISOString(),
      json_export: jsonExport,
      scene_prompts_txt: scenePromptsTxt,
      script_summary_markdown: markdownSummary
    };
  }
}
