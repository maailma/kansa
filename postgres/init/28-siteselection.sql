SET ROLE kansa;

CREATE TABLE siteselection_votes (
    person_id integer NOT NULL UNIQUE REFERENCES People,
    time timestamptz NOT NULL DEFAULT now(),
    token text UNIQUE,
    voter_name text,
    voter_email text
);

CREATE VIEW tokens AS
  SELECT p.data->>'token' AS token,
         p.payment_email,
         coalesce(s.person_id, p.person_id) AS person_id,
         s.time AS used,
         s.voter_name,
         s.voter_email
    FROM payments p
         LEFT JOIN siteselection_votes s ON (p.data->>'token' = s.token)
   WHERE p.type='ss-token' AND p.status='succeeded';

CREATE VIEW token_lookup AS
  SELECT t.token, t.payment_email,
         t.used, t.voter_name, t.voter_email,
         p.member_number, legal_name, public_name(p), p.email
    FROM tokens t
         LEFT JOIN people p ON (p.id=t.person_id);
