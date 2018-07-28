SET ROLE kansa;

CREATE TYPE payment_field_type AS ENUM ('boolean', 'number', 'string', 'object');

CREATE TABLE payment_fields (
  key text PRIMARY KEY,
  generated boolean,
  label text NOT NULL,
  required boolean,
  type payment_field_type DEFAULT 'string'
);

CREATE TABLE payment_categories (
  key text PRIMARY KEY,
  label text NOT NULL,
  account text,
  allow_create_account boolean,
  custom_email boolean,
  listed boolean,
  description text,
  fields text[]
);

CREATE TABLE payment_types (
  key text PRIMARY KEY,
  category text REFERENCES payment_categories,
  amount integer,
  label text NOT NULL,
  description text,
  sort_index integer
);

CREATE VIEW payment_fields_by_category AS
  SELECT category AS key,
    jsonb_agg(jsonb_strip_nulls(field)) AS fields
  FROM (
    SELECT c.category,
      jsonb_build_object(
        'key', f.key, 'generated', f.generated, 'label', f.label,
        'required', f.required, 'type', f.type
      ) AS field
    FROM (
      SELECT key AS category, unnest(fields) AS key
      FROM payment_categories
    ) AS c
    LEFT JOIN payment_fields f USING (key)
  ) AS t
  GROUP BY (category);

CREATE VIEW payment_types_by_category AS
  SELECT category AS key,
    jsonb_agg(jsonb_strip_nulls(type)) AS types
  FROM (
    SELECT category,
      jsonb_build_object(
        'key', key, 'amount', amount, 'label', label,
        'description', description
      ) AS type
    FROM payment_types
    ORDER BY sort_index
  ) AS t
  GROUP BY (category);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    created timestamptz NOT NULL DEFAULT now(),
    updated timestamptz,
    payment_email text,
    status text,
    stripe_charge_id text,
    stripe_receipt text,
    stripe_token text,
    error text,
    amount integer NOT NULL,
    currency text NOT NULL,
    person_id integer REFERENCES People,
    person_name text,
    category text NOT NULL,
    type text,
    data jsonb,
    invoice text,
    comments text
);

CREATE TYPE StripeKeyType AS ENUM ('pk_live','pk_test');
CREATE TABLE stripe_keys (
    name text NOT NULL,
    type StripeKeyType NOT NULL,
    key text NOT NULL
);
