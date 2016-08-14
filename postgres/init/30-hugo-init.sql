\set hugoPwd `echo "$HUGO_PG_PASSWORD"`

CREATE USER hugo WITH PASSWORD :'hugoPwd' IN ROLE api_access;
CREATE SCHEMA AUTHORIZATION hugo;
GRANT USAGE ON SCHEMA kansa TO hugo;
GRANT SELECT, REFERENCES ON ALL TABLES IN SCHEMA kansa TO hugo;
SET ROLE hugo;

CREATE TYPE Category AS ENUM ('Novel', 'Novella', 'Novelette', 'ShortStory', 'RelatedWork',
    'GraphicStory', 'DramaticLong', 'DramaticShort', 'EditorLong', 'EditorShort', 'ProArtist',
    'Semiprozine', 'Fanzine', 'Fancast', 'FanWriter', 'FanArtist', 'Campbell');

CREATE TABLE Nominations (
    id SERIAL PRIMARY KEY,
    time timestamptz DEFAULT now(),
    client_ip text NOT NULL,
    client_ua text,
    person_id integer REFERENCES kansa.People NOT NULL,
    category Category NOT NULL,
    nominations jsonb[] NOT NULL
);
