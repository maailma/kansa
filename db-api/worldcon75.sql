CREATE DATABASE worldcon75;

--CREATE ROLE $POSTGRES_USER WITH CREATEDB CREATEROLE PASSWORD '$POSTGRES_PASSWORD';
--GRANT ALL PRIVILEGES ON DATABASE worldcon75 TO $POSTGRES_USER;

\connect worldcon75

CREATE TYPE MembershipStatus AS ENUM ('NonMember','Supporter','KidInTow','Child','Youth','FirstWorldcon','Adult');

CREATE TABLE IF NOT EXISTS People (
    id SERIAL PRIMARY KEY,
    controller_id integer REFERENCES People,
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

CREATE TABLE IF NOT EXISTS PaperPublications (
    id SERIAL PRIMARY KEY,
    people_id integer REFERENCES People NOT NULL,
    name text,
    address text,
    country text
);

CREATE TABLE IF NOT EXISTS Admins (
    id SERIAL PRIMARY KEY,
    people_id integer REFERENCES People NOT NULL,
    super_admin bool NOT NULL DEFAULT false,
    member_admin bool NOT NULL DEFAULT false,
    hugo_admin bool NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS Transactions (
    id SERIAL PRIMARY KEY,
    "timestamp" timestamptz NOT NULL,
    client_info text NOT NULL,
    author_id integer REFERENCES People NOT NULL,
    target_id integer REFERENCES People NOT NULL,
    sum money,
    currency char(3),
    membership MembershipStatus,
    can_hugo_nominate bool,
    can_hugo_vote bool,
    can_site_select bool,
    action text NOT NULL,
    parameters jsonb NOT NULL,
    description text NOT NULL
);
