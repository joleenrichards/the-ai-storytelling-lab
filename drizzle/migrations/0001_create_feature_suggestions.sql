CREATE TABLE public.feature_suggestions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 category text NOT NULL,
 active_tab text NOT NULL,
 suggestion text NOT NULL,
 CONSTRAINT feature_suggestion_category CHECK (category IN ('Hook & Angle','Shot List','UTM Builder','A/B Lab','General')),
 CONSTRAINT feature_suggestion_tab CHECK (active_tab IN ('hooks','shots','utm','ab')),
 CONSTRAINT feature_suggestion_length CHECK (char_length(btrim(suggestion)) BETWEEN 1 AND 500 AND char_length(suggestion) <= 500)
);
GRANT INSERT (category, active_tab, suggestion) ON public.feature_suggestions TO anon, authenticated;
GRANT ALL ON public.feature_suggestions TO service_role;
ALTER TABLE public.feature_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit private field requests" ON public.feature_suggestions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE INDEX feature_suggestions_created_at_idx ON public.feature_suggestions(created_at);
CREATE FUNCTION public.guard_feature_suggestion() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(713852901);
 NEW.created_at := clock_timestamp();
 NEW.suggestion := btrim(NEW.suggestion);
 IF (SELECT count(*) FROM public.feature_suggestions WHERE created_at > clock_timestamp() - interval '1 minute') >= 60 THEN
  RAISE EXCEPTION 'The field log is busy. Please try again in a minute.' USING ERRCODE = 'P0001';
 END IF;
 IF EXISTS (SELECT 1 FROM public.feature_suggestions WHERE suggestion = NEW.suggestion AND created_at > clock_timestamp() - interval '5 minutes') THEN
  RAISE EXCEPTION 'This note was recently logged. Please give it a few minutes.' USING ERRCODE = 'P0001';
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_feature_suggestion() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_feature_suggestion BEFORE INSERT ON public.feature_suggestions FOR EACH ROW EXECUTE FUNCTION public.guard_feature_suggestion();
COMMENT ON TABLE public.feature_suggestions IS 'Private inbox-free field requests. Export created_at, category, active_tab, suggestion as CSV via Lovable Cloud. No visitor identifiers collected.';