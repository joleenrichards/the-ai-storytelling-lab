REVOKE ALL ON TABLE public.feature_suggestions FROM anon, authenticated;
GRANT INSERT (category, active_tab, suggestion) ON public.feature_suggestions TO anon, authenticated;
GRANT ALL ON TABLE public.feature_suggestions TO service_role;