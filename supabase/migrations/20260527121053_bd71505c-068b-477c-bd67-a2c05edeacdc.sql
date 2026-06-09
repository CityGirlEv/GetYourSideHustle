CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_role public.app_role;
BEGIN
  -- Determine role from metadata if provided, else default to viewer
  IF NEW.raw_user_meta_data->>'requested_role' = 'agent' THEN
    v_role := 'agent';
  ELSIF NEW.raw_user_meta_data->>'requested_role' = 'qa' THEN
    v_role := 'qa';
  ELSE
    v_role := 'viewer';
  END IF;

  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role);

  INSERT INTO public.advisor_credits (advisor_id, balance)
  VALUES (NEW.id, 0);

  RETURN NEW;
END;
$function$;