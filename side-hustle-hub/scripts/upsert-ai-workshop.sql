INSERT INTO workshops (
  id, title, blurb, date, time, format, audience, status,
  registration_open, capacity, registration_note,
  speaker_ids_json, tags_json, sort_order, updated_at
) VALUES (
  'ai-scene-production-packs',
  '90-Minute AI Marketing Video Workshop',
  '90-minute hands-on AI marketing video lab with ChatGPT, Hedra, and CapCut. Turn one idea into a 3-scene marketing video you can reuse as a Scene Production Pack.',
  'TBD',
  'TBD',
  'Live Zoom',
  'adult',
  'upcoming',
  1,
  10,
  'Pre-registration is open — date and time are TBD. We''ll email you when the schedule is confirmed. This class is limited to 10 participants max.',
  '["tina","evelyn"]',
  '["AI Video"]',
  0,
  datetime('now')
)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  blurb = excluded.blurb,
  date = 'TBD',
  time = 'TBD',
  format = excluded.format,
  audience = excluded.audience,
  status = 'upcoming',
  registration_open = 1,
  capacity = 10,
  registration_note = excluded.registration_note,
  speaker_ids_json = excluded.speaker_ids_json,
  tags_json = excluded.tags_json,
  updated_at = excluded.updated_at;
