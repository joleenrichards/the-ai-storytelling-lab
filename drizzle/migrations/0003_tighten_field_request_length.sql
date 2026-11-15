ALTER TABLE public.feature_suggestions ADD CONSTRAINT feature_suggestion_min_five CHECK (char_length(btrim(suggestion)) BETWEEN 5 AND 500) NOT VALID;
CREATE OR REPLACE FUNCTION public.guard_feature_suggestion() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(713852901);
 NEW.created_at := clock_timestamp();
 NEW.suggestion := btrim(NEW.suggestion);
 IF (SELECT count(*) FROM public.feature_suggestions WHERE created_at > clock_timestamp() - interval '1 minute') >= 60 THEN
  RAISE EXCEPTION 'The field log is busy. Please try again in a minute.' USING ERRCODE = 'P0001';
 END IF;
 IF EXISTS (SELECT 1 FROM public.feature_suggestions WHERE suggestion = NEW.suggestion AND created_at > clock_timestamp() - interval '15 seconds') THEN
  RAISE EXCEPTION 'This note was just logged. Please wait 15 seconds.' USING ERRCODE = 'P0001';
 END IF;
 RETURN NEW;
END;
$$;