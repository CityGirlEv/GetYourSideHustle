import { Project, Scene } from '../../types/index.js';
import { PromptBuilderService } from './prompt-builder.service.js';

const promptService = new PromptBuilderService();

export class DocxPdfExporter {
  public generatePrintableHtml(project: Project): string {
    const scenes = project.scenes || [];
    let scenesHtml = '';

    scenes.forEach((scene: Scene) => {
      const hedraPrompt = promptService.generateHedraPrompt(project, scene);
      const startImg = scene.start_image_asset_id
        ? `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80`
        : `https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80`;
      const endImg = scene.end_image_asset_id
        ? `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80`
        : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80`;

      scenesHtml += `
        <div class="page-break my-8 p-8 bg-white border border-slate-300 rounded-2xl shadow-sm">
          <div className="border-b-2 border-slate-900 pb-3 mb-4">
            <h2 class="text-xl font-black text-slate-900 uppercase">SCENE ${scene.number} — ${scene.title}</h2>
            <div class="text-xs text-slate-600 font-bold mt-1">
              Task: ${project.task_reference || 'T-SL-S3-FB-TEENS'} | Content Factory: ${project.content_factory_reference || 'CF-020'} | Duration: ${scene.duration_seconds}s | Speaker(s): Coach Duke & Teens
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="border border-slate-300 p-2 rounded-xl text-center bg-slate-50">
              <span class="text-xs font-bold text-slate-700 block mb-2">STARTING IMAGE</span>
              <img src="${startImg}" class="h-48 w-full object-cover rounded-lg shadow-sm" alt="Starting Image" />
            </div>
            <div class="border border-slate-300 p-2 rounded-xl text-center bg-slate-50">
              <span class="text-xs font-bold text-slate-700 block mb-2">ENDING IMAGE</span>
              <img src="${endImg}" class="h-48 w-full object-cover rounded-lg shadow-sm" alt="Ending Image" />
            </div>
          </div>

          <div class="mb-4">
            <h3 class="text-sm font-bold text-amber-800 mb-1">Spoken Dialogue</h3>
            <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 italic">
              "${scene.dialogue || ''}"
            </div>
          </div>

          <div class="mb-4">
            <h3 class="text-sm font-bold text-slate-800 mb-1">Scene Action / Start-to-End Continuity</h3>
            <p class="text-xs text-slate-700 leading-relaxed p-3 bg-slate-100 rounded-xl border border-slate-200">${scene.action}</p>
          </div>

          <div>
            <h3 class="text-sm font-bold text-blue-900 mb-1">FULL INDEPENDENT HEDRA PROMPT (COPY / PASTE)</h3>
            <pre class="p-4 bg-slate-950 text-slate-200 text-[11px] font-mono rounded-xl whitespace-pre-wrap leading-relaxed overflow-x-auto">${hedraPrompt}</pre>
          </div>
        </div>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${project.name} — PDF/Word Production Packet</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            .page-break { page-break-after: always; }
          }
        </style>
      </head>
      <body class="bg-slate-100 text-slate-900 p-8">
        <!-- COVER PAGE -->
        <div class="page-break min-h-[90vh] bg-white border border-slate-300 p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-6 shadow-md">
          <div class="w-24 h-24 bg-amber-500 rounded-3xl flex items-center justify-center text-slate-950 font-black text-3xl shadow-lg">
            GYSH
          </div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">${project.name.toUpperCase()}</h1>
          <div class="text-sm font-bold text-blue-800">
            Task ${project.task_reference || 'T-SL-S3-FB-TEENS'} | Content Factory ${project.content_factory_reference || 'CF-020'}
          </div>
          <div class="text-xs text-slate-500 font-semibold max-w-lg">
            Production format: ${project.aspect_ratio || '9:16 vertical'} | Audience: ${project.audience || 'Teens 13-17'}
          </div>
        </div>

        ${scenesHtml}
      </body>
      </html>
    `;
  }

  public exportWordDocx(project: Project) {
    const htmlContent = this.generatePrintableHtml(project);
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_script_packet.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public exportPrintPdf(project: Project) {
    const htmlContent = this.generatePrintableHtml(project);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  }
}
