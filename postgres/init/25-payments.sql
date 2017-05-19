SET ROLE kansa;

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
INSERT INTO stripe_keys (name, type, key) VALUES
('default','pk_test','pk_test_LoOP8RB3gIlLkSYIyM9G6skn'),
('default','pk_live','pk_live_vSEBxO9ddioYqCGvhVsog4pb'),
('worldcon77','pk_test','pk_test_k9X10O1qQoKXD3MHNQU8KvNw'),
('worldcon77','pk_live','pk_live_xZn2VzgwkIauumoxFI0W3IlF');
