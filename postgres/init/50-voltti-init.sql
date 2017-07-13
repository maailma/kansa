\set volttiPwd `echo "$VOLTTI_PG_PASSWORD"`

CREATE USER voltti WITH PASSWORD :'volttiPwd' IN ROLE api_access;
CREATE SCHEMA AUTHORIZATION voltti;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO voltti;
GRANT USAGE ON SCHEMA kansa TO voltti;
GRANT SELECT, REFERENCES ON ALL TABLES IN SCHEMA kansa TO voltti;
SET ROLE voltti;

-- Tuesday August 8 (MIMO only)
-- Wednesday August 9
-- Thursday August 10
-- Friday August 11
-- Saturday August 12
-- Sunday August 13
-- Monday August 14 (MIMO only)

-- day_in, day_1, day_2, day_3, day_4, day_5, day_out

CREATE TABLE Volunteers (
    -- id SERIAL PRIMARY KEY,
    people_id integer REFERENCES kansa.People PRIMARY KEY,
    birth text,
    phone text,
    experience text,
    jv text,
    hygiene text,
    firstaid text,
    languages text,
    tshirt text,
    allergies text,
    hugo text,
    ex_mimo text,
    ex_con text,
    reg text,
    outreach text,
    program text,
    helpdesk text,
    logistics text,
    turva text,
    ops text,
    site text,
    members text,
    design text,
    events text,
    notes text,
    hours integer,
    day_in boolean,
    day_1 boolean,
    day_2 boolean,
    day_3 boolean,
    day_4 boolean,
    day_5 boolean,
    day_out boolean,
    allocated text,
    manager_notes text
);
