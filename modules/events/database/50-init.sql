CREATE ROLE events NOINHERIT;
CREATE ROLE events_editor NOINHERIT;
CREATE ROLE events_participant NOINHERIT;
GRANT events, events_editor, events_participant TO kansa;

GRANT USAGE ON SCHEMA kansa TO events, events_editor;
GRANT SELECT, REFERENCES ON kansa.people TO events;
GRANT SELECT ON kansa.people TO events_editor;

CREATE SCHEMA AUTHORIZATION events;
ALTER DEFAULT PRIVILEGES IN SCHEMA events
  REVOKE EXECUTE ON FUNCTIONS FROM events_editor, events_participant;
GRANT USAGE ON SCHEMA events TO events_editor, events_participant;
ALTER ROLE events_editor SET search_path TO events, public;
ALTER ROLE events_participant SET search_path TO events, public;

ALTER TABLE admin.admins ADD COLUMN events_admin bool NOT NULL DEFAULT false;

SET ROLE events;

CREATE FUNCTION current_user_email()
RETURNS text AS $$
  SELECT current_setting('user.email', true)
$$ LANGUAGE sql STABLE;
GRANT EXECUTE ON FUNCTION current_user_email TO public;

CREATE FUNCTION current_user_has_id(person_id integer)
RETURNS bool AS $$
  SELECT true FROM kansa.people
  WHERE id = person_id AND email IS NOT NULL AND email = current_user_email()
$$ LANGUAGE sql STABLE SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION current_user_has_id TO public;

CREATE FUNCTION insert_current_user_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_email = current_user_email();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE track (
  track_id SERIAL PRIMARY KEY,
  name text
);
INSERT INTO track VALUES (0, 'No track');
GRANT SELECT ON track TO public;

CREATE TABLE permission (
  user_email text PRIMARY KEY,
  admin bool NOT NULL DEFAULT false,
  read bool NOT NULL DEFAULT true,
  edit_spaces bool NOT NULL DEFAULT false,
  send_messages bool NOT NULL DEFAULT false
);
GRANT SELECT ON permission TO events_editor;

CREATE TABLE track_permission (
  track_id integer NOT NULL REFERENCES track,
  user_email text NOT NULL REFERENCES permission,
  PRIMARY KEY (track_id, user_email),
  admin bool NOT NULL DEFAULT false,
  edit_events bool NOT NULL DEFAULT true
);

CREATE FUNCTION can_edit_spaces()
RETURNS bool AS $$
  SELECT edit_spaces FROM events.permission
  WHERE user_email = current_user_email()
$$ LANGUAGE sql STABLE;
GRANT EXECUTE ON FUNCTION can_edit_spaces TO events_editor;

CREATE FUNCTION can_edit_events(track_id integer)
RETURNS bool AS $$
  SELECT edit_events FROM events.track_permission p
  WHERE p.track_id = track_id AND p.user_email = current_user_email()
$$ LANGUAGE sql STABLE;
GRANT EXECUTE ON FUNCTION can_edit_events TO events_editor;

CREATE FUNCTION can_edit_track_permissions(r track_permission)
RETURNS bool AS $$
  SELECT p.admin FROM events.track_permission p
  WHERE p.track_id = r.track_id AND
    p.user_email != r.user_email AND
    p.user_email = current_user_email()
$$ LANGUAGE sql STABLE;
GRANT EXECUTE ON FUNCTION can_edit_track_permissions TO events_editor;

GRANT SELECT, INSERT, UPDATE (admin, edit_events), DELETE ON track_permission TO events_editor;
ALTER TABLE track_permission ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_policy ON track_permission FOR SELECT USING (true);
CREATE POLICY insert_policy ON track_permission FOR INSERT
  WITH CHECK (can_edit_track_permissions(track_permission));
CREATE POLICY update_policy ON track_permission FOR UPDATE
  WITH CHECK (can_edit_track_permissions(track_permission));
CREATE POLICY delete_policy ON track_permission FOR DELETE
  USING (can_edit_track_permissions(track_permission));
