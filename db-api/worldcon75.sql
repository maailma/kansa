CREATE DATABASE worldcon75;

--CREATE ROLE $POSTGRES_USER WITH CREATEDB CREATEROLE PASSWORD '$POSTGRES_PASSWORD';
--GRANT ALL PRIVILEGES ON DATABASE worldcon75 TO $POSTGRES_USER;

\connect worldcon75

CREATE TYPE MembershipStatus AS ENUM ('NonMember','Supporter','KidInTow','Child','Youth','FirstWorldcon','Adult');

CREATE TABLE IF NOT EXISTS People (
    id SERIAL PRIMARY KEY,
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
    can_site_select bool NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS PaperPubs (
    id SERIAL PRIMARY KEY,
    people_id integer REFERENCES People NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    country text NOT NULL
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
    "timestamp" timestamptz NOT NULL,
    client_info text NOT NULL,
    author text,
    subject integer REFERENCES People,
    action text NOT NULL,
    parameters jsonb NOT NULL,
    description text NOT NULL
);
