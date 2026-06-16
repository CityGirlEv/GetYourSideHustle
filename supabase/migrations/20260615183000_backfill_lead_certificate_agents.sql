-- Backfill assigned agent on lead certificates for scenarios already assigned before sync existed.

UPDATE public.lead_certificates lc
SET
  assigned_agent_id = s.assigned_agent_id,
  assigned_agent_name = NULLIF(trim(p.full_name), '')
FROM public.scenarios s
LEFT JOIN public.profiles p ON p.id = s.assigned_agent_id
WHERE lc.scenario_code IS NOT NULL
  AND upper(trim(lc.scenario_code)) = upper(trim(s.scenario_code))
  AND s.assigned_agent_id IS NOT NULL
  AND lc.assigned_agent_id IS NULL;
