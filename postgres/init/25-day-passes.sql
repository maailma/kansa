SET ROLE kansa;

CREATE TABLE daypass_amounts (
    status text PRIMARY KEY REFERENCES membership_types,
    day1 integer,
    day2 integer,
    day3 integer,
    day4 integer,
    day5 integer
);

CREATE TABLE daypasses (
    id SERIAL PRIMARY KEY,
    person_id integer REFERENCES people NOT NULL,
    status text NOT NULL REFERENCES membership_types,
    day1 bool DEFAULT false,
    day2 bool DEFAULT false,
    day3 bool DEFAULT false,
    day4 bool DEFAULT false,
    day5 bool DEFAULT false
);

CREATE TABLE badge_and_daypass_prints (
    person integer REFERENCES people NOT NULL,
    timestamp timestamptz NOT NULL DEFAULT now(),
    membership text NOT NULL REFERENCES membership_types,
    member_number integer,
    daypass integer REFERENCES daypasses
);

CREATE FUNCTION daypass_days(d daypasses) RETURNS bool[] AS $$
BEGIN
    IF d.status IS NOT NULL THEN
        RETURN ARRAY[d.day1, d.day2, d.day3, d.day4, d.day5];
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
