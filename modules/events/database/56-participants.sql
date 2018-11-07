SET ROLE events;

CREATE TABLE participant_role (
  role_id SERIAL PRIMARY KEY,
  name text
);
INSERT INTO participant_role (name) VALUES ('moderator'), ('participant'), ('presenter');
GRANT SELECT ON participant_role TO public;

CREATE TABLE participant_status (
  status_id SERIAL PRIMARY KEY,
  name text
);
INSERT INTO participant_status (name) VALUES ('idea'), ('draft'), ('confirmed'), ('declined');
GRANT SELECT ON participant_status TO public;

CREATE TABLE participant (
  event_id integer NOT NULL REFERENCES event,
  person_id integer NOT NULL REFERENCES kansa.people,
  PRIMARY KEY (event_id, person_id),
  public bool NOT NULL DEFAULT true,
  role_id integer REFERENCES participant_role,
  status_id integer NOT NULL REFERENCES participant_status
);

CREATE FUNCTION can_edit_participant(p participant)
RETURNS bool AS $$
  SELECT can_edit_events(e.track_id)
  FROM events.event e WHERE e.event_id = p.event_id
$$ LANGUAGE sql STABLE;
GRANT EXECUTE ON FUNCTION can_edit_participant TO events_editor;

GRANT SELECT ON participant TO public;
GRANT INSERT, UPDATE, DELETE ON participant TO events_editor;
ALTER TABLE participant ENABLE ROW LEVEL SECURITY;
CREATE POLICY editor_select_policy ON participant FOR SELECT
  TO events_editor
  USING (true);
CREATE POLICY editor_insert_policy ON participant FOR INSERT
  TO events_editor
  WITH CHECK (can_edit_participant(participant));
CREATE POLICY editor_update_policy ON participant FOR UPDATE
  TO events_editor
  WITH CHECK (can_edit_participant(participant));
CREATE POLICY editor_delete_policy ON participant FOR DELETE
  TO events_editor
  USING (can_edit_participant(participant));
CREATE POLICY participant_select_policy ON participant FOR SELECT
  TO events_participant
  USING (event_id IN (
    SELECT event_id FROM participant
    WHERE current_user_has_id(person_id)
  ));

-- note: policy on "event" table
CREATE POLICY participant_select_policy ON event FOR SELECT
  TO events_participant
  USING (event_id IN (
    SELECT event_id FROM participant
    WHERE current_user_has_id(person_id)
  ));

CREATE TABLE availability (
  person_id integer NOT NULL REFERENCES kansa.people,
  date date NOT NULL,
  start_time timestamptz,
  end_time timestamptz,
  PRIMARY KEY (person_id, date, start_time)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON availability TO public;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY editor_select_policy ON availability
  FOR SELECT TO events_editor USING (true);
CREATE POLICY public_policy ON availability
  USING (current_user_has_id(person_id))
  WITH CHECK (current_user_has_id(person_id));

CREATE TABLE preference (
  event_id integer NOT NULL REFERENCES event,
  person_id integer NOT NULL REFERENCES kansa.people,
  PRIMARY KEY (event_id, person_id),
  attend integer,
  participate integer,
  organise integer,
  comment text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON preference TO public;
ALTER TABLE preference ENABLE ROW LEVEL SECURITY;
CREATE POLICY editor_select_policy ON preference
  FOR SELECT TO events_editor USING (true);
CREATE POLICY public_policy ON preference
  USING (current_user_has_id(person_id))
  WITH CHECK (current_user_has_id(person_id));
