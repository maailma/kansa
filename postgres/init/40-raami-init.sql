\set raamiPwd `echo "$RAAMI_PG_PASSWORD"`

CREATE USER raami WITH PASSWORD :'raamiPwd' IN ROLE api_access;
CREATE SCHEMA AUTHORIZATION raami;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO raami;
GRANT USAGE ON SCHEMA kansa TO raami;
GRANT SELECT, REFERENCES ON ALL TABLES IN SCHEMA kansa TO raami;
SET ROLE raami;

CREATE TABLE IF NOT EXISTS Artist (
    id SERIAL PRIMARY KEY,
    person_id integer REFERENCES kansa.People NOT NULL,
    name text,
    continent text,
    url text,
    filename text,
    filedata text,
    category text,
    description text,
    transport text,
    auction integer,
    print integer,
    digital boolean,
    legal boolean,
    agent text,
    contact text,
    waitlist boolean,
    postage integer
    );

CREATE TABLE IF NOT EXISTS Works (
    id SERIAL PRIMARY KEY,
    artist_id integer REFERENCES Artist NOT NULL,
    title text,
    width decimal,
    height decimal,
    depth decimal,
    technique text,
    orientation text,
    graduation text,
    filename text,
    filedata text,
    price decimal,
    gallery text,
    year integer
    );

CREATE FUNCTION arists_notify() RETURNS trigger as $$
BEGIN
    PERFORM pg_notify('artist', row_to_json(NEW)::text);
    RETURN null;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION work_notify() RETURNS trigger as $$
BEGIN
    PERFORM pg_notify('work', row_to_json(NEW)::text);
    RETURN null;
END;
$$ LANGUAGE plpgsql;

-- CREATE TRIGGER notify
--     AFTER INSERT OR UPDATE ON Artist
--     FOR EACH ROW EXECUTE PROCEDURE arists_notify();

-- CREATE TRIGGER notify
--     AFTER INSERT OR UPDATE ON Works
--     FOR EACH ROW EXECUTE PROCEDURE work_notify();
