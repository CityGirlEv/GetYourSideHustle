UPDATE workshops
SET
  date = 'TBD',
  time = 'TBD',
  status = 'upcoming',
  registration_open = 0,
  registration_note = 'Registration is not open yet. Check back after the schedule is confirmed.',
  updated_at = datetime('now')
WHERE id != 'ai-scene-production-packs';

UPDATE workshops
SET
  format = 'Live Zoom',
  updated_at = datetime('now')
WHERE id IN ('junior-earnings-fair', 'pod-etsy-sprint', 'glow-getter-launch', 'agents-with-soul', 'meta-shopify-clinic');

UPDATE workshops
SET
  date = 'TBD',
  time = 'TBD',
  status = 'upcoming',
  registration_open = 1,
  updated_at = datetime('now')
WHERE id = 'ai-scene-production-packs';
