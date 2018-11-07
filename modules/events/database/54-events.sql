SET ROLE events;

CREATE TYPE event_status AS ENUM ('idea', 'draft', 'ready', 'archived');
GRANT USAGE ON TYPE event_status TO public;

CREATE TABLE event_status_transition (
  status event_status NOT NULL,
  next event_status NOT NULL,
  PRIMARY KEY (status, next)
);
INSERT INTO event_status_transition (status, next) VALUES
('idea', 'draft'), ('idea', 'archived'),
('draft', 'ready'), ('draft', 'archived'),
('ready', 'draft'), ('ready', 'archived'),
('archived', 'draft');
GRANT SELECT ON event_status_transition TO events_editor;

CREATE TABLE event_type (
  type_id SERIAL PRIMARY KEY,
  name text
);
INSERT INTO event_type (name) VALUES ('panel'), ('presentation');
GRANT SELECT ON event_type TO public;

CREATE TABLE tag (
  tag_id SERIAL PRIMARY KEY,
  name text NOT NULL,
  parent_id integer REFERENCES tag,
  public bool NOT NULL DEFAULT true
);
GRANT SELECT, INSERT, UPDATE ON tag TO events_editor;

CREATE TABLE event (
  event_id SERIAL PRIMARY KEY,
  track_id integer NOT NULL REFERENCES track,
  status event_status NOT NULL,
  type_id integer REFERENCES event_type,
  name text NOT NULL,
  description text,
  presenter_notes text,
  public_after timestamptz,
  parent_id integer REFERENCES event,
  space_id integer REFERENCES space,
  required_feature_ids integer[],
  tag_ids integer[],
  min_size integer,
  max_size integer,
  start_time timestamptz,
  duration interval
);
GRANT SELECT ON event TO public;
GRANT INSERT, UPDATE ON event TO events_editor;
ALTER TABLE event ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_editor_policy ON event
  TO events_editor
  USING (true)
  WITH CHECK (can_edit_events(event.track_id));
-- See also events_participant_policy, defined after participant table

CREATE FUNCTION required_features(e event)
RETURNS SETOF feature AS $$
  SELECT * FROM events.feature f
  WHERE feature_id = ANY (e.required_feature_ids)
$$ LANGUAGE sql STABLE SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION required_features TO public;

CREATE FUNCTION tags(e event)
RETURNS SETOF tag AS $$
  SELECT * FROM events.tag t
  WHERE tag_id = ANY (e.tag_ids)
$$ LANGUAGE sql STABLE SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION tags TO public;

CREATE TABLE event_comment (
  comment_id SERIAL PRIMARY KEY,
  event_id integer NOT NULL REFERENCES event,
  user_email text NOT NULL,
  create_time timestamptz NOT NULL DEFAULT now(),
  edit_time timestamptz,
  comment text
);
GRANT
  SELECT,
  INSERT (event_id, user_email, comment),
  UPDATE (edit_time, comment)
ON event_comment TO events_editor;
ALTER TABLE event_comment ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_policy ON event_comment FOR SELECT USING (true);
CREATE POLICY insert_policy ON event_comment FOR INSERT WITH CHECK (true);
CREATE POLICY update_policy ON event_comment FOR UPDATE
  USING (user_email = current_user_email());

CREATE TRIGGER event_comment_insert_trigger
  BEFORE INSERT ON event_comment
  EXECUTE PROCEDURE insert_current_user_email();

CREATE FUNCTION event_comment_update_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  NEW.edit_time = current_timestamp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER event_comment_update_trigger
  BEFORE UPDATE ON event_comment
  EXECUTE PROCEDURE event_comment_update_trigger_func();
