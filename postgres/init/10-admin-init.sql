CREATE SCHEMA AUTHORIZATION admin
    CREATE TABLE IF NOT EXISTS Admins (
        email text PRIMARY KEY,
        member_admin bool NOT NULL DEFAULT false,
        hugo_admin bool NOT NULL DEFAULT false,
        admin_admin bool NOT NULL DEFAULT false
    );


-- from server/node_modules/connect-pg-simple/table.sql
CREATE TABLE public.session (
    sid varchar NOT NULL COLLATE "default",
    sess json NOT NULL,
    expire timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE public.session
    ADD CONSTRAINT "session_pkey"
    PRIMARY KEY (sid)
    NOT DEFERRABLE INITIALLY IMMEDIATE;


CREATE ROLE api_access;
GRANT USAGE ON SCHEMA admin TO api_access;
GRANT SELECT ON TABLE admin.Admins TO api_access;
GRANT ALL PRIVILEGES ON TABLE public.session TO api_access;
