\set raamiPwd `echo "$RAAMI_PG_PASSWORD"`

CREATE USER raami WITH PASSWORD :'raamiPwd' IN ROLE api_access;
CREATE SCHEMA AUTHORIZATION raami;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO raami;
GRANT USAGE ON SCHEMA kansa TO raami;
GRANT SELECT, REFERENCES ON ALL TABLES IN SCHEMA kansa TO raami;
SET ROLE raami;

CREATE TABLE IF NOT EXISTS Artist (
    -- id SERIAL PRIMARY KEY,
    people_id integer REFERENCES kansa.People PRIMARY KEY NOT NULL,
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
    people_id integer REFERENCES Artist NOT NULL,
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


