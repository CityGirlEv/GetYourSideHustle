-- Threaded agent/admin conversation notes per scenario (not visible to consumers/advisors).

CREATE TABLE public.scenario_conversation_notes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id  uuid NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  author_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name  text NOT NULL DEFAULT '',
  body         text NOT NULL CHECK (length(body) > 0 AND length(body) <= 10000),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX scenario_conversation_notes_scenario_idx
  ON public.scenario_conversation_notes(scenario_id, created_at DESC);

ALTER TABLE public.scenario_conversation_notes ENABLE ROW LEVEL SECURITY;

-- Helper: admin or assigned agent may view scenario conversation notes.
CREATE OR REPLACE FUNCTION public.can_view_scenario_conversation_notes(p_scenario uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (
      public.has_role(auth.uid(), 'agent'::app_role)
      AND EXISTS (
        SELECT 1
        FROM public.scenarios s
        WHERE s.id = p_scenario
          AND s.assigned_agent_id = auth.uid()
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.can_write_scenario_conversation_notes(p_scenario uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (
      public.has_role(auth.uid(), 'agent'::app_role)
      AND EXISTS (
        SELECT 1
        FROM public.scenarios s
        WHERE s.id = p_scenario
          AND s.assigned_agent_id = auth.uid()
      )
    );
$$;

CREATE POLICY "admin and assigned agents read scenario conversation notes"
  ON public.scenario_conversation_notes
  FOR SELECT TO authenticated
  USING (public.can_view_scenario_conversation_notes(scenario_id));

CREATE POLICY "admin and assigned agents insert scenario conversation notes"
  ON public.scenario_conversation_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND public.can_write_scenario_conversation_notes(scenario_id)
  );

CREATE POLICY "authors update own scenario conversation notes"
  ON public.scenario_conversation_notes
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Migrate legacy single-field agent_notes into first thread entry.
INSERT INTO public.scenario_conversation_notes (scenario_id, author_id, author_name, body, created_at, updated_at)
SELECT
  s.id,
  COALESCE(s.assigned_agent_id, s.created_by),
  COALESCE(p.full_name, 'Agent'),
  trim(s.agent_notes),
  COALESCE(s.claimed_at, s.created_at),
  COALESCE(s.claimed_at, s.created_at)
FROM public.scenarios s
LEFT JOIN public.profiles p ON p.id = COALESCE(s.assigned_agent_id, s.created_by)
WHERE s.agent_notes IS NOT NULL
  AND trim(s.agent_notes) <> ''
  AND COALESCE(s.assigned_agent_id, s.created_by) IS NOT NULL;

CREATE OR REPLACE FUNCTION public.list_scenario_conversation_notes(p_scenario uuid)
RETURNS TABLE (
  id uuid,
  scenario_id uuid,
  author_id uuid,
  author_name text,
  body text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT public.can_view_scenario_conversation_notes(p_scenario) THEN
    RAISE EXCEPTION 'Not authorized to view conversation notes for this scenario';
  END IF;

  RETURN QUERY
  SELECT n.id, n.scenario_id, n.author_id, n.author_name, n.body, n.created_at, n.updated_at
  FROM public.scenario_conversation_notes n
  WHERE n.scenario_id = p_scenario
  ORDER BY n.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_scenario_conversation_note(p_scenario uuid, p_body text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_name text;
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_body IS NULL OR trim(p_body) = '' THEN
    RAISE EXCEPTION 'Note body required';
  END IF;
  IF length(trim(p_body)) > 10000 THEN
    RAISE EXCEPTION 'Note too long';
  END IF;
  IF NOT public.can_write_scenario_conversation_notes(p_scenario) THEN
    RAISE EXCEPTION 'Not authorized to add notes for this scenario';
  END IF;

  SELECT COALESCE(NULLIF(trim(full_name), ''), 'Staff')
  INTO v_name
  FROM public.profiles
  WHERE id = v_uid;

  INSERT INTO public.scenario_conversation_notes (scenario_id, author_id, author_name, body)
  VALUES (p_scenario, v_uid, COALESCE(v_name, 'Staff'), trim(p_body))
  RETURNING id INTO v_id;

  INSERT INTO public.audit_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (v_uid, 'SCENARIO_CONVERSATION_NOTE_ADD', 'scenario', p_scenario::text,
          jsonb_build_object('note_id', v_id));

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_scenario_conversation_note(p_note uuid, p_body text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_author uuid;
  v_scenario uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_body IS NULL OR trim(p_body) = '' THEN
    RAISE EXCEPTION 'Note body required';
  END IF;
  IF length(trim(p_body)) > 10000 THEN
    RAISE EXCEPTION 'Note too long';
  END IF;

  SELECT author_id, scenario_id INTO v_author, v_scenario
  FROM public.scenario_conversation_notes
  WHERE id = p_note;

  IF v_author IS NULL THEN
    RAISE EXCEPTION 'Note not found';
  END IF;
  IF v_author <> v_uid THEN
    RAISE EXCEPTION 'You can only edit notes you authored';
  END IF;

  UPDATE public.scenario_conversation_notes
  SET body = trim(p_body), updated_at = now()
  WHERE id = p_note;

  INSERT INTO public.audit_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (v_uid, 'SCENARIO_CONVERSATION_NOTE_UPDATE', 'scenario', v_scenario::text,
          jsonb_build_object('note_id', p_note));
END;
$$;

GRANT SELECT, INSERT, UPDATE ON public.scenario_conversation_notes TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_scenario_conversation_notes(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_scenario_conversation_note(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_scenario_conversation_note(uuid, text) TO authenticated;
