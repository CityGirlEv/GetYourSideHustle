/**
 * Scene packets for Content Factory posts.
 * Modeled on Rev1 GYSH Teens Wizard Hedra Scene Packet:
 * every scene is copy-paste complete (ChatGPT stills + Hedra start and end).
 */

import {
  ROLLOUT_CHANNEL_LABELS,
  softLaunchItemRef,
  softLaunchTaskId,
  type RolloutChannel,
  type SoftLaunchItem,
} from "./gysh-soft-launch-rollout";

export type ScenePacketScene = {
  number: number;
  title: string;
  duration: string;
  speakers: string;
  dialogue: string;
  action: string;
  startToEnd: string;
  screenReference?: string;
  /** ChatGPT / image-gen prompt for the starting frame. */
  chatgptStartPrompt: string;
  /** ChatGPT / image-gen prompt for the ending frame. */
  chatgptEndPrompt: string;
  /** Fully independent Hedra prompt. Repeats global settings. */
  hedraPrompt: string;
};

export type ScenePacket = {
  title: string;
  taskId: string;
  contentFactoryRef: string;
  format: string;
  audience: string;
  kind: "video" | "still";
  purpose: string;
  scenes: ScenePacketScene[];
};

const BRAND =
  "Soft Ivory #F7F1E3, Antique Gold #947D64, Crimson #9B2F28. Warm family brand. Readable type only. No other logos, no watermarks, no gibberish letters, no distorted hands or faces.";

const VIDEO_CHANNELS = new Set<RolloutChannel>(["youtube_gysh", "tiktok_gysh", "instagram_gysh"]);

export function isVideoContentFactoryItem(item: Pick<SoftLaunchItem, "id" | "channel" | "videoPrompt" | "hedraVideoPrompt">): boolean {
  if (item.id === "sl-s3-fb-teens") return true;
  if (item.videoPrompt?.trim() || item.hedraVideoPrompt?.trim()) return true;
  return VIDEO_CHANNELS.has(item.channel);
}

function aspectFor(item: SoftLaunchItem): string {
  if (item.channel === "youtube_gysh" || item.channel === "tiktok_gysh" || item.channel === "instagram_gysh") {
    return "9:16 vertical, 1080x1920";
  }
  if (item.channel === "facebook_gysh" || item.channel === "facebook_kevina") {
    return "4:5 portrait, 1080x1350";
  }
  return "1:1 square, 1080x1080";
}

function clip(text: string | undefined, fallback: string): string {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  return value || fallback;
}

function joinPrompt(parts: string[]): string {
  return parts.filter(Boolean).join("\n\n");
}

const TEENS_GLOBAL = `GLOBAL HEDRA SETTINGS - REPEAT IN EVERY SCENE
- Format: 9:16 vertical, 1080x1920 preferred.
- Audience/style: ages 13-17; bright premium 3D/cartoon teen world; energetic and relatable, never preschool.
- Cast lock: Coach Duke + the same four teens in every scene: Black Girl 16, Mexican Girl 15, Black Boy 16, Mexican Boy 16.
- Set lock: same GYSH Teens Corner room, table, laptop, props, lighting, wardrobe and seating continuity.
- Camera: medium-wide group composition plus gentle push-ins to the laptop; smooth motion; no abrupt cuts unless specified.
- Lip sync: only the named speaker lip-syncs the full line. Others react silently unless dialogue is assigned.
- Motion: natural teen gestures, pointing, tapping, smiles, head turns and high-fives; no rubbery or exaggerated movement.
- Wizard UI: use the supplied PNG for the scene as the exact screen reference. Keep question text, options, buttons and result readable and faithful.
- Continuity: no character morphing, face changes, age changes, skin-tone changes, hairstyle changes, wardrobe changes, logo changes or extra people.
- Branding: use the supplied Get Your Side Hustle logo. Keep GYSH branding clean and readable. Use Duke in every scene and the reference wizard screenshot on the computer screen.

DUKE CHARACTER CONTINUITY - REPEAT IN EVERY SCENE
Coach Duke is a 17-year-old blue cartoon teen character. Preserve his supplied reference identity exactly: blue star-like head shape, expressive brown eyes, thick black brows, youthful proportions and friendly mischievous personality. His gear is black/blue/yellow GYSH streetwear. FRONT: a small shoulder/chest name treatment that reads "Coach Duke." BACK: the supplied Get Your Side Hustle logo plus "TEENS CLUB." Keep his backward black cap, sneakers, pants, accessories, body proportions and overall silhouette consistent. Do not replace his face, recolor him, age him up or down, or redesign his clothing between scenes.

HEDRA MASTER PROMPT - REPEAT IN EVERY SCENE
This is one connected GYSH Teens Match Wizard story. Coach Duke acts as a funny, confident teen peer coach while four teens complete the Match Wizard together on a laptop. Every scene must look like the same continuous filming session. Preserve the exact same characters, room, table, laptop, wardrobe, gear branding, lighting and relative seating positions. The laptop screen is an important story element: use the supplied wizard screenshot for that scene and keep it legible. Dialogue should feel conversational, quick, excited and age-right. End each scene on a pose that can become the starting frame of the next scene.`;

const TEENS_FINAL = `FINAL EXECUTION INSTRUCTION
Generate only this scene as a continuous 9:16 vertical video clip. Use the supplied Coach Duke reference, GYSH logo and the exact wizard screenshot for this scene. Keep every character and branded clothing element consistent from first frame to last frame. Make the dialogue conversational and exciting, with clean speaker-specific lip sync. Do not invent or alter on-screen wizard wording. Do not redesign Coach Duke. End on the specified ending frame so this clip can connect to the next scene.`;

type TeenBeat = {
  title: string;
  duration: string;
  speakers: string;
  dialogue: string;
  action: string;
  startToEnd: string;
  screenReference?: string;
  startFrame: string;
  endFrame: string;
};

const TEEN_BEATS: TeenBeat[] = [
  {
    title: "Opening / Teens Corner",
    duration: "0:00-0:10",
    speakers: "Coach Duke + all teens",
    dialogue: `COACH DUKE: "Hey y'all! Welcome to my home at the Get Your Side Hustle Teens Corner. I'm Delbert, aka Duke - just call me Coach Duke. I'm your GYSH guide and mentor through this journey. Y'all ready?"
ALL TEENS: "Yeah!"`,
    action: "Duke sits at the table with all four teens, welcomes them, gestures to the laptop and gets the group ready.",
    startToEnd: "Start with a medium-wide shot of Coach Duke centered at the table with the four teens around him. End with the group leaning toward the laptop, energized and ready to begin.",
    startFrame: "Medium-wide 9:16 still. Coach Duke centered at the Teens Corner table, four teens seated around him (Black Girl 16, Mexican Girl 15, Black Boy 16, Mexican Boy 16). Laptop closed or dark on the table. GYSH logo readable on Duke's back. Soft Ivory room, Antique Gold props, Crimson accent. No extra people.",
    endFrame: "Same room, same cast, same wardrobe. Group leaning toward the laptop, which is now open on a clean GYSH welcome screen. Duke's hand gestures toward the screen. Energized ready pose. Faces unchanged.",
  },
  {
    title: "Question 1 of 4 - How old are you? Select Ages 15-17",
    duration: "0:10-0:18",
    speakers: "Black Boy, 16 + Duke",
    dialogue: `BLACK BOY: "Okay, first question - how old are you? Easy. I'm sixteen, so I'm hitting Ages 15 to 17."
COACH DUKE: "Boom. Keep it moving."`,
    action: "Black Boy reads the first question, points to the screen and selects Ages 15-17.",
    startToEnd: "Begin with the group focused on the laptop. End with Ages 15-17 visibly selected and Duke giving an approving reaction.",
    screenReference: "Scene2HowHold.png",
    startFrame: "Group focused on the laptop. Screen shows the exact wizard question 'How old are you?' with options including Ages 15-17, none selected yet. Duke and the four teens unchanged.",
    endFrame: "Same framing. Screen shows Ages 15-17 selected. Duke gives a small approving nod. Black Boy's finger just leaving the trackpad. No face or wardrobe change.",
  },
  {
    title: "Question 2 of 4 - What sounds most fun? Select AI & making games",
    duration: "0:18-0:28",
    speakers: "Black Boy, 16 + Mexican Boy",
    dialogue: `BLACK BOY: "Next: what sounds most fun? Tech and gadgets is tempting... but AI and making games? Yeah, that's me."
MEXICAN BOY: "You better make us a game then!"`,
    action: "Black Boy reads the options, jokes with the group and selects AI & making games.",
    startToEnd: "Begin on the Question 2 screen. End with AI & making games selected while the group laughs and reacts.",
    screenReference: "Scene3WhatSoundsFun.png",
    startFrame: "Laptop shows Question 2 'What sounds most fun?' with options visible and nothing selected. Same four teens and Duke, same seats.",
    endFrame: "Laptop shows 'AI & making games' selected. Group laughing. Mexican Boy turned toward Black Boy. Duke still in frame. Screen text stays sharp.",
  },
  {
    title: "Question 3 of 4 - Where do you like to work? Select Either is fine",
    duration: "0:28-0:38",
    speakers: "Mexican Girl, 15 + Duke",
    dialogue: `MEXICAN GIRL: "Now it wants to know where I like to work - outdoors, indoors, or either. Honestly? Either is fine. I like options."
COACH DUKE: "That's what I'm talking about."`,
    action: "Mexican Girl takes over the laptop and selects Either is fine.",
    startToEnd: "Begin with Mexican Girl leaning toward the laptop. End with Either is fine selected and Duke nodding approvingly.",
    screenReference: "Scene4WhereDoYouLikeToWork.png",
    startFrame: "Mexican Girl leaning toward the laptop. Screen shows 'Where do you like to work?' with outdoors, indoors, and either visible, none selected.",
    endFrame: "Screen shows 'Either is fine' selected. Duke nodding. Mexican Girl's hands resting, selection complete. Cast and room unchanged.",
  },
  {
    title: "Question 4 of 4 - How much time do you have? Select More free time (3+ hours)",
    duration: "0:38-0:48",
    speakers: "Mexican Boy, 16 + Black Girl",
    dialogue: `MEXICAN BOY: "Last one - how much time do I have? I can give it three-plus hours. Let's see what this thing gives us."
BLACK GIRL: "Hit the button!"
MEXICAN BOY: "See my matches!"`,
    action: "Mexican Boy selects More free time (3+ hours), then clicks See my matches as everyone leans in.",
    startToEnd: "Begin with Question 4 on the laptop. End immediately after the See my matches click with everyone leaning closer in anticipation.",
    screenReference: "Scene5HowMuchTimeDoYouHave.png",
    startFrame: "Laptop shows Question 4 'How much time do you have?' including 'More free time (3+ hours)', nothing selected. Mexican Boy's hands near the keyboard.",
    endFrame: "More free time (3+ hours) is selected and the See my matches control is just clicked. Everyone leans closer. Anticipation pose. Screen still readable.",
  },
  {
    title: "Blueprint Ready - Best Match: Create Games with AI",
    duration: "0:48-1:00",
    speakers: "Mexican Boy + Coach Duke + all teens",
    dialogue: `MEXICAN BOY: "Whoa - my best match is Create Games with AI. Create games with AI? For real? I'm with that!"
COACH DUKE: "That's the point. Your age, your interests, your time - your hustle."
ALL: "Let's go!"`,
    action: "Reveal the Blueprint result, then pull back to the whole group celebrating with high-fives.",
    startToEnd: "Begin close enough to read the Blueprint result. End on a joyful group high-five with Coach Duke and the laptop still visible.",
    screenReference: "Scene6BluePrintReady.png",
    startFrame: "Closer framing. Laptop screen readable: Blueprint ready, best match 'Create Games with AI'. Faces of Duke and the four teens unchanged at the edges of frame.",
    endFrame: "Pulled-back group high-five. Coach Duke and the laptop still visible. Screen still shows Create Games with AI. Joyful, not chaotic. End card space can hold getyoursidehustle.com.",
  },
];

function teensHedraPrompt(beat: TeenBeat, number: number): string {
  return joinPrompt([
    TEENS_GLOBAL,
    `SCENE-SPECIFIC HEDRA DIRECTION
Scene ${number}, duration ${beat.duration}. Wizard step: ${beat.title}.
Speaker(s): ${beat.speakers}.
Dialogue:
${beat.dialogue}
Action: ${beat.action}
Start/End continuity: ${beat.startToEnd}`,
    `STARTING IMAGE INSTRUCTIONS
Generate or upload this exact starting frame before motion: ${beat.startFrame}
${beat.screenReference ? `Wizard screen reference file: ${beat.screenReference}. Put that screenshot on the laptop. Do not rewrite the UI.` : "Laptop shows the GYSH Teens Corner welcome, not a blank screen."}`,
    `ENDING IMAGE INSTRUCTIONS
Land on this exact ending frame: ${beat.endFrame}`,
    TEENS_FINAL,
  ]);
}

function chatgptStill(frame: string): string {
  return `ChatGPT image prompt. ${BRAND} ${frame} Export a single still, no collage of extra scenes, no captions burned over faces.`;
}

export function teensWizardScenePacket(item: SoftLaunchItem): ScenePacket {
  return {
    title: "GYSH Teens Wizard - Hedra Scene Packet",
    taskId: softLaunchTaskId(item.id),
    contentFactoryRef: softLaunchItemRef(item.id),
    format: "9:16 vertical | Approx. 60 seconds | Audience: Teens 13-17",
    audience: "Teens 13-17",
    kind: "video",
    purpose:
      "Each scene is self-contained. Global Hedra settings, the master prompt, and Duke continuity are repeated inside every scene so it can be pasted into Hedra alone.",
    scenes: TEEN_BEATS.map((beat, index) => ({
      number: index + 1,
      title: beat.title,
      duration: beat.duration,
      speakers: beat.speakers,
      dialogue: beat.dialogue,
      action: beat.action,
      startToEnd: beat.startToEnd,
      screenReference: beat.screenReference,
      chatgptStartPrompt: chatgptStill(beat.startFrame),
      chatgptEndPrompt: chatgptStill(beat.endFrame),
      hedraPrompt: teensHedraPrompt(beat, index + 1),
    })),
  };
}

function genericGlobal(item: SoftLaunchItem): string {
  const aspect = aspectFor(item);
  return `GLOBAL HEDRA SETTINGS - REPEAT IN EVERY SCENE
- Format: ${aspect}.
- Brand: Get Your Side Hustle. ${BRAND}
- Channel: ${ROLLOUT_CHANNEL_LABELS[item.channel]}.
- Camera: stable, one continuous clip for this scene only, gentle push-in, no whip pans.
- On-screen words stay sharp and locked. Do not morph type.
- Continuity: no new people mid-scene, no logo swaps, no unreadable UI.
- Family-friendly energy. Not hustle-culture shouting.
- End this scene on the specified ending frame so the next scene can start there.

MASTER CONCEPT
${clip(item.videoPrompt, clip(item.copy, item.title))}

Post title: ${item.title}.`;
}

function genericFinal(number: number, total: number): string {
  return `FINAL EXECUTION INSTRUCTION
Generate only scene ${number} of ${total} as one continuous clip. Describe this scene completely inside this prompt. Use the starting-image instructions as frame one and land exactly on the ending-image instructions. Keep brand colors and any on-screen words unchanged from first frame to last frame.`;
}

function videoPacket(item: SoftLaunchItem): ScenePacket {
  const aspect = aspectFor(item);
  const hook = clip(item.title, "Get Your Side Hustle");
  const start = clip(
    item.hedraStartImagePrompt || item.imagePrompt,
    `${aspect}. Opening still for "${hook}". ${BRAND} Footer getyoursidehustle.com.`,
  );
  const middle = clip(item.hedraVideoPrompt || item.videoPrompt, `Show the path in the caption: ${clip(item.copy, hook)}`);
  const beats = [
    {
      title: "Opening hook",
      duration: "0:00-0:08",
      speakers: "On-screen text (no required lip sync)",
      dialogue: hook,
      action: "Open on the brand hook and hold it long enough to read.",
      startFrame: start,
      endFrame: `Same brand plate, hook text still sharp, camera a little closer, ready to reveal the next beat. ${BRAND}`,
    },
    {
      title: "Path",
      duration: "0:08-0:20",
      speakers: "On-screen text",
      dialogue: middle,
      action: "Play the middle of the post: the wizard, guide, or tip named in the brief.",
      startFrame: `Continue from a closer brand plate. Introduce the middle visual for "${hook}" with readable GYSH UI or icons. ${BRAND}`,
      endFrame: `Middle visual complete and readable. Leave clear space for the end card. ${BRAND}`,
    },
    {
      title: "End card",
      duration: "0:20-end",
      speakers: "On-screen text",
      dialogue: "Start free. getyoursidehustle.com",
      action: "Lock the end card. No new scene after the URL hold.",
      startFrame: `Transition frame into the end card. Crimson Start free pill beginning to appear. ${BRAND}`,
      endFrame: `Locked end card. Large readable "Start free" and getyoursidehustle.com. Hold still. ${BRAND}`,
    },
  ];
  return {
    title: `${item.title} - Hedra Scene Packet`,
    taskId: softLaunchTaskId(item.id),
    contentFactoryRef: softLaunchItemRef(item.id),
    format: `${aspect} | Video + stills`,
    audience: "Kids, Teens, Adults, and Seniors",
    kind: "video",
    purpose:
      "Paste one scene at a time into Hedra. Each prompt repeats the global settings and names its own starting and ending frame.",
    scenes: beats.map((beat, index) => ({
      number: index + 1,
      title: beat.title,
      duration: beat.duration,
      speakers: beat.speakers,
      dialogue: beat.dialogue,
      action: beat.action,
      startToEnd: `Start: ${beat.startFrame} End: ${beat.endFrame}`,
      chatgptStartPrompt: chatgptStill(beat.startFrame),
      chatgptEndPrompt: chatgptStill(beat.endFrame),
      hedraPrompt: joinPrompt([
        genericGlobal(item),
        `SCENE-SPECIFIC HEDRA DIRECTION
Scene ${index + 1} of ${beats.length}, duration ${beat.duration}. ${beat.title}.
Dialogue / on-screen text:
${beat.dialogue}
Action: ${beat.action}`,
        `STARTING IMAGE INSTRUCTIONS
${beat.startFrame}`,
        `ENDING IMAGE INSTRUCTIONS
${beat.endFrame}`,
        genericFinal(index + 1, beats.length),
      ]),
    })),
  };
}

function stillPacket(item: SoftLaunchItem): ScenePacket {
  const aspect = aspectFor(item);
  const concept = clip(
    item.imagePrompt,
    `${aspect} social still for "${item.title}". ${BRAND} One clear headline from the post. Footer getyoursidehustle.com.`,
  );
  const end = `Ending hold of the same still: headline locked, Crimson Start free or the post CTA readable, getyoursidehustle.com at the bottom. No extra scene. ${BRAND}`;
  return {
    title: `${item.title} - Still Packet`,
    taskId: softLaunchTaskId(item.id),
    contentFactoryRef: softLaunchItemRef(item.id),
    format: `${aspect} | Image`,
    audience: "Kids, Teens, Adults, and Seniors",
    kind: "still",
    purpose: "ChatGPT makes the still. Hedra can hold or gently move from the starting frame to the ending frame.",
    scenes: [
      {
        number: 1,
        title: "Still",
        duration: "Hold",
        speakers: "None",
        dialogue: clip(item.copy, item.title),
        action: "Publish this still with the post copy. If a short motion version is needed, move only from the start frame to the end frame.",
        startToEnd: `Start: ${concept} End: ${end}`,
        chatgptStartPrompt: chatgptStill(concept),
        chatgptEndPrompt: chatgptStill(end),
        hedraPrompt: joinPrompt([
          genericGlobal(item),
          `SCENE-SPECIFIC HEDRA DIRECTION
Scene 1 of 1. Still hold for ${item.title}.
On-screen text stays the headline from the ChatGPT still. No new characters.`,
          `STARTING IMAGE INSTRUCTIONS
${concept}`,
          `ENDING IMAGE INSTRUCTIONS
${end}`,
          genericFinal(1, 1),
        ]),
      },
    ],
  };
}

export function scenePackageForItem(item: SoftLaunchItem): ScenePacket {
  if (item.id === "sl-s3-fb-teens") return teensWizardScenePacket(item);
  if (isVideoContentFactoryItem(item)) return videoPacket(item);
  return stillPacket(item);
}
