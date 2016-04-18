CREATE TYPE membershipStatus AS ENUM ('NonMember','Supporter','KidInTow','Child','Youth','FirstWorldcon','Adult');

CREATE TABLE People (
    id integer PRIMARY KEY,
    member_number integer NOT NULL,
    legal_name text NOT NULL,
    badge_name text,
    email text,
    city text,
    state text,
    country text,
    delegated_member_number integer,
    membership MembershipStatus NOT NULL,
    can_hugo_nominate bool NOT NULL DEFAULT false,
    can_hugo_vote bool NOT NULL DEFAULT false,
    can_site_select bool NOT NULL DEFAULT false
);

CREATE TABLE PaperPublications (
    id integer PRIMARY KEY,
    people_id integer REFERENCES People(id),
    name text,
    address text,
    country text
);

CREATE TABLE Admins (
    id integer PRIMARY KEY,
    people_id integer REFERENCES People NOT NULL,
    super_admin bool NOT NULL DEFAULT false,
    member_admin bool NOT NULL DEFAULT false,
    hugo_admin bool NOT NULL DEFAULT false
);

CREATE TABLE Transactions (
    id integer PRIMARY KEY,
    target_people_id integer REFERENCES People NOT NULL,
    author_people_id integer REFERENCES People NOT NULL,
    "timestamp" timestamptz NOT NULL,
    source text NOT NULL,
    sum money NOT NULL,
    currency char(3) NOT NULL DEFAULT 'EUR',
    membership MembershipStatus NOT NULL,
    can_hugo_nominate bool NOT NULL DEFAULT false,
    can_hugo_vote bool NOT NULL DEFAULT false,
    can_site_select bool NOT NULL DEFAULT false,
    action text NOT NULL,
    parameters jsonb NOT NULL,
    description text NOT NULL
);



