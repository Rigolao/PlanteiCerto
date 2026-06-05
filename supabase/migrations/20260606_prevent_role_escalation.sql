-- Bloqueia alteração de role por usuários não-admin no nível do banco.
-- Usa get_my_role() (SECURITY DEFINER, já existente) para evitar recursão no RLS.
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger AS $$
BEGIN
  IF OLD.role != NEW.role AND public.get_my_role() != 'admin' THEN
    RAISE EXCEPTION 'Alteração de role não permitida';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_role_protection ON public.profiles;

CREATE TRIGGER enforce_role_protection
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();
