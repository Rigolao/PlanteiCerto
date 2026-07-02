


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_role_self_escalation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF OLD.role != NEW.role AND public.get_my_role() != 'admin' THEN
    RAISE EXCEPTION 'Alteração de role não permitida';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_role_self_escalation"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "tree_id" integer,
    "lat" double precision NOT NULL,
    "lng" double precision NOT NULL,
    "observacao" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "nome" "text",
    "email" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'Perfis de usuário com controle de role (user/admin)';



COMMENT ON COLUMN "public"."profiles"."role" IS 'Role do usuário: user (padrão) ou admin';



CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "nome" "text" NOT NULL,
    "descricao" "text" DEFAULT ''::"text" NOT NULL,
    "centro_lat" double precision DEFAULT '-21.1767'::numeric NOT NULL,
    "centro_lng" double precision DEFAULT '-47.8208'::numeric NOT NULL,
    "centro_zoom" smallint DEFAULT 14 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trees" (
    "id" integer NOT NULL,
    "foto" "text",
    "nome_cientifico" "text" NOT NULL,
    "nome_popular" "text" NOT NULL,
    "origem" "text" NOT NULL,
    "decidua_perenifolia" "text",
    "epoca_floracao" "text",
    "epoca_frutificacao" "text",
    "altura_adulta_max_m" numeric,
    "porte_altura_classe" "text",
    "diametro_copa_adulto_max_m" numeric,
    "copa_classe" "text",
    "dap_adulto_max_cm" numeric,
    "altura_primeira_bifurcacao_m" "text",
    "forma_copa" "text",
    "faixa_serv_min_m_recomendada" numeric,
    "berco_area_min_m2_recomendada" numeric,
    "volume_solo_min_m3_recomendado" numeric,
    "compat_fiacao" "text",
    "potencial_dano_calcada_1a5" smallint,
    "tolerancia_sol_pleno" boolean,
    "tolerancia_meia_sombra" boolean,
    "tolerancia_sombra" boolean,
    "tolerancia_seca_1a5" smallint,
    "tolerancia_encharcamento_1a5" smallint,
    "tolerancia_poluicao_atmosferica_1a5" smallint,
    "tolerancia_compactacao_solo_1a5" smallint,
    "tolerancia_ventos_fortes_1a5" smallint,
    "potencial_sujeira_1a5" smallint,
    "presenca_espinhos" boolean,
    "presenca_subst_irritantes" boolean,
    "atracao_fauna_1a5" smallint,
    "tolerancia_poda_1a5" smallint,
    "potencial_sombra_1a5" smallint,
    "contribuicao_biodiversidade_1a5" smallint,
    "ativa" boolean DEFAULT true NOT NULL,
    CONSTRAINT "trees_atracao_fauna_1a5_check" CHECK ((("atracao_fauna_1a5" >= 1) AND ("atracao_fauna_1a5" <= 5))),
    CONSTRAINT "trees_compat_fiacao_check" CHECK (("compat_fiacao" = ANY (ARRAY['N'::"text", 'A'::"text", 'C'::"text"]))),
    CONSTRAINT "trees_contribuicao_biodiversidade_1a5_check" CHECK ((("contribuicao_biodiversidade_1a5" >= 1) AND ("contribuicao_biodiversidade_1a5" <= 5))),
    CONSTRAINT "trees_copa_classe_check" CHECK (("copa_classe" = ANY (ARRAY['Grande'::"text", 'Média'::"text", 'Pequena'::"text"]))),
    CONSTRAINT "trees_decidua_perenifolia_check" CHECK (("decidua_perenifolia" = ANY (ARRAY['Perenifólia'::"text", 'Decídua'::"text", 'Semidecídua'::"text"]))),
    CONSTRAINT "trees_origem_check" CHECK (("origem" = ANY (ARRAY['Nativa BR'::"text", 'Exótica'::"text"]))),
    CONSTRAINT "trees_porte_altura_classe_check" CHECK (("porte_altura_classe" = ANY (ARRAY['Grande'::"text", 'Médio'::"text", 'Pequeno'::"text"]))),
    CONSTRAINT "trees_potencial_dano_calcada_1a5_check" CHECK ((("potencial_dano_calcada_1a5" >= 1) AND ("potencial_dano_calcada_1a5" <= 5))),
    CONSTRAINT "trees_potencial_sombra_1a5_check" CHECK ((("potencial_sombra_1a5" >= 1) AND ("potencial_sombra_1a5" <= 5))),
    CONSTRAINT "trees_potencial_sujeira_1a5_check" CHECK ((("potencial_sujeira_1a5" >= 1) AND ("potencial_sujeira_1a5" <= 5))),
    CONSTRAINT "trees_tolerancia_compactacao_solo_1a5_check" CHECK ((("tolerancia_compactacao_solo_1a5" >= 1) AND ("tolerancia_compactacao_solo_1a5" <= 5))),
    CONSTRAINT "trees_tolerancia_encharcamento_1a5_check" CHECK ((("tolerancia_encharcamento_1a5" >= 1) AND ("tolerancia_encharcamento_1a5" <= 5))),
    CONSTRAINT "trees_tolerancia_poda_1a5_check" CHECK ((("tolerancia_poda_1a5" >= 1) AND ("tolerancia_poda_1a5" <= 5))),
    CONSTRAINT "trees_tolerancia_poluicao_atmosferica_1a5_check" CHECK ((("tolerancia_poluicao_atmosferica_1a5" >= 1) AND ("tolerancia_poluicao_atmosferica_1a5" <= 5))),
    CONSTRAINT "trees_tolerancia_seca_1a5_check" CHECK ((("tolerancia_seca_1a5" >= 1) AND ("tolerancia_seca_1a5" <= 5))),
    CONSTRAINT "trees_tolerancia_ventos_fortes_1a5_check" CHECK ((("tolerancia_ventos_fortes_1a5" >= 1) AND ("tolerancia_ventos_fortes_1a5" <= 5)))
);


ALTER TABLE "public"."trees" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."trees_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."trees_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trees_id_seq" OWNED BY "public"."trees"."id";



CREATE TABLE IF NOT EXISTS "public"."user_favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tree_id" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_favorites" OWNER TO "postgres";


ALTER TABLE ONLY "public"."trees" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trees_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."points"
    ADD CONSTRAINT "points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trees"
    ADD CONSTRAINT "trees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_id_tree_id_key" UNIQUE ("user_id", "tree_id");



CREATE INDEX "idx_points_project_id" ON "public"."points" USING "btree" ("project_id");



CREATE INDEX "idx_points_tree_id" ON "public"."points" USING "btree" ("tree_id");



CREATE INDEX "idx_projects_user_id" ON "public"."projects" USING "btree" ("user_id");



CREATE INDEX "idx_trees_nome_popular" ON "public"."trees" USING "btree" ("nome_popular");



CREATE INDEX "idx_trees_origem" ON "public"."trees" USING "btree" ("origem");



CREATE INDEX "idx_user_favorites_tree_id" ON "public"."user_favorites" USING "btree" ("tree_id");



CREATE INDEX "idx_user_favorites_user_id" ON "public"."user_favorites" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "enforce_role_protection" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_role_self_escalation"();



ALTER TABLE ONLY "public"."points"
    ADD CONSTRAINT "points_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."points"
    ADD CONSTRAINT "points_tree_id_fkey" FOREIGN KEY ("tree_id") REFERENCES "public"."trees"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_tree_id_fkey" FOREIGN KEY ("tree_id") REFERENCES "public"."trees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin delete trees" ON "public"."trees" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admin insert trees" ON "public"."trees" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admin update trees" ON "public"."trees" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can read all points" ON "public"."points" FOR SELECT USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Admins can read all profiles" ON "public"."profiles" FOR SELECT USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Admins can update any profile" ON "public"."profiles" FOR UPDATE USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Public read trees" ON "public"."trees" FOR SELECT USING ((("ativa" = true) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can add favorites" ON "public"."user_favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own projects" ON "public"."projects" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own projects" ON "public"."projects" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own project points" ON "public"."points" USING ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "points"."project_id") AND ("projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can read own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can read own project points" ON "public"."points" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "points"."project_id") AND ("projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can remove favorites" ON "public"."user_favorites" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own projects" ON "public"."projects" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own favorites" ON "public"."user_favorites" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own projects" ON "public"."projects" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."points" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_favorites" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_role_self_escalation"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_role_self_escalation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_role_self_escalation"() TO "service_role";


















GRANT ALL ON TABLE "public"."points" TO "anon";
GRANT ALL ON TABLE "public"."points" TO "authenticated";
GRANT ALL ON TABLE "public"."points" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."trees" TO "anon";
GRANT ALL ON TABLE "public"."trees" TO "authenticated";
GRANT ALL ON TABLE "public"."trees" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trees_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trees_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trees_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_favorites" TO "anon";
GRANT ALL ON TABLE "public"."user_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."user_favorites" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































