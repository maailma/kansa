CREATE DATABASE worldcon75;

--CREATE ROLE $POSTGRES_USER WITH CREATEDB CREATEROLE PASSWORD '$POSTGRES_PASSWORD';
--GRANT ALL PRIVILEGES ON DATABASE worldcon75 TO $POSTGRES_USER;

\connect worldcon75

CREATE TYPE MembershipStatus AS ENUM ('NonMember','Supporter','KidInTow','Child','Youth','FirstWorldcon','Adult');

CREATE TABLE IF NOT EXISTS People (
    id SERIAL PRIMARY KEY,
    last_modified timestamptz DEFAULT now(),
    member_number integer,
    legal_name text NOT NULL,
    public_first_name text,
    public_last_name text,
    email text,
    city text,
    state text,
    country text,
    badge_text text,
    membership MembershipStatus NOT NULL,
    can_hugo_nominate bool NOT NULL DEFAULT false,
    can_hugo_vote bool NOT NULL DEFAULT false,
    can_site_select bool NOT NULL DEFAULT false,
    paper_pubs jsonb
);

CREATE TABLE IF NOT EXISTS Admins (
    email text PRIMARY KEY,
    member_admin bool NOT NULL DEFAULT false,
    admin_admin bool NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS Keys (
    email text PRIMARY KEY,
    key text NOT NULL
);

CREATE TABLE IF NOT EXISTS Log (
    id SERIAL PRIMARY KEY,
    "timestamp" timestamptz NOT NULL DEFAULT now(),
    client_ip text NOT NULL,
    client_ua text,
    author text,
    subject integer REFERENCES People,
    action text NOT NULL,
    parameters jsonb NOT NULL,
    description text NOT NULL
);


-- keep People.last_modified up to date
CREATE FUNCTION set_last_modified() RETURNS trigger AS $$
BEGIN
    IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
        NEW.last_modified = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_last_modified_people
    BEFORE UPDATE ON People
    FOR EACH ROW
    EXECUTE PROCEDURE set_last_modified();


-- allow clients to listen to changes
CREATE FUNCTION people_notify() RETURNS trigger as $$
BEGIN
    PERFORM pg_notify('people', row_to_json(NEW)::text);
    RETURN null;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER people_notify
    AFTER INSERT OR UPDATE ON People
    FOR EACH ROW EXECUTE PROCEDURE people_notify();


-- from node_modules/connect-pg-simple/table.sql
CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "session"
    ADD CONSTRAINT "session_pkey"
    PRIMARY KEY ("sid")
    NOT DEFERRABLE INITIALLY IMMEDIATE;
