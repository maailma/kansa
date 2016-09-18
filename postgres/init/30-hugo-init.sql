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

CREATE TABLE Canon (
    id SERIAL PRIMARY KEY,
    category Category NOT NULL,
    nomination jsonb NOT NULL,
    UNIQUE (category, nomination)
);

CREATE TABLE Classification (
    category Category,
    nomination jsonb,
    canon_id integer REFERENCES Canon,
    PRIMARY KEY (category, nomination)
);

CREATE VIEW CurrentBallots AS SELECT
    DISTINCT ON (person_id, category)
    id AS ballot_id, category, nominations
    FROM Nominations
    ORDER BY person_id, category, time DESC;

CREATE VIEW CurrentNominations AS SELECT
    n.ballot_id, n.category, n.nomination, c.canon_id
    FROM (
        SELECT ballot_id, category, unnest(nominations) as nomination
        FROM CurrentBallots
    ) AS n
    NATURAL LEFT OUTER JOIN Classification c;


-- allow clients to listen to changes
CREATE FUNCTION canon_notify() RETURNS trigger as $$
BEGIN
    PERFORM pg_notify('canon', json_build_object(TG_TABLE_NAME, NEW)::text);
    RETURN null;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify
    AFTER INSERT OR UPDATE ON Canon
    FOR EACH ROW EXECUTE PROCEDURE canon_notify();

CREATE TRIGGER notify
    AFTER INSERT OR UPDATE ON Classification
    FOR EACH ROW EXECUTE PROCEDURE canon_notify();
