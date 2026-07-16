--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;


CREATE TABLE public.buildings (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    max_workers integer DEFAULT 0,
    max_health integer DEFAULT 100,
    production_recipe_id integer,
    type text,
    population_gain integer DEFAULT 0
);

CREATE SEQUENCE public.buildings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.buildings_id_seq OWNED BY public.buildings.id;


CREATE TABLE public.player_buildings (
    id integer NOT NULL,
    player_id integer,
    building_id integer,
    built_at timestamp without time zone DEFAULT now(),
    health integer DEFAULT 100,
    workers_assigned integer DEFAULT 0
);


CREATE SEQUENCE public.player_buildings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



ALTER SEQUENCE public.player_buildings_id_seq OWNED BY public.player_buildings.id;



CREATE TABLE public.player_resources (
    player_id integer NOT NULL,
    resource_type_id integer NOT NULL,
    amount integer DEFAULT 0 NOT NULL,
    CONSTRAINT amount_nonnegative CHECK ((amount >= 0))
);


CREATE TABLE public.player_tasks (
    id integer NOT NULL,
    player_id integer NOT NULL,
    recipe_id integer NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed boolean DEFAULT false CONSTRAINT player_tasks_finished_not_null NOT NULL,
    duration_seconds integer,
    player_building_id integer
);


ALTER TABLE public.player_tasks ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.player_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE public.players (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    population integer DEFAULT 0,
    workers integer DEFAULT 0,
    food_tick_rate_seconds integer DEFAULT 60,
    last_food_tick timestamp without time zone DEFAULT now(),
    name text
);


ALTER TABLE public.players ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.players_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE public.recipe_inputs (
    id integer NOT NULL,
    recipe_id integer NOT NULL,
    resource_type_id integer NOT NULL,
    amount integer NOT NULL,
    CONSTRAINT recipe_inputs_amount_check CHECK ((amount >= 0))
);


CREATE SEQUENCE public.recipe_inputs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipe_inputs_id_seq OWNED BY public.recipe_inputs.id;



CREATE TABLE public.recipes (
    id integer NOT NULL,
    name text NOT NULL,
    output_resource_id integer,
    output_amount integer,
    craft_time_seconds integer NOT NULL,
    recipe_type text DEFAULT 'craft'::text NOT NULL,
    output_building_id integer,
    CONSTRAINT craft_time_positive CHECK ((craft_time_seconds > 0)),
    CONSTRAINT output_amount_positive CHECK ((output_amount > 0))
);


ALTER TABLE public.recipes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.recipes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE public.resource_types (
    id integer CONSTRAINT resources_id_not_null NOT NULL,
    name text CONSTRAINT resources_resource_type_not_null NOT NULL,
    nutrition_value integer DEFAULT 0
);


CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resources_id_seq OWNED BY public.resource_types.id;



ALTER TABLE ONLY public.buildings ALTER COLUMN id SET DEFAULT nextval('public.buildings_id_seq'::regclass);



ALTER TABLE ONLY public.player_buildings ALTER COLUMN id SET DEFAULT nextval('public.player_buildings_id_seq'::regclass);



ALTER TABLE ONLY public.recipe_inputs ALTER COLUMN id SET DEFAULT nextval('public.recipe_inputs_id_seq'::regclass);



ALTER TABLE ONLY public.resource_types ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);



ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT buildings_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.resource_types
    ADD CONSTRAINT name UNIQUE (name);



ALTER TABLE ONLY public.player_buildings
    ADD CONSTRAINT player_buildings_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.player_resources
    ADD CONSTRAINT player_resources_pkey PRIMARY KEY (player_id, resource_type_id);



ALTER TABLE ONLY public.player_tasks
    ADD CONSTRAINT player_tasks_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.recipe_inputs
    ADD CONSTRAINT recipe_inputs_pkey PRIMARY KEY (id);




ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);




ALTER TABLE ONLY public.resource_types
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);




ALTER TABLE ONLY public.player_resources
    ADD CONSTRAINT unique_player_resource UNIQUE (player_id, resource_type_id);




ALTER TABLE ONLY public.players
    ADD CONSTRAINT unique_username UNIQUE (name);




CREATE INDEX idx_resource_nutrition ON public.resource_types USING btree (nutrition_value);




ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT fk_output_resource FOREIGN KEY (output_resource_id) REFERENCES public.resource_types(id) ON DELETE CASCADE;




ALTER TABLE ONLY public.player_tasks
    ADD CONSTRAINT fk_player_building FOREIGN KEY (player_building_id) REFERENCES public.player_buildings(id) ON DELETE CASCADE;




ALTER TABLE ONLY public.player_tasks
    ADD CONSTRAINT fk_player_tasks_player FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;




ALTER TABLE ONLY public.player_tasks
    ADD CONSTRAINT fk_player_tasks_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE RESTRICT;




ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT fk_production_recipe FOREIGN KEY (production_recipe_id) REFERENCES public.recipes(id);




ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT fk_recipes_output_resource FOREIGN KEY (output_resource_id) REFERENCES public.resource_types(id) ON DELETE RESTRICT;




ALTER TABLE ONLY public.player_buildings
    ADD CONSTRAINT player_buildings_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(id);




ALTER TABLE ONLY public.player_buildings
    ADD CONSTRAINT player_buildings_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;




ALTER TABLE ONLY public.player_resources
    ADD CONSTRAINT player_resources_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;




ALTER TABLE ONLY public.player_resources
    ADD CONSTRAINT player_resources_resource_type_id_fkey FOREIGN KEY (resource_type_id) REFERENCES public.resource_types(id);




ALTER TABLE ONLY public.player_tasks
    ADD CONSTRAINT player_tasks_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);




ALTER TABLE ONLY public.player_tasks
    ADD CONSTRAINT player_tasks_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id);




ALTER TABLE ONLY public.recipe_inputs
    ADD CONSTRAINT recipe_inputs_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;




ALTER TABLE ONLY public.recipe_inputs
    ADD CONSTRAINT recipe_inputs_resource_type_id_fkey FOREIGN KEY (resource_type_id) REFERENCES public.resource_types(id);




ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_output_building_id_fkey FOREIGN KEY (output_building_id) REFERENCES public.buildings(id);


--
-- PostgreSQL database dump complete
--