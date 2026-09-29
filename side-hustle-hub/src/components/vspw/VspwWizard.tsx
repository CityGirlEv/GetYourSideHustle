import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Clapperboard, Plus, Trash2 } from "lucide-react";
import {
  VSPW_CREDIT_ESTIMATOR_FUTURE_NOTE,
  VSPW_WIZARD_STEPS,
  blankCharacter,
  blankDialogueLine,
  blankScene,
  clearVspwWizardProject,
  defaultVspwWizardProject,
  nextVspwWizardStep,
  prevVspwWizardStep,
  readVspwWizardProject,
  vspwWizardStepById,
  writeVspwWizardProject,
  type VspwWizardProject,
  type VspwWizardStepId,
} from "../../lib/vspw-wizard";
import { VspwReferenceImageField } from "./VspwReferenceImageField";

/**
 * Step-by-step Video Scene Production Wizard walkthrough.
 * Saves to session so you can leave and resume.
 */
export function VspwWizard() {
  const [project, setProject] = useState<VspwWizardProject>(() => readVspwWizardProject());
  const step = vspwWizardStepById(project.stepId);
  const stepIndex = VSPW_WIZARD_STEPS.findIndex((s) => s.id === project.stepId);
  const next = nextVspwWizardStep(project.stepId);
  const prev = prevVspwWizardStep(project.stepId);

  useEffect(() => {
    writeVspwWizardProject(project);
  }, [project]);

  const go = (stepId: VspwWizardStepId) => setProject((p) => ({ ...p, stepId }));

  const patch = (partial: Partial<VspwWizardProject>) =>
    setProject((p) => ({ ...p, ...partial }));

  return (
    <div className="vspw-wizard" data-testid="vspw-wizard">
      <header className="vspw-wizard__head">
        <p className="glow-badge free" data-testid="vspw-wizard-step-badge">
          Step {step.number} of {VSPW_WIZARD_STEPS.length} · {step.shortLabel}
        </p>
        <h2 id="vspw-wizard-heading">{step.title}</h2>
        <p className="vspw-wizard__blurb">{step.blurb}</p>
      </header>

      <nav className="vspw-wizard__steps" aria-label="Wizard steps" data-testid="vspw-wizard-steps">
        {VSPW_WIZARD_STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`vspw-wizard__step-chip${s.id === project.stepId ? " is-active" : ""}${
              s.number < step.number ? " is-done" : ""
            }`}
            onClick={() => go(s.id)}
            data-testid={`vspw-wizard-step-${s.id}`}
          >
            <span aria-hidden>{s.number}</span> {s.shortLabel}
          </button>
        ))}
      </nav>

      <div className="vspw-wizard__panel glass" data-testid={`vspw-wizard-panel-${project.stepId}`}>
        {project.stepId === "project" && (
          <div className="vspw-wizard__form">
            <label>
              Production title
              <input
                className="text-input"
                value={project.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="e.g. Angela Talking Hat Commercial"
                data-testid="vspw-project-title"
              />
            </label>
            <label>
              Brand / product
              <input
                className="text-input"
                value={project.brandOrProduct}
                onChange={(e) => patch({ brandOrProduct: e.target.value })}
                placeholder="e.g. My Plan, Not My Mood tee"
                data-testid="vspw-project-brand"
              />
            </label>
          </div>
        )}

        {project.stepId === "characters" && (
          <div className="vspw-wizard__list">
            {project.characters.map((c, i) => (
              <div key={c.id} className="vspw-wizard__card" data-testid={`vspw-character-${i}`}>
                <label>
                  Character name
                  <input
                    className="text-input"
                    value={c.name}
                    onChange={(e) => {
                      const characters = project.characters.map((row) =>
                        row.id === c.id ? { ...row, name: e.target.value } : row,
                      );
                      patch({ characters });
                    }}
                    placeholder="e.g. Angela"
                  />
                </label>
                <label>
                  Notes
                  <input
                    className="text-input"
                    value={c.notes}
                    onChange={(e) => {
                      const characters = project.characters.map((row) =>
                        row.id === c.id ? { ...row, notes: e.target.value } : row,
                      );
                      patch({ characters });
                    }}
                    placeholder="Age look, vibe, role…"
                  />
                </label>
                {project.characters.length > 1 ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      patch({ characters: project.characters.filter((row) => row.id !== c.id) })
                    }
                  >
                    <Trash2 size={14} aria-hidden /> Remove
                  </button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => patch({ characters: [...project.characters, blankCharacter()] })}
              data-testid="vspw-add-character"
            >
              <Plus size={14} aria-hidden /> Add character
            </button>
          </div>
        )}

        {project.stepId === "scenes" && (
          <div className="vspw-wizard__list">
            {project.scenes.map((s, i) => (
              <div key={s.id} className="vspw-wizard__card" data-testid={`vspw-scene-${i}`}>
                <label>
                  Scene title
                  <input
                    className="text-input"
                    value={s.title}
                    onChange={(e) => {
                      const scenes = project.scenes.map((row) =>
                        row.id === s.id ? { ...row, title: e.target.value } : row,
                      );
                      patch({ scenes });
                    }}
                  />
                </label>
                <label>
                  Duration (seconds)
                  <input
                    className="text-input"
                    type="number"
                    min={1}
                    value={s.durationSeconds}
                    onChange={(e) => {
                      const scenes = project.scenes.map((row) =>
                        row.id === s.id
                          ? {
                              ...row,
                              durationSeconds: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                            }
                          : row,
                      );
                      patch({ scenes });
                    }}
                  />
                </label>
                <label>
                  Location / setting
                  <input
                    className="text-input"
                    value={s.location}
                    onChange={(e) => {
                      const scenes = project.scenes.map((row) =>
                        row.id === s.id ? { ...row, location: e.target.value } : row,
                      );
                      patch({ scenes });
                    }}
                    placeholder="Bedroom, kitchen, outdoor…"
                  />
                </label>
                {project.scenes.length > 1 ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => patch({ scenes: project.scenes.filter((row) => row.id !== s.id) })}
                  >
                    <Trash2 size={14} aria-hidden /> Remove scene
                  </button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                patch({ scenes: [...project.scenes, blankScene(project.scenes.length + 1)] })
              }
              data-testid="vspw-add-scene"
            >
              <Plus size={14} aria-hidden /> Add scene
            </button>
          </div>
        )}

        {project.stepId === "dialogue" && (
          <div className="vspw-wizard__list">
            {project.scenes.map((s) => (
              <div key={s.id} className="vspw-wizard__card">
                <h3 className="vspw-wizard__card-title">{s.title} — Dialogue</h3>
                {s.dialogue.map((line) => (
                  <div key={line.id} className="vspw-wizard__dialogue-line">
                    <label>
                      Speaker
                      <input
                        className="text-input"
                        value={line.speaker}
                        list="vspw-character-names"
                        onChange={(e) => {
                          const scenes = project.scenes.map((scene) =>
                            scene.id !== s.id
                              ? scene
                              : {
                                  ...scene,
                                  dialogue: scene.dialogue.map((d) =>
                                    d.id === line.id ? { ...d, speaker: e.target.value } : d,
                                  ),
                                },
                          );
                          patch({ scenes });
                        }}
                      />
                    </label>
                    <label>
                      Dialogue text
                      <textarea
                        className="text-input"
                        rows={2}
                        value={line.text}
                        onChange={(e) => {
                          const scenes = project.scenes.map((scene) =>
                            scene.id !== s.id
                              ? scene
                              : {
                                  ...scene,
                                  dialogue: scene.dialogue.map((d) =>
                                    d.id === line.id ? { ...d, text: e.target.value } : d,
                                  ),
                                },
                          );
                          patch({ scenes });
                        }}
                        placeholder='e.g. "Girl, I am not getting out of this bed today."'
                      />
                    </label>
                    <div className="vspw-wizard__row">
                      <label>
                        Tone / emotion
                        <input
                          className="text-input"
                          value={line.tone}
                          onChange={(e) => {
                            const scenes = project.scenes.map((scene) =>
                              scene.id !== s.id
                                ? scene
                                : {
                                    ...scene,
                                    dialogue: scene.dialogue.map((d) =>
                                      d.id === line.id ? { ...d, tone: e.target.value } : d,
                                    ),
                                  },
                            );
                            patch({ scenes });
                          }}
                        />
                      </label>
                      <label>
                        Action while speaking
                        <input
                          className="text-input"
                          value={line.actionWhileSpeaking}
                          onChange={(e) => {
                            const scenes = project.scenes.map((scene) =>
                              scene.id !== s.id
                                ? scene
                                : {
                                    ...scene,
                                    dialogue: scene.dialogue.map((d) =>
                                      d.id === line.id
                                        ? { ...d, actionWhileSpeaking: e.target.value }
                                        : d,
                                    ),
                                  },
                            );
                            patch({ scenes });
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    const defaultSpeaker = project.characters[0]?.name || "";
                    const scenes = project.scenes.map((scene) =>
                      scene.id !== s.id
                        ? scene
                        : {
                            ...scene,
                            dialogue: [...scene.dialogue, blankDialogueLine(defaultSpeaker)],
                          },
                    );
                    patch({ scenes });
                  }}
                >
                  <Plus size={14} aria-hidden /> Add dialogue
                </button>
              </div>
            ))}
            <datalist id="vspw-character-names">
              {project.characters
                .filter((c) => c.name.trim())
                .map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
            </datalist>
          </div>
        )}

        {project.stepId === "wardrobe" && (
          <div className="vspw-wizard__list">
            {project.scenes.map((s) => (
              <div key={s.id} className="vspw-wizard__card">
                <h3 className="vspw-wizard__card-title">{s.title} — Wardrobe for this scene</h3>
                <label>
                  Clothing / continuity notes
                  <textarea
                    className="text-input"
                    rows={3}
                    value={s.wardrobeNotes}
                    onChange={(e) => {
                      const scenes = project.scenes.map((row) =>
                        row.id === s.id ? { ...row, wardrobeNotes: e.target.value } : row,
                      );
                      patch({ scenes });
                    }}
                    placeholder="e.g. Keep pajamas from Scene 1 · Scene 2: white My Plan tee + jeans"
                  />
                </label>
              </div>
            ))}
          </div>
        )}

        {project.stepId === "images" && (
          <div className="vspw-wizard__list">
            <p className="vspw-wizard__blurb" style={{ fontWeight: 600 }}>
              Upload starting and ending reference stills for each scene. These stay in this browser
              with your wizard draft — they are not sent to Hedra from VSPW.
            </p>
            {project.scenes.map((s, sceneIdx) => (
              <div key={s.id} className="vspw-wizard__card" data-testid={`vspw-scene-images-${sceneIdx}`}>
                <h3 className="vspw-wizard__card-title">{s.title} — Images</h3>
                <div className="vspw-wizard__row">
                  <VspwReferenceImageField
                    label="Starting reference image"
                    value={s.startImage}
                    testId={`vspw-start-image-${sceneIdx}`}
                    onChange={(startImage) => {
                      const scenes = project.scenes.map((row) =>
                        row.id === s.id ? { ...row, startImage } : row,
                      );
                      patch({ scenes });
                    }}
                  />
                  <VspwReferenceImageField
                    label="Ending reference image"
                    value={s.endImage}
                    testId={`vspw-end-image-${sceneIdx}`}
                    onChange={(endImage) => {
                      const scenes = project.scenes.map((row) =>
                        row.id === s.id ? { ...row, endImage } : row,
                      );
                      patch({ scenes });
                    }}
                  />
                </div>
                <label>
                  Starting image note (optional)
                  <input
                    className="text-input"
                    value={s.startImageNote}
                    onChange={(e) => {
                      const scenes = project.scenes.map((row) =>
                        row.id === s.id ? { ...row, startImageNote: e.target.value } : row,
                      );
                      patch({ scenes });
                    }}
                    placeholder="Shot notes, framing, continuity…"
                  />
                </label>
                <label>
                  Ending image note (optional)
                  <input
                    className="text-input"
                    value={s.endImageNote}
                    onChange={(e) => {
                      const scenes = project.scenes.map((row) =>
                        row.id === s.id ? { ...row, endImageNote: e.target.value } : row,
                      );
                      patch({ scenes });
                    }}
                    placeholder="Shot notes, framing, continuity…"
                  />
                </label>
              </div>
            ))}
          </div>
        )}

        {project.stepId === "review" && (
          <div className="vspw-wizard__review" data-testid="vspw-wizard-review">
            <p>
              <strong>{project.title || "Untitled production"}</strong>
              {project.brandOrProduct ? ` · ${project.brandOrProduct}` : ""}
            </p>
            <p>
              {project.characters.filter((c) => c.name.trim()).length} character(s) ·{" "}
              {project.scenes.length} scene(s) ·{" "}
              {project.scenes.reduce((n, s) => n + s.durationSeconds, 0)}s planned
            </p>
            <ul>
              {project.scenes.map((s) => (
                <li key={s.id}>
                  <strong>{s.title}</strong> ({s.durationSeconds}s)
                  {s.location ? ` — ${s.location}` : ""} · {s.dialogue.length} dialogue line(s)
                  {s.wardrobeNotes ? ` · wardrobe noted` : ""}
                  {s.startImage || s.endImage
                    ? ` · refs: ${[s.startImage && "start", s.endImage && "end"].filter(Boolean).join(" + ")}`
                    : ""}
                </li>
              ))}
            </ul>
            <p className="vspw-wizard__future" data-testid="vspw-credit-future-note">
              {VSPW_CREDIT_ESTIMATOR_FUTURE_NOTE}
            </p>
          </div>
        )}

        {project.stepId === "pack" && (
          <div className="vspw-wizard__pack" data-testid="vspw-wizard-pack">
            <Clapperboard size={22} aria-hidden style={{ color: "var(--bronze)" }} />
            <h3>Production Pack (draft)</h3>
            <p>
              Packet for <strong>{project.title || "Untitled production"}</strong> is ready to expand
              with prompts and exports. For now, your walkthrough data is saved in this browser
              session.
            </p>
            <pre className="vspw-wizard__pack-preview" data-testid="vspw-pack-preview">
              {JSON.stringify(
                {
                  title: project.title,
                  brandOrProduct: project.brandOrProduct,
                  characters: project.characters,
                  scenes: project.scenes.map((s) => ({
                    title: s.title,
                    durationSeconds: s.durationSeconds,
                    location: s.location,
                    dialogue: s.dialogue,
                    wardrobeNotes: s.wardrobeNotes,
                    startImageNote: s.startImageNote,
                    endImageNote: s.endImageNote,
                    startImage: s.startImage
                      ? { name: s.startImage.name, mimeType: s.startImage.mimeType, size: s.startImage.size }
                      : null,
                    endImage: s.endImage
                      ? { name: s.endImage.name, mimeType: s.endImage.mimeType, size: s.endImage.size }
                      : null,
                  })),
                },
                null,
                2,
              )}
            </pre>
            <p className="vspw-wizard__future">{VSPW_CREDIT_ESTIMATOR_FUTURE_NOTE}</p>
          </div>
        )}
      </div>

      <footer className="vspw-wizard__nav">
        <button
          type="button"
          className="btn btn-outline"
          disabled={!prev}
          onClick={() => prev && go(prev)}
          data-testid="vspw-wizard-back"
        >
          <ArrowLeft size={16} aria-hidden /> Back
        </button>
        <span className="vspw-wizard__progress" data-testid="vspw-wizard-progress">
          {stepIndex + 1} / {VSPW_WIZARD_STEPS.length}
        </span>
        {next ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => go(next)}
            data-testid="vspw-wizard-next"
          >
            Continue <ArrowRight size={16} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              clearVspwWizardProject();
              setProject(defaultVspwWizardProject());
            }}
            data-testid="vspw-wizard-restart"
          >
            Start a new production
          </button>
        )}
      </footer>
    </div>
  );
}
