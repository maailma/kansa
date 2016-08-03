CREATE SCHEMA AUTHORIZATION admin
    CREATE TABLE IF NOT EXISTS Admins (
        email text PRIMARY KEY,
        member_admin bool NOT NULL DEFAULT false,
        admin_admin bool NOT NULL DEFAULT false
    );


-- from server/node_modules/connect-pg-simple/table.sql
CREATE TABLE public."session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE public."session"
    ADD CONSTRAINT "session_pkey"
    PRIMARY KEY ("sid")
    NOT DEFERRABLE INITIALLY IMMEDIATE;


\set kansaPwd `echo "$KANSA_PG_PASSWORD"`

CREATE USER kansa WITH PASSWORD :'kansaPwd';
CREATE SCHEMA AUTHORIZATION kansa;
GRANT USAGE ON SCHEMA admin, public TO kansa;
GRANT SELECT ON TABLE admin.Admins TO kansa;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kansa;
