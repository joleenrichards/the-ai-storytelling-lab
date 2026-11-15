CREATE TABLE public.field_pulse_counts (
  reaction text PRIMARY KEY CHECK (reaction IN ('useful-workflow', 'sparked-hook')),
  total bigint NOT NULL DEFAULT 0 CHECK (total >= 0)
);
GRANT SELECT ON public.field_pulse_counts TO anon, authenticated;
GRANT ALL ON public.field_pulse_counts TO service_role;
ALTER TABLE public.field_pulse_counts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public aggregate pulse totals" ON public.field_pulse_counts FOR SELECT TO anon, authenticated USING (true);
CREATE FUNCTION public.add_field_pulse(reaction_key text) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE next_total bigint;
BEGIN
  IF reaction_key NOT IN ('useful-workflow', 'sparked-hook') OR reaction_key IS NULL THEN
    RAISE EXCEPTION 'Invalid reaction';
  END IF;
  INSERT INTO public.field_pulse_counts (reaction, total) VALUES (reaction_key, 1)
  ON CONFLICT (reaction) DO UPDATE SET total = public.field_pulse_counts.total + 1
  RETURNING total INTO next_total;
  RETURN next_total;
END;
$$;
REVOKE ALL ON FUNCTION public.add_field_pulse(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_field_pulse(text) TO anon, authenticated;
COMMENT ON TABLE public.field_pulse_counts IS 'Public aggregate totals only; browser duplicate-click prevention is local and not a server identity guarantee.';