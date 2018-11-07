SET ROLE events;

CREATE TYPE message_status AS ENUM ('draft', 'ready', 'sent', 'archived');
GRANT USAGE ON TYPE message_status TO events_editor;

CREATE TABLE message_history (
  draft_id SERIAL PRIMARY KEY,
  message_id SERIAL,
  time timestamptz DEFAULT now(),
  user_email text NOT NULL,
  status message_status NOT NULL DEFAULT 'draft',
  subject text,
  body text,
  recipient_filter jsonb
);
GRANT
  SELECT, INSERT (message_id, user_email, status, subject, body, recipient_filter)
  ON message_history TO events_editor;
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_policy ON message_history FOR SELECT USING (true);
CREATE POLICY insert_policy ON message_history FOR INSERT WITH CHECK (status != 'sent');

CREATE TRIGGER message_history_insert_trigger
  BEFORE INSERT ON message_history
  EXECUTE PROCEDURE insert_current_user_email();

CREATE FUNCTION message_subject(m integer)
RETURNS text AS $$
  SELECT subject FROM events.message_history
  WHERE message_id = m AND subject IS NOT NULL
  ORDER BY draft_id DESC LIMIT 1
$$ LANGUAGE sql STABLE;
GRANT EXECUTE ON FUNCTION message_subject TO events_editor;

CREATE FUNCTION message_body(m integer)
RETURNS text AS $$
  SELECT body FROM events.message_history
  WHERE message_id = m AND body IS NOT NULL
  ORDER BY draft_id DESC LIMIT 1
$$ LANGUAGE sql STABLE;
GRANT EXECUTE ON FUNCTION message_body TO events_editor;

CREATE FUNCTION message_recipient_filter(m integer)
RETURNS jsonb AS $$
  SELECT recipient_filter FROM events.message_history
  WHERE message_id = m AND recipient_filter IS NOT NULL
  ORDER BY draft_id DESC LIMIT 1
$$ LANGUAGE sql STABLE;
GRANT EXECUTE ON FUNCTION message_recipient_filter TO events_editor;

CREATE TYPE current_message AS (
  message_id integer,
  mod_time timestamptz,
  mod_user_email text,
  status message_status,
  subject text,
  body text,
  recipient_filter jsonb
);
GRANT USAGE ON TYPE current_message TO events_editor;

CREATE FUNCTION get_current_message(m integer)
RETURNS events.current_message AS $$
  SELECT DISTINCT ON (message_id)
    message_id,
    time AS mod_time,
    user_email AS mod_user_email,
    status,
    events.message_subject(m) AS subject,
    events.message_body(m) AS body,
    events.message_recipient_filter(m) AS recipient_filter
  FROM events.message_history
  WHERE message_id = m
  ORDER BY message_id, draft_id DESC
$$ LANGUAGE sql STABLE;
GRANT EXECUTE ON FUNCTION get_current_message TO events_editor;

CREATE FUNCTION get_current_messages()
RETURNS SETOF events.current_message AS $$
  SELECT DISTINCT ON (message_id)
    message_id,
    time AS mod_time,
    user_email AS mod_user_email,
    status,
    events.message_subject(message_id) AS subject,
    events.message_body(message_id) AS body,
    events.message_recipient_filter(message_id) AS recipient_filter
  FROM events.message_history
  ORDER BY message_id, draft_id DESC
$$ LANGUAGE sql STABLE;
GRANT EXECUTE ON FUNCTION get_current_messages TO events_editor;

CREATE TABLE sent_message (
  draft_id integer NOT NULL REFERENCES message_history,
  person_id integer NOT NULL REFERENCES kansa.people,
  PRIMARY KEY (draft_id, person_id),
  delivery_status text
);
GRANT SELECT ON sent_message TO events_editor;
