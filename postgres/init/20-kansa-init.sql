\set kansaPwd `echo "$KANSA_PG_PASSWORD"`

CREATE EXTENSION damm WITH SCHEMA public;

CREATE USER kansa WITH PASSWORD :'kansaPwd' IN ROLE api_access;
CREATE SCHEMA AUTHORIZATION kansa;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kansa;
SET ROLE kansa;

CREATE SEQUENCE member_number_seq;
CREATE TYPE MembershipStatus AS ENUM (
    'NonMember', 'Exhibitor', 'Supporter', 'KidInTow',
    'Child', 'Youth', 'FirstWorldcon', 'Adult'
);

CREATE TABLE IF NOT EXISTS People (
    id SERIAL PRIMARY KEY,
    last_modified timestamptz DEFAULT now(),
    membership MembershipStatus NOT NULL,
    member_number damm_code UNIQUE DEFAULT nextdamm('member_number_seq'),
    legal_name text NOT NULL,
    public_first_name text,
    public_last_name text,
    email text,
    city text,
    state text,
    country text,
    badge_text text,
    can_hugo_nominate bool NOT NULL DEFAULT false,
    can_hugo_vote bool NOT NULL DEFAULT false,
    can_site_select bool NOT NULL DEFAULT false,
    paper_pubs jsonb
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

CREATE TRIGGER set_last_modified
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

CREATE TRIGGER notify
    AFTER INSERT OR UPDATE ON People
    FOR EACH ROW EXECUTE PROCEDURE people_notify();


-- utility functions for SELECT people queries
CREATE FUNCTION preferred_name(p people) RETURNS varchar AS $$
DECLARE
    pn varchar;
BEGIN
    pn := concat_ws(' ', p.public_first_name, p.public_last_name);
    RETURN coalesce(nullif(trim(both from pn), ''), p.legal_name) AS name;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_badge_name(p people) RETURNS varchar AS $$
BEGIN
    RETURN coalesce(nullif(p.badge_name, ''), preferred_name(p)) AS name;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_badge_subtitle(p people) RETURNS varchar AS $$
BEGIN
    RETURN coalesce(p.badge_subtitle, p.country, '') AS name;
END;
$$ LANGUAGE plpgsql;
