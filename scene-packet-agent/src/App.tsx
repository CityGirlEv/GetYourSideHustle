import React, { useState, useEffect, useRef } from 'react';
import { GYSH_SEED_PROJECT } from './seed/seed-gysh';
import { Project, Scene, CharacterImage } from './types';
import { PromptBuilderService } from './lib/services/prompt-builder.service';
import { ExportService } from './lib/services/export.service';
import { DocxPdfExporter } from './lib/services/docx-pdf-exporter';
import { MuntiesLogo } from './components/MuntiesLogo';
import { formatColorAll } from './lib/utils/color-converter';

const promptService = new PromptBuilderService();
const exportService = new ExportService();
const docxPdfExporter = new DocxPdfExporter();

const OUTPUT_DIR_PATH = `C:\\Documents\\GYSH\\Videos\\TeenSideHustle\\Images\\ProductionPack\\AgentFiles\\Scene_Packet_Agent_Build_Kit_UPDATED`;
const LOCAL_STORAGE_DB_KEY = 'GYSH_PRODUCTION_PACKET_DB';

const PRESET_AI_CHARACTER_IMAGES = [
  {
    title: "Coach Duke — Hero Streetwear Stance",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    desc: "17-year-old Delbert in black/blue/yellow GYSH streetwear, front shoulder badge."
  },
  {
    title: "Coach Duke — Back Hoodie & Teens Club Logo",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    desc: "Rear view displaying back GYSH logo and TEENS CLUB embroidery."
  },
  {
    title: "Coach Duke — Action Mentorship Pose",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    desc: "High energy expression pointing to screen graphics."
  }
];

export default function App() {
  // Load initial project from persistent localStorage DB or seed
  const [project, setProject] = useState<Project>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved DB:', e);
      }
    }
    return GYSH_SEED_PROJECT;
  });

  const [viewMode, setViewMode] = useState<'wizard' | 'dashboard'>('wizard');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'brand' | 'characters' | 'scenes' | 'prompts' | 'storyboard' | 'downloads'
  >('overview');

  const [copiedSceneIndex, setCopiedSceneIndex] = useState<number | null>(null);
  const [copiedDir, setCopiedDir] = useState<boolean>(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [dbSaveToast, setDbSaveToast] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string>('');

  // AI Image Generator Modal state
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [generatorPrompt, setGeneratorPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);

  // Asset Library Image Selector Modal state
  const [showLibraryModal, setShowLibraryModal] = useState<boolean>(false);
  const [librarySelectTarget, setLibrarySelectTarget] = useState<{ sceneIndex: number; type: 'start' | 'end' } | null>(null);

  // Editable Custom Prompts per scene
  const [customPrompts, setCustomPrompts] = useState<{ [sceneNumber: number]: string }>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sceneStartInputRef = useRef<{ [sceneNumber: number]: HTMLInputElement | null }>({});
  const sceneEndInputRef = useRef<{ [sceneNumber: number]: HTMLInputElement | null }>({});

  // Auto-persist project changes to localStorage DB
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(project));
  }, [project]);

  useEffect(() => {
    if (themeMode === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [themeMode]);

  const primaryChar = project.characters && project.characters[0] ? project.characters[0] : GYSH_SEED_PROJECT.characters![0];

  const triggerDbSaveToast = (msg: string) => {
    localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(project));
    setDbSaveToast(msg);
    setTimeout(() => setDbSaveToast(null), 2500);
  };

  const getScenePrompt = (scene: Scene): string => {
    if (customPrompts[scene.number] !== undefined) {
      return customPrompts[scene.number];
    }
    return promptService.generateHedraPrompt(project, scene);
  };

  const handleUpdateCustomPrompt = (sceneNumber: number, text: string) => {
    setCustomPrompts({ ...customPrompts, [sceneNumber]: text });
  };

  const handleRegenerateScenePrompt = (scene: Scene) => {
    const freshPrompt = promptService.generateHedraPrompt(project, scene);
    setCustomPrompts({ ...customPrompts, [scene.number]: freshPrompt });
  };

  const handleOpenImageGenerator = () => {
    const prompt = `17-year-old teen coach ${primaryChar.name} (${primaryChar.nickname || 'Coach Duke'}), role: ${primaryChar.role}. Wardrobe: ${primaryChar.wardrobe}. Continuity rules: ${primaryChar.continuity_rules}. Aspect ratio 9:16, high contrast streetwear aesthetic.`;
    setGeneratorPrompt(prompt);
    setGeneratedPreviewUrl(PRESET_AI_CHARACTER_IMAGES[0].url);
    setShowImageModal(true);
  };

  const handleGenerateAiImage = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const randomPreset = PRESET_AI_CHARACTER_IMAGES[Math.floor(Math.random() * PRESET_AI_CHARACTER_IMAGES.length)];
      setGeneratedPreviewUrl(randomPreset.url);
      setIsGenerating(false);
    }, 1000);
  };

  const handleSaveGeneratedImage = () => {
    if (!generatedPreviewUrl) return;
    const newImg: CharacterImage = {
      id: `ai-img-${Date.now()}`,
      file_name: `AI_Generated_${primaryChar.name.replace(/\s+/g, '_')}_${(primaryChar.reference_images?.length || 0) + 1}.png`,
      url: generatedPreviewUrl,
      uploaded_at: new Date().toISOString()
    };

    const updatedChars = [...(project.characters || [])];
    const existingImages = updatedChars[0].reference_images || [];
    updatedChars[0] = {
      ...updatedChars[0],
      reference_images: [...existingImages, newImg]
    };

    const newProject = { ...project, characters: updatedChars };
    setProject(newProject);
    localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(newProject));
    triggerDbSaveToast('✓ Character AI Image Saved to DB!');
    setShowImageModal(false);
  };

  const handleSaveCharacterProfile = () => {
    triggerDbSaveToast('✓ Character Profile & Reference Images Persisted to DB!');
  };

  const handleCharacterImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newImages: CharacterImage[] = Array.from(files).map((file) => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      file_name: file.name,
      url: URL.createObjectURL(file),
      uploaded_at: new Date().toISOString()
    }));

    const updatedChars = [...(project.characters || [])];
    const existingImages = updatedChars[0].reference_images || [];
    updatedChars[0] = {
      ...updatedChars[0],
      reference_images: [...existingImages, ...newImages]
    };
    setProject({ ...project, characters: updatedChars });
    triggerDbSaveToast('✓ New Character Images Uploaded & Saved!');
  };

  const handleSceneImageUpload = (sceneIndex: number, type: 'start' | 'end', files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileUrl = URL.createObjectURL(files[0]);
    const updatedScenes = [...(project.scenes || [])];
    if (type === 'start') {
      updatedScenes[sceneIndex] = { ...updatedScenes[sceneIndex], start_image_asset_id: fileUrl };
    } else {
      updatedScenes[sceneIndex] = { ...updatedScenes[sceneIndex], end_image_asset_id: fileUrl };
    }
    setProject({ ...project, scenes: updatedScenes });
    triggerDbSaveToast(`✓ Scene #${sceneIndex + 1} ${type.toUpperCase()} Image Saved to DB!`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropSceneImage = (sceneIndex: number, type: 'start' | 'end', e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSceneImageUpload(sceneIndex, type, e.dataTransfer.files);
    }
  };

  const handleSelectFromLibrary = (imageUrl: string) => {
    if (!librarySelectTarget) return;
    const { sceneIndex, type } = librarySelectTarget;
    const updatedScenes = [...(project.scenes || [])];
    if (type === 'start') {
      updatedScenes[sceneIndex] = { ...updatedScenes[sceneIndex], start_image_asset_id: imageUrl };
    } else {
      updatedScenes[sceneIndex] = { ...updatedScenes[sceneIndex], end_image_asset_id: imageUrl };
    }
    setProject({ ...project, scenes: updatedScenes });
    setShowLibraryModal(false);
    triggerDbSaveToast(`✓ Scene #${sceneIndex + 1} ${type.toUpperCase()} Image Selected from Library & Saved!`);
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const newImage: CharacterImage = {
      id: `img-url-${Date.now()}`,
      file_name: `Character_Ref_${(primaryChar.reference_images?.length || 0) + 1}.png`,
      url: newImageUrl.trim(),
      uploaded_at: new Date().toISOString()
    };
    const updatedChars = [...(project.characters || [])];
    const existingImages = updatedChars[0].reference_images || [];
    updatedChars[0] = {
      ...updatedChars[0],
      reference_images: [...existingImages, newImage]
    };
    setProject({ ...project, characters: updatedChars });
    setNewImageUrl('');
    triggerDbSaveToast('✓ Image Link Added & Saved!');
  };

  const handleRemoveCharacterImage = (imageId: string) => {
    const updatedChars = [...(project.characters || [])];
    const existingImages = updatedChars[0].reference_images || [];
    updatedChars[0] = {
      ...updatedChars[0],
      reference_images: existingImages.filter((img) => img.id !== imageId)
    };
    setProject({ ...project, characters: updatedChars });
    triggerDbSaveToast('✓ Image Removed from DB!');
  };

  const copyPromptToClipboard = (scene: Scene, index: number) => {
    const prompt = getScenePrompt(scene);
    navigator.clipboard.writeText(prompt);
    setCopiedSceneIndex(index);
    setTimeout(() => setCopiedSceneIndex(null), 2000);
  };

  const copyOutputDirToClipboard = () => {
    navigator.clipboard.writeText(OUTPUT_DIR_PATH);
    setCopiedDir(true);
    setTimeout(() => setCopiedDir(false), 2000);
  };

  const copyTextToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const addBrandColor = (hex: string) => {
    const currentColors = project.brand?.colors || [];
    setProject({
      ...project,
      brand: { ...(project.brand || { name: 'Get Your Side Hustle', colors: [] }), colors: [...currentColors, hex] }
    });
    triggerDbSaveToast('✓ Brand Color Added to DB!');
  };

  const removeBrandColor = (index: number) => {
    const currentColors = [...(project.brand?.colors || [])];
    currentColors.splice(index, 1);
    setProject({
      ...project,
      brand: { ...(project.brand || { name: 'Get Your Side Hustle', colors: [] }), colors: currentColors }
    });
    triggerDbSaveToast('✓ Brand Color Removed!');
  };

  const handleExportDownload = (type: 'json' | 'md' | 'txt' | 'word' | 'pdf') => {
    if (type === 'word') {
      docxPdfExporter.exportWordDocx(project);
      return;
    }
    if (type === 'pdf') {
      docxPdfExporter.exportPrintPdf(project);
      return;
    }

    const pack = exportService.generateExportPackage(project);
    let blob: Blob;
    let filename = '';

    if (type === 'json') {
      blob = new Blob([pack.json_export], { type: 'application/json' });
      filename = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_export.json`;
    } else if (type === 'md') {
      blob = new Blob([pack.script_summary_markdown], { type: 'text/markdown' });
      filename = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_script_packet.md`;
    } else {
      const allPrompts = Object.entries(pack.scene_prompts_txt)
        .map(([fn, content]) => `/* === ${fn} === */\n\n${content}`)
        .join('\n\n\n');
      blob = new Blob([allPrompts], { type: 'text/plain' });
      filename = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_prompts_bundle.txt`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateScene = (index: number, updatedFields: Partial<Scene>) => {
    const updatedScenes = [...(project.scenes || [])];
    updatedScenes[index] = { ...updatedScenes[index], ...updatedFields };
    setProject({ ...project, scenes: updatedScenes });
  };

  const addDefaultScene = () => {
    const nextNum = (project.scenes?.length || 0) + 1;
    const newScene: Scene = {
      number: nextNum,
      title: `Scene ${nextNum}: Action Step`,
      duration_seconds: 10,
      dialogue: "Here is your next action step to stack wins!",
      action: "Coach Duke points to camera, demonstrating step with high energy.",
      camera_direction: "Medium close-up shot, 9:16 vertical.",
      animation_direction: "Active hand gestures and confident expression.",
      transition: "Whip pan",
      canonical_scene_spec: {} as any,
      provider_prompts: { hedra: '' }
    };
    setProject({ ...project, scenes: [...(project.scenes || []), newScene] });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${themeMode === 'dark' ? 'bg-[#070a12] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-50 backdrop-blur-xl px-6 py-4 shadow-sm transition-colors ${
        themeMode === 'dark' ? 'bg-slate-950/90 border-amber-500/20' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <MuntiesLogo />

          <div className="flex flex-wrap items-center gap-3">
            {dbSaveToast && (
              <span className="text-xs bg-emerald-500 text-slate-950 px-3 py-1 rounded-full font-black animate-bounce shadow">
                {dbSaveToast}
              </span>
            )}

            <button
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              className="btn-exec btn-exec-slate text-xs"
            >
              {themeMode === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>

            <button
              onClick={copyOutputDirToClipboard}
              title="Click to copy local output directory path"
              className="btn-exec btn-exec-gold text-xs font-black"
            >
              📁 Output Folder Path
              <span className="text-[10px] bg-black/20 text-slate-950 px-2 py-0.5 rounded-full font-black">
                {copiedDir ? '✓ Copied' : 'Copy'}
              </span>
            </button>

            <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300 shadow-inner">
              <button
                onClick={() => setViewMode('wizard')}
                className={`btn-exec text-xs ${viewMode === 'wizard' ? 'btn-exec-gold' : 'btn-exec-slate'}`}
              >
                🧙‍♂️ Asset Wizard
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                className={`btn-exec text-xs ${viewMode === 'dashboard' ? 'btn-exec-blue' : 'btn-exec-slate'}`}
              >
                📊 Dashboard View
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* WIZARD MODE */}
        {viewMode === 'wizard' && (
          <div className="space-y-6">
            {/* Highly Noticeable Wizard Stepper Header */}
            <div className="exec-glass-card-gold p-6 rounded-3xl bg-white border-2 border-amber-400 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 font-heading flex items-center gap-3">
                    Interactive Scene Packet Wizard
                    <span className="text-xs bg-amber-500 text-slate-950 border border-amber-600 px-3.5 py-1 rounded-full font-black shadow-sm">
                      Step {wizardStep} of 5 ({wizardStep * 20}% Complete)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Guided asset collector & persistent database storage engine.
                  </p>
                </div>

                {/* Top Navigation Control Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    disabled={wizardStep === 1}
                    onClick={() => setWizardStep((s) => Math.max(1, s - 1))}
                    className="btn-exec btn-exec-slate text-xs font-bold disabled:opacity-40"
                  >
                    ← Back Step
                  </button>
                  <button
                    disabled={wizardStep === 5}
                    onClick={() => setWizardStep((s) => Math.min(5, s + 1))}
                    className="btn-exec btn-exec-gold text-xs font-black"
                  >
                    {wizardStep === 4 ? 'Compile Prompts →' : 'Continue Step →'}
                  </button>
                </div>
              </div>

              {/* Stepper Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { step: 1, name: '1. Project Concept' },
                  { step: 2, name: '2. Brand & Colors' },
                  { step: 3, name: '3. Character & Art' },
                  { step: 4, name: '4. Scenes & Assets' },
                  { step: 5, name: '5. Prompts & Packet' }
                ].map((s) => {
                  const isActive = wizardStep === s.step;
                  const isPassed = wizardStep > s.step;
                  return (
                    <button
                      key={s.step}
                      onClick={() => setWizardStep(s.step)}
                      className={`btn-exec text-xs p-3 flex flex-col items-start text-left transition-all ${
                        isActive
                          ? 'stepper-btn-active'
                          : isPassed
                          ? 'stepper-btn-passed'
                          : 'stepper-btn-upcoming'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-black uppercase opacity-75">
                          {isPassed ? '✓ DONE' : isActive ? '▶ ACTIVE' : `STEP ${s.step}`}
                        </span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
                      </div>
                      <span className="truncate font-bold text-xs mt-0.5">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 1: PROJECT & CONCEPT */}
            {wizardStep === 1 && (
              <div className="exec-glass-card p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-heading">Step 1: Project Setup & Creative Brain Dump</h3>
                    <p className="text-xs text-slate-500">Define project parameters, target audience, and overall creative vision.</p>
                  </div>
                  <button onClick={() => setWizardStep(2)} className="btn-exec btn-exec-gold text-xs font-black">
                    Continue to Brand & Colors →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Project Name</label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => setProject({ ...project, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:border-amber-500 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Task Reference</label>
                      <input
                        type="text"
                        value={project.task_reference || ''}
                        onChange={(e) => setProject({ ...project, task_reference: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono text-blue-700 font-bold focus:border-amber-500 focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Content Factory Ref</label>
                      <input
                        type="text"
                        value={project.content_factory_reference || ''}
                        onChange={(e) => setProject({ ...project, content_factory_reference: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-700 font-bold focus:border-amber-500 focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Brain Dump ("Movie in Your Head")</label>
                  <textarea
                    rows={4}
                    value={project.brain_dump}
                    onChange={(e) => setProject({ ...project, brain_dump: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm text-slate-800 focus:border-amber-500 focus:outline-none leading-relaxed focus:bg-white"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <button onClick={() => setWizardStep(2)} className="btn-exec btn-exec-gold font-black">
                    Continue to Brand & Colors →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: BRAND & COLOR STUDIO */}
            {wizardStep === 2 && (
              <div className="exec-glass-card p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
                <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-heading">Step 2: Brand Engine & Multi-Format Color Studio</h3>
                    <p className="text-xs text-slate-500">Persistent color storage across HEX, RGB, HSL, and CMYK formats.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => setWizardStep(1)} className="btn-exec btn-exec-slate text-xs font-bold">
                      ← Back
                    </button>
                    <button onClick={() => setWizardStep(3)} className="btn-exec btn-exec-gold text-xs font-black">
                      Continue to Character Builder →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Brand Name</label>
                    <input
                      type="text"
                      value={project.brand?.name || ''}
                      onChange={(e) =>
                        setProject({
                          ...project,
                          brand: { ...(project.brand || { colors: [] }), name: e.target.value }
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:border-amber-500 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Website URL</label>
                    <input
                      type="text"
                      value={project.brand?.website || ''}
                      onChange={(e) =>
                        setProject({
                          ...project,
                          brand: { ...(project.brand || { colors: [], name: '' }), website: e.target.value }
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-blue-600 font-semibold focus:border-amber-500 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 font-heading">Persistent Color Cards</h4>
                    <div className="flex items-center gap-2">
                      <button onClick={() => addBrandColor('#06B6D4')} className="btn-exec btn-exec-blue text-xs">
                        + Add Cyan
                      </button>
                      <button onClick={() => addBrandColor('#F59E0B')} className="btn-exec btn-exec-gold text-xs">
                        + Add Amber
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(project.brand?.colors || []).map((hex, idx) => {
                      const colorInfo = formatColorAll(hex);
                      return (
                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={hex}
                                onChange={(e) => {
                                  const newColors = [...(project.brand?.colors || [])];
                                  newColors[idx] = e.target.value;
                                  setProject({
                                    ...project,
                                    brand: { ...(project.brand || { name: '', colors: [] }), colors: newColors }
                                  });
                                }}
                                className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer shadow-sm"
                              />
                              <div>
                                <span className="font-bold text-slate-900 text-sm block">{colorInfo.hex}</span>
                                <span className="text-[10px] text-slate-500 font-mono">Brand Color #{idx + 1}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeBrandColor(idx)}
                              className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1 bg-red-50 rounded-lg border border-red-200"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <button
                              onClick={() => copyTextToClipboard(colorInfo.hex, `HEX ${colorInfo.hex}`)}
                              className="bg-white p-2 rounded-lg border border-slate-200 hover:border-amber-400 text-left transition"
                            >
                              <span className="text-[10px] text-slate-400 block font-sans">HEX</span>
                              <span className="font-bold text-slate-900">{colorInfo.hex}</span>
                            </button>

                            <button
                              onClick={() => copyTextToClipboard(colorInfo.rgb, `RGB ${colorInfo.rgb}`)}
                              className="bg-white p-2 rounded-lg border border-slate-200 hover:border-blue-400 text-left transition"
                            >
                              <span className="text-[10px] text-slate-400 block font-sans">RGB</span>
                              <span className="font-semibold text-blue-700">{colorInfo.rgb}</span>
                            </button>

                            <button
                              onClick={() => copyTextToClipboard(colorInfo.hsl, `HSL ${colorInfo.hsl}`)}
                              className="bg-white p-2 rounded-lg border border-slate-200 hover:border-emerald-400 text-left transition"
                            >
                              <span className="text-[10px] text-slate-400 block font-sans">HSL</span>
                              <span className="font-semibold text-emerald-700">{colorInfo.hsl}</span>
                            </button>

                            <button
                              onClick={() => copyTextToClipboard(colorInfo.cmyk, `CMYK ${colorInfo.cmyk}`)}
                              className="bg-white p-2 rounded-lg border border-slate-200 hover:border-purple-400 text-left transition"
                            >
                              <span className="text-[10px] text-slate-400 block font-sans">CMYK (Print)</span>
                              <span className="font-semibold text-purple-700">{colorInfo.cmyk}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-200">
                  <button onClick={() => setWizardStep(1)} className="btn-exec btn-exec-slate">
                    ← Back to Step 1
                  </button>
                  <button onClick={() => setWizardStep(3)} className="btn-exec btn-exec-gold font-black">
                    Continue to Character Builder →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CHARACTER BUILDER & SAVE CHARACTER IMAGE */}
            {wizardStep === 3 && (
              <div className="exec-glass-card p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
                <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-heading flex items-center gap-2">
                      Step 3: Character Builder & Image Persistence Studio
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-0.5 rounded-full">
                        Primary Character
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">Configure character rules and save reference photos to persistent storage.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => setWizardStep(2)} className="btn-exec btn-exec-slate text-xs font-bold">
                      ← Back
                    </button>
                    {/* Explicit SAVE CHARACTER Profile & Images Button */}
                    <button onClick={handleSaveCharacterProfile} className="btn-exec btn-exec-emerald text-xs font-bold">
                      💾 Save Character Profile
                    </button>
                    <button onClick={handleOpenImageGenerator} className="btn-exec btn-exec-gold text-xs font-black animate-pulse">
                      ✨ Make My Image
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Name</label>
                    <input
                      type="text"
                      value={primaryChar.name}
                      onChange={(e) => {
                        const updatedChars = [...(project.characters || [])];
                        updatedChars[0] = { ...primaryChar, name: e.target.value };
                        setProject({ ...project, characters: updatedChars });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:border-amber-500 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Nickname</label>
                    <input
                      type="text"
                      value={primaryChar.nickname || ''}
                      onChange={(e) => {
                        const updatedChars = [...(project.characters || [])];
                        updatedChars[0] = { ...primaryChar, nickname: e.target.value };
                        setProject({ ...project, characters: updatedChars });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-amber-800 font-bold focus:border-amber-500 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Age & Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={primaryChar.age || 17}
                        onChange={(e) => {
                          const updatedChars = [...(project.characters || [])];
                          updatedChars[0] = { ...primaryChar, age: parseInt(e.target.value) || 17 };
                          setProject({ ...project, characters: updatedChars });
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-semibold focus:border-amber-500 focus:outline-none focus:bg-white"
                      />
                      <input
                        type="text"
                        value={primaryChar.role}
                        onChange={(e) => {
                          const updatedChars = [...(project.characters || [])];
                          updatedChars[0] = { ...primaryChar, role: e.target.value };
                          setProject({ ...project, characters: updatedChars });
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-semibold focus:border-amber-500 focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Wardrobe & Branded Gear</label>
                  <textarea
                    rows={3}
                    value={primaryChar.wardrobe}
                    onChange={(e) => {
                      const updatedChars = [...(project.characters || [])];
                      updatedChars[0] = { ...primaryChar, wardrobe: e.target.value };
                      setProject({ ...project, characters: updatedChars });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm text-slate-800 focus:border-amber-500 focus:outline-none leading-relaxed focus:bg-white"
                  />
                </div>

                {/* IMAGE UPLOADER & SAVE CHARACTER BUTTON */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-heading">Character Reference Gallery & Persistence</h4>
                      <p className="text-xs text-slate-500">All character images persist automatically across reloads.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleSaveCharacterProfile} className="btn-exec btn-exec-emerald text-xs">
                        💾 Save Character Profile
                      </button>
                      <button onClick={handleOpenImageGenerator} className="btn-exec btn-exec-gold text-xs font-bold">
                        ✨ Make My Image
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/50 p-6 rounded-2xl cursor-pointer flex flex-col items-center justify-center text-center transition group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleCharacterImageUpload(e.target.files)}
                      />
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xl mb-2 group-hover:scale-110 transition">
                        📸
                      </div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-amber-800">
                        Click to Drag & Drop Local Images
                      </span>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Add Image via Web URL</label>
                        <input
                          type="text"
                          placeholder="https://example.com/coach_duke.png"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleAddImageUrl}
                        disabled={!newImageUrl.trim()}
                        className="btn-exec btn-exec-blue text-xs disabled:opacity-40"
                      >
                        + Add Image Link
                      </button>
                    </div>
                  </div>

                  {/* Uploaded Reference Gallery */}
                  {(primaryChar.reference_images || []).length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-slate-700 block">Character Reference Gallery</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(primaryChar.reference_images || []).map((img) => (
                          <div key={img.id} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative group shadow-sm">
                            <div className="h-32 bg-slate-950 flex items-center justify-center overflow-hidden">
                              <img src={img.url} alt={img.file_name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                            </div>
                            <div className="p-2 bg-slate-900 text-white flex items-center justify-between text-[11px]">
                              <span className="truncate max-w-[110px] font-mono text-slate-300">{img.file_name}</span>
                              <button
                                onClick={() => handleRemoveCharacterImage(img.id)}
                                className="text-red-400 hover:text-red-300 font-bold px-1.5 py-0.5 bg-red-900/40 rounded border border-red-800"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-200">
                  <button onClick={() => setWizardStep(2)} className="btn-exec btn-exec-slate">
                    ← Back to Step 2
                  </button>
                  <button onClick={() => setWizardStep(4)} className="btn-exec btn-exec-gold font-black">
                    Continue to Scenes & Assets →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SCENE STUDIO & DRAG-AND-DROP + ASSET LIBRARY SELECTOR */}
            {wizardStep === 4 && (
              <div className="exec-glass-card p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
                <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-heading">Step 4: Scene Asset Studio & Interactive Scene Cards</h3>
                    <p className="text-xs text-slate-500">Drag & drop start/end images or pick from your asset library.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setWizardStep(3)} className="btn-exec btn-exec-slate text-xs font-bold">
                      ← Back
                    </button>
                    <button onClick={addDefaultScene} className="btn-exec btn-exec-blue text-xs">
                      + Add Scene
                    </button>
                    <button onClick={() => setWizardStep(5)} className="btn-exec btn-exec-gold text-xs font-black">
                      Compile Prompts →
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {(project.scenes || []).map((scene, idx) => {
                    const scenePrompt = getScenePrompt(scene);
                    return (
                      <div key={scene.number} className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-200 space-y-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow">
                              #{scene.number}
                            </span>
                            <input
                              type="text"
                              value={scene.title}
                              onChange={(e) => updateScene(idx, { title: e.target.value })}
                              className="bg-transparent font-black text-slate-900 text-lg focus:outline-none border-b border-dashed border-slate-400 focus:border-amber-500"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={scene.duration_seconds}
                              onChange={(e) => updateScene(idx, { duration_seconds: parseInt(e.target.value) || 10 })}
                              className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-center font-bold text-amber-800"
                            />
                            <span className="text-xs text-slate-600 font-semibold">seconds</span>
                          </div>
                        </div>

                        {/* STARTING AND ENDING IMAGE SLOTS WITH DRAG-AND-DROP & LIBRARY SELECTOR */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* STARTING IMAGE SLOT */}
                          <div
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropSceneImage(idx, 'start', e)}
                            className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 space-y-3 shadow-sm transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-800">📸 STARTING IMAGE (Drag & Drop Here)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={(el) => { sceneStartInputRef.current[scene.number] = el; }}
                                onChange={(e) => handleSceneImageUpload(idx, 'start', e.target.files)}
                              />
                            </div>

                            <div className="h-44 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center relative shadow-inner">
                              {scene.start_image_asset_id ? (
                                <img src={scene.start_image_asset_id} alt="Start Frame" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center p-4">
                                  <span className="text-[10px] text-slate-400 block font-mono">DRAG & DROP IMAGE</span>
                                  <span className="text-xs text-slate-300 font-semibold">9:16 Vertical Start Frame</span>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => sceneStartInputRef.current[scene.number]?.click()}
                                className="btn-exec btn-exec-slate text-[10px] py-1.5 px-1 truncate"
                              >
                                📤 Upload
                              </button>
                              <button
                                onClick={() => {
                                  setLibrarySelectTarget({ sceneIndex: idx, type: 'start' });
                                  setShowLibraryModal(true);
                                }}
                                className="btn-exec btn-exec-blue text-[10px] py-1.5 px-1 truncate"
                              >
                                🖼️ Library
                              </button>
                              <button
                                onClick={() => {
                                  const preset = PRESET_AI_CHARACTER_IMAGES[idx % PRESET_AI_CHARACTER_IMAGES.length].url;
                                  updateScene(idx, { start_image_asset_id: preset });
                                }}
                                className="btn-exec btn-exec-gold text-[10px] py-1.5 px-1 truncate"
                              >
                                ✨ Generate
                              </button>
                            </div>
                          </div>

                          {/* ENDING IMAGE SLOT */}
                          <div
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropSceneImage(idx, 'end', e)}
                            className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 space-y-3 shadow-sm transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-800">🎬 ENDING IMAGE (Drag & Drop Here)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={(el) => { sceneEndInputRef.current[scene.number] = el; }}
                                onChange={(e) => handleSceneImageUpload(idx, 'end', e.target.files)}
                              />
                            </div>

                            <div className="h-44 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center relative shadow-inner">
                              {scene.end_image_asset_id ? (
                                <img src={scene.end_image_asset_id} alt="End Frame" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center p-4">
                                  <span className="text-[10px] text-slate-400 block font-mono">DRAG & DROP IMAGE</span>
                                  <span className="text-xs text-slate-300 font-semibold">9:16 Vertical End Frame</span>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => sceneEndInputRef.current[scene.number]?.click()}
                                className="btn-exec btn-exec-slate text-[10px] py-1.5 px-1 truncate"
                              >
                                📤 Upload
                              </button>
                              <button
                                onClick={() => {
                                  setLibrarySelectTarget({ sceneIndex: idx, type: 'end' });
                                  setShowLibraryModal(true);
                                }}
                                className="btn-exec btn-exec-blue text-[10px] py-1.5 px-1 truncate"
                              >
                                🖼️ Library
                              </button>
                              <button
                                onClick={() => {
                                  const preset = PRESET_AI_CHARACTER_IMAGES[(idx + 1) % PRESET_AI_CHARACTER_IMAGES.length].url;
                                  updateScene(idx, { end_image_asset_id: preset });
                                }}
                                className="btn-exec btn-exec-gold text-[10px] py-1.5 px-1 truncate"
                              >
                                ✨ Generate
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* EDITABLE HEDRA SCENE PROMPT */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-extrabold text-blue-900">
                              ⚡ Independent Hedra Scene Prompt (Editable per Scene)
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRegenerateScenePrompt(scene)}
                                className="btn-exec btn-exec-slate text-[11px] py-1"
                              >
                                🔄 Reset Prompt
                              </button>
                              <button
                                onClick={() => copyPromptToClipboard(scene, idx)}
                                className="btn-exec btn-exec-blue text-[11px] py-1"
                              >
                                {copiedSceneIndex === idx ? '✓ Copied' : 'Copy Prompt'}
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={6}
                            value={scenePrompt}
                            onChange={(e) => handleUpdateCustomPrompt(scene.number, e.target.value)}
                            className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3.5 text-xs font-mono focus:border-amber-500 focus:outline-none leading-relaxed"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-200">
                  <button onClick={() => setWizardStep(3)} className="btn-exec btn-exec-slate">
                    ← Back to Step 3
                  </button>
                  <button onClick={() => setWizardStep(5)} className="btn-exec btn-exec-gold font-black">
                    Compile Production Packet →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: PROMPTS & FINAL PACKET */}
            {wizardStep === 5 && (
              <div className="exec-glass-card-gold p-6 md:p-8 rounded-3xl bg-white border-2 border-amber-400 space-y-6 shadow-md">
                <div className="border-b border-amber-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
                      Final Production Packet & Prompts
                      <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-0.5 rounded-full font-bold">
                        100% Independent Scene Prompts
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Download Word (.doc) or PDF (.pdf) script packets matching the 16-page sample layout.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setWizardStep(4)} className="btn-exec btn-exec-slate text-xs font-bold">
                      ← Back to Scenes
                    </button>
                    <button onClick={() => handleExportDownload('word')} className="btn-exec btn-exec-blue text-xs font-bold">
                      📄 Export Word (.doc)
                    </button>
                    <button onClick={() => handleExportDownload('pdf')} className="btn-exec btn-exec-emerald text-xs font-bold">
                      🖨️ Export PDF (.pdf)
                    </button>
                    <button onClick={() => handleExportDownload('txt')} className="btn-exec btn-exec-gold text-xs font-bold">
                      ⚡ Download Prompts (.txt)
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-amber-400 font-bold block">📁 Local Production Output Directory</span>
                    <span className="font-mono text-slate-300 text-[11px]">{OUTPUT_DIR_PATH}</span>
                  </div>
                  <button onClick={copyOutputDirToClipboard} className="btn-exec btn-exec-gold text-xs">
                    {copiedDir ? '✓ Copied Path' : 'Copy Output Path'}
                  </button>
                </div>

                <div className="space-y-6">
                  {(project.scenes || []).map((scene, idx) => {
                    const promptText = getScenePrompt(scene);
                    return (
                      <div key={scene.number} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg text-slate-100">
                        <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                          <span className="font-bold text-sm text-amber-400 flex items-center gap-2">
                            🎬 Scene {scene.number}: {scene.title} ({scene.duration_seconds}s)
                          </span>
                          <button
                            onClick={() => copyPromptToClipboard(scene, idx)}
                            className="btn-exec btn-exec-blue text-xs"
                          >
                            {copiedSceneIndex === idx ? '✓ Copied' : 'Copy Hedra Prompt'}
                          </button>
                        </div>

                        <div className="p-4 bg-slate-950">
                          <textarea
                            rows={8}
                            value={promptText}
                            onChange={(e) => handleUpdateCustomPrompt(scene.number, e.target.value)}
                            className="w-full bg-slate-950 text-slate-200 border-0 focus:outline-none text-xs font-mono leading-relaxed"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DASHBOARD VIEW MODE */}
        {viewMode === 'dashboard' && (
          <div className="flex flex-col md:flex-row gap-6">
            <aside className="w-full md:w-64 flex flex-col gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800 px-3 py-1 font-heading">
                Executive Routes
              </div>
              <nav className="flex flex-col gap-1.5">
                {[
                  { id: 'overview', label: '📊 Executive Summary', desc: 'Metadata & Vision' },
                  { id: 'brand', label: '🎨 Brand & Color Studio', desc: 'HEX, RGB, HSL, CMYK' },
                  { id: 'characters', label: '👤 Character & Image Studio', desc: 'Coach Duke Image Uploads' },
                  { id: 'scenes', label: '🎬 Scene Storyboard', desc: 'Actions & Dialogue' },
                  { id: 'prompts', label: '⚡ Hedra Prompt Engine', desc: '100% Independent' },
                  { id: 'storyboard', label: '🖼️ Visual Grid', desc: '9:16 Scene Cards' },
                  { id: 'downloads', label: '📦 Exports & Directory', desc: 'Downloads & Output Folder' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`text-left px-4 py-3 rounded-xl transition-all flex flex-col gap-0.5 ${
                      activeTab === tab.id
                        ? 'bg-amber-100 border border-amber-300 text-amber-900 font-bold shadow-sm'
                        : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-sm font-bold">{tab.label}</span>
                    <span className="text-[11px] opacity-70 font-normal">{tab.desc}</span>
                  </button>
                ))}
              </nav>
            </aside>

            <main className="flex-1 exec-glass-card p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 font-heading">Executive Summary</h2>
                    <p className="text-xs text-slate-500">High-level concept, audience parameters, and task references.</p>
                  </div>
                </div>
              )}

              {/* BRAND ENGINE */}
              {activeTab === 'brand' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 font-heading">Brand Engine & Multi-Format Color Studio</h2>
                      <p className="text-xs text-slate-500">Real-time conversion across HEX, RGB, HSL, and CMYK formats with 1-click copy.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CHARACTERS */}
              {activeTab === 'characters' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 font-heading">Character Library & AI Image Studio</h2>
                      <p className="text-xs text-slate-500">Reusable character rules and AI image generation gallery.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleSaveCharacterProfile} className="btn-exec btn-exec-emerald text-xs font-bold">
                        💾 Save Character Profile
                      </button>
                      <button onClick={handleOpenImageGenerator} className="btn-exec btn-exec-gold">
                        ✨ Make My Image
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENES */}
              {activeTab === 'scenes' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 font-heading">Scene Storyboard</h2>
                    <p className="text-xs text-slate-500 font-medium">Define visual action, dialogue, and camera directions for each scene.</p>
                  </div>
                </div>
              )}

              {/* PROMPTS */}
              {activeTab === 'prompts' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 font-heading">Independent Hedra Prompts</h2>
                    <p className="text-xs text-slate-500 font-medium">Every prompt is 100% self-contained and ready to execute independently in Hedra.</p>
                  </div>
                </div>
              )}

              {/* DOWNLOADS */}
              {activeTab === 'downloads' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 font-heading">Exports & Production Packets</h2>
                      <p className="text-xs text-slate-500">Download production packets matching the 16-page sample layout.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleExportDownload('word')} className="btn-exec btn-exec-blue text-xs">
                        📄 Export Word (.doc)
                      </button>
                      <button onClick={() => handleExportDownload('pdf')} className="btn-exec btn-exec-emerald text-xs">
                        🖨️ Export PDF (.pdf)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* ASSET LIBRARY IMAGE SELECTOR MODAL */}
      {showLibraryModal && librarySelectTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-blue-500/40 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-blue-400 font-heading">Choose Image from Persistent Asset Library</h3>
                <p className="text-[11px] text-slate-400">Select an existing image for Scene #{librarySelectTarget.sceneIndex + 1} {librarySelectTarget.type.toUpperCase()} frame</p>
              </div>
              <button onClick={() => setShowLibraryModal(false)} className="text-slate-400 hover:text-white font-bold text-lg px-2 py-1">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <span className="text-xs font-bold text-slate-700 block">Previously Uploaded & Generated Character Art</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(primaryChar.reference_images || []).map((img) => (
                  <button
                    key={img.id}
                    onClick={() => handleSelectFromLibrary(img.url)}
                    className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-amber-500 hover:scale-105 transition text-left group"
                  >
                    <div className="h-28 bg-slate-950 flex items-center justify-center overflow-hidden">
                      <img src={img.url} alt={img.file_name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 bg-slate-900 text-white text-[10px] font-mono truncate">
                      {img.file_name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button onClick={() => setShowLibraryModal(false)} className="btn-exec btn-exec-slate text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAKE MY IMAGE MODAL */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-amber-500/40 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <div>
                  <h3 className="font-bold text-base text-amber-400 font-heading">AI Character Image Generator</h3>
                  <p className="text-[11px] text-slate-400">Generate custom AI character concept art for {primaryChar.name}</p>
                </div>
              </div>
              <button onClick={() => setShowImageModal(false)} className="text-slate-400 hover:text-white font-bold text-lg px-2 py-1">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">AI Image Prompt (Pre-compiled from Character Continuity)</label>
                <textarea
                  rows={3}
                  value={generatorPrompt}
                  onChange={(e) => setGeneratorPrompt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Preset Character Stances & Angles</span>
                <button onClick={handleGenerateAiImage} disabled={isGenerating} className="btn-exec btn-exec-gold text-xs">
                  {isGenerating ? '⚡ Generating AI Art...' : '✨ Generate Concept Art'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {PRESET_AI_CHARACTER_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setGeneratedPreviewUrl(preset.url)}
                    className={`rounded-xl overflow-hidden border-2 text-left transition ${
                      generatedPreviewUrl === preset.url
                        ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-24 bg-slate-900 overflow-hidden">
                      <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-800 truncate">
                      {preset.title}
                    </div>
                  </button>
                ))}
              </div>

              {generatedPreviewUrl && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block">Generated Concept Preview (9:16 Aspect Ratio)</span>
                  <div className="h-56 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative shadow-inner">
                    <img src={generatedPreviewUrl} alt="AI Generated Preview" className="h-full object-cover" />
                    <div className="absolute bottom-3 left-3 bg-slate-900/90 text-amber-400 text-[10px] px-2.5 py-1 rounded-lg border border-amber-500/30 font-bold">
                      ✨ Ready for Character Library
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button onClick={() => setShowImageModal(false)} className="btn-exec btn-exec-slate text-xs">
                Cancel
              </button>
              <button onClick={handleSaveGeneratedImage} disabled={!generatedPreviewUrl} className="btn-exec btn-exec-gold text-xs font-black disabled:opacity-40">
                Save to Character Gallery →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
