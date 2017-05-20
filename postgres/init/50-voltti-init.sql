\set volttiPwd `echo "$VOLTTI_PG_PASSWORD"`

CREATE USER voltti WITH PASSWORD :'volttiPwd' IN ROLE api_access;
CREATE SCHEMA AUTHORIZATION voltti;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO voltti;
GRANT USAGE ON SCHEMA kansa TO voltti;
GRANT SELECT, REFERENCES ON ALL TABLES IN SCHEMA kansa TO voltti;
SET ROLE voltti;

CREATE TABLE IF NOT EXISTS Volunteer (
    -- id SERIAL PRIMARY KEY,
    people_id integer REFERENCES kansa.People PRIMARY KEY,
    birth text,
    phone text,
    experience text,
    JV text,
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
    notes text
    );

