import { Project } from '../types/index.js';

export const GYSH_SEED_PROJECT: Project = {
  name: 'GYSH - Coach Duke Teen Side Hustle Action Plan',
  task_reference: 'T-SL-S3-FB-TEENS',
  content_factory_reference: 'CF-020',
  audience: 'Teens 13-17',
  aspect_ratio: '9:16',
  brain_dump:
    '17-year-old Coach Duke breaks down a 3-step action plan for teens aged 13-17 to build a side hustle with zero upfront capital.',
  overall_concept:
    'High-energy vertical video (9:16) featuring Coach Duke delivering energetic teen mentorship in custom GYSH streetwear.',
  brand: {
    name: 'Get Your Side Hustle',
    short_name: 'GYSH',
    website: 'https://getyoursidehustle.com',
    colors: ['#000000', '#1E3A8A', '#FACC15', '#FFFFFF'],
    visual_style: 'Streetwear style, vibrant high-contrast youth aesthetic, modern dark background.'
  },
  characters: [
    {
      name: 'Delbert',
      nickname: 'Coach Duke',
      age: 17,
      role: 'Teen Side Hustle Coach',
      appearance: '17-year-old athletic teen male with energetic stance and cap.',
      personality: 'High-energy, relatable, motivational, articulate teen leader.',
      voice: 'Energetic, direct, clear teen voice with natural cadence.',
      wardrobe:
        'Black/blue/yellow GYSH streetwear. FRONT: Coach Duke on front shoulder/chest. BACK: GYSH logo + TEENS CLUB.',
      continuity_rules: 'Preserve face, age, proportions, silhouette, cap, gear and wardrobe.',
      reference_images: [
        {
          id: 'ref-cd-front-01',
          file_name: 'Coach_Duke_Front_Streetwear.png',
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          uploaded_at: new Date().toISOString()
        },
        {
          id: 'ref-cd-back-02',
          file_name: 'Coach_Duke_Back_TeensClub_Hoodie.png',
          url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
          uploaded_at: new Date().toISOString()
        }
      ]
    }
  ],
  scenes: [
    {
      number: 1,
      title: "The Hook: Stop Being Broke",
      duration_seconds: 8,
      dialogue: "Yo! If you're 13 to 17 and tired of being broke, listen up. I'm Coach Duke, and today we're building your first side hustle.",
      action: "Coach Duke leans into the camera with an energetic gesture, wearing his black/blue/yellow GYSH streetwear and cap.",
      camera_direction: "Medium close-up shot, vertical 9:16 framing, fast zoom-in to face.",
      animation_direction: "Dynamic motion, active facial expression, natural head tilts while speaking.",
      transition: "Fast whip pan",
      canonical_scene_spec: {} as any,
      provider_prompts: { hedra: '' }
    },
    {
      number: 2,
      title: "The Strategy: 3-Step Formula",
      duration_seconds: 12,
      dialogue: "Step one: Pick a skill you already have, like video editing or social media setup. Step two: Pitch local small businesses. Step three: Stack your wins!",
      action: "Coach Duke points to glowing overlay graphics showing step numbers 1, 2, and 3.",
      camera_direction: "Medium shot, 9:16 vertical, smooth slight panning tracking shot.",
      animation_direction: "Emphatic hand gestures, pointing up on each step, energetic body movement.",
      transition: "Glitch cut",
      canonical_scene_spec: {} as any,
      provider_prompts: { hedra: '' }
    },
    {
      number: 3,
      title: "Call to Action: Join Teens Club",
      duration_seconds: 10,
      dialogue: "Want the full blueprint? Hit the link at getyoursidehustle.com and join the TEENS CLUB today. Let's get to work!",
      action: "Coach Duke turns slightly to show the back of his hoodie ('GYSH logo + TEENS CLUB'), points down to link.",
      camera_direction: "Medium shot panning around to front, ending on strong closing hero pose.",
      animation_direction: "Smooth turn, point-to-screen gesture, big confident smile.",
      transition: "Fade out",
      canonical_scene_spec: {} as any,
      provider_prompts: { hedra: '' }
    }
  ]
};
