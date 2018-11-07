SET ROLE events;

CREATE TABLE feature (
  feature_id SERIAL PRIMARY KEY,
  name text NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON feature TO events_editor;
ALTER TABLE feature ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_policy ON feature FOR SELECT USING (true);
CREATE POLICY insert_policy ON feature FOR INSERT WITH CHECK (can_edit_spaces());
CREATE POLICY update_policy ON feature FOR UPDATE WITH CHECK (can_edit_spaces());
CREATE POLICY delete_policy ON feature FOR DELETE USING (can_edit_spaces());

CREATE TABLE space (
  space_id SERIAL PRIMARY KEY,
  parent_id integer REFERENCES space,
  name text NOT NULL,
  description text,
  feature_ids integer[],
  size integer
);

GRANT SELECT, INSERT, UPDATE, DELETE ON space TO events_editor;
ALTER TABLE space ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_policy ON space FOR SELECT USING (true);
CREATE POLICY insert_policy ON space FOR INSERT WITH CHECK (can_edit_spaces());
CREATE POLICY update_policy ON space FOR UPDATE WITH CHECK (can_edit_spaces());
CREATE POLICY delete_policy ON space FOR DELETE USING (can_edit_spaces());

CREATE FUNCTION features(p space)
RETURNS SETOF feature AS $$
  SELECT * FROM events.feature f
  WHERE feature_id = ANY (p.feature_ids)
$$ LANGUAGE sql STABLE;
GRANT EXECUTE ON FUNCTION features TO events_editor;
