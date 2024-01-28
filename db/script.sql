CREATE TABLE IF NOT EXISTS users
(
    id integer NOT NULL,
    username text NOT NULL,
    firstName text NOT NULL,
    lastName text NOT NULL,
    email text,
    phone text
);

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
owner to user_admin;

REVOKE ALL ON TABLE public.users FROM user_admin_select;
GRANT ALL ON TABLE public.users TO user_admin;
GRANT SELECT ON TABLE public.users FROM user_admin_select;
