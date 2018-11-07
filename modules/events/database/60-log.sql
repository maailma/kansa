-- based on https://github.com/2ndQuadrant/audit-trigger/blob/2d02f929c20ea0862d48308efa411e3ffcdfc17f/audit.sql

SET ROLE events;

CREATE TYPE event_log_action AS ENUM ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE');

CREATE TABLE event_log (
  id BIGSERIAL PRIMARY KEY,
  event_id integer NOT NULL,
  user_email text,
  time timestamptz NOT NULL,
  action event_log_action NOT NULL,
  row_data jsonb,
  updated jsonb
);
REVOKE ALL ON event_log FROM public;
GRANT SELECT ON event_log TO events_editor;

COMMENT ON COLUMN event_log.time IS 'Transaction start timestamp';
COMMENT ON COLUMN event_log.row_data IS 'For INSERT the inserted row, for DELETE and UPDATE the old row, NULL for TRUNCATE';
COMMENT ON COLUMN event_log.updated IS 'New values changed by UPDATE, otherwise NULL';

CREATE INDEX logged_actions_action_idx ON event_log(action);

CREATE FUNCTION event_log_func()
RETURNS TRIGGER AS $$
DECLARE
  log_row events.event_log;
BEGIN
  log_row = ROW(
    nextval('events.event_log_id_seq'),  -- id
    NULL,                                -- event_id
    current_user_email(),                -- user_email
    current_timestamp,                   -- time
    TG_OP,                               -- action
    NULL, NULL                           -- row_data, updated
  );

  IF TG_TABLE_NAME = 'participant' THEN
    IF TG_OP = 'DELETE' THEN
      log_row.event_id = OLD.event_id;
    ELSE
      log_row.event_id = NEW.event_id;
    END IF;

    SELECT row_to_json(events.event)::jsonb INTO log_row.row_data
    FROM events.event e WHERE e.event_id = log_row.event_id;

    SELECT jsonb_build_object('participants', jsonb_agg(pp))
    INTO log_row.updated
    FROM (
      SELECT person_id, public, role, status
      FROM events.participant p WHERE p.event_id = log_row.event_id
    ) pp;
  ELSIF TG_OP = 'UPDATE' THEN
    log_row.event_id = NEW.event_id;
    log_row.row_data = row_to_json(OLD)::jsonb;

    SELECT jsonb_object_agg(n.key, n.value)
    INTO log_row.updated
    FROM json_each_text(row_to_json(NEW)) AS n
    JOIN jsonb_each_text(log_row.row_data) AS o ON (
      n.key = o.key AND n.value IS DISTINCT FROM o.value
    );
  ELSIF TG_OP = 'DELETE' THEN
    log_row.event_id = OLD.event_id;
    log_row.row_data = row_to_json(OLD)::jsonb;
  ELSIF TG_OP = 'INSERT' THEN
    log_row.event_id = NEW.event_id;
    log_row.row_data = row_to_json(NEW)::jsonb;
  END IF; -- else TG_OP = 'TRUNCATE'

  INSERT INTO events.event_log VALUES (log_row.*);
  RETURN NULL;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog;

CREATE TRIGGER event_log_trigger_row
  AFTER INSERT OR DELETE ON event
  FOR EACH ROW
  EXECUTE PROCEDURE event_log_func();

CREATE TRIGGER event_log_trigger_update
  AFTER UPDATE ON event
  FOR EACH ROW WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE PROCEDURE event_log_func();

CREATE TRIGGER event_log_trigger_truncate
  AFTER TRUNCATE ON event
  FOR EACH STATEMENT
  EXECUTE PROCEDURE event_log_func();

CREATE TRIGGER event_log_trigger_participant
  AFTER INSERT OR UPDATE OR DELETE ON participant
  FOR EACH ROW
  EXECUTE PROCEDURE event_log_func();
