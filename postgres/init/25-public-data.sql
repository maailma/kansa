CREATE EXTENSION tablefunc WITH SCHEMA public;

SET ROLE kansa;

CREATE TABLE IF NOT EXISTS countries (
    entry text PRIMARY KEY,
    country text NOT NULL
);

INSERT INTO countries (entry, country) VALUES
('Czech Republic','Czechia'),
('Deutschland','Germany'),
('England','United Kingdom'),
('Finlande','Finland'),
('Gb','United Kingdom'),
('Jersey','United Kingdom'),
('Luxemburg','Luxembourg'),
('Nederland','Netherlands'),
('Northern Ireland','United Kingdom'),
('Scotland','United Kingdom'),
('Suomi','Finland'),
('Sverige','Sweden'),
('Swedem','Sweden'),
('The Netherlands','Netherlands'),
('Trinidad And Tobago','Trinidad & Tobago'),
('Uk','United Kingdom'),
('United Kingdon','United Kingdom'),
('United State Of America','USA'),
('United States','USA'),
('United States Of America','USA'),
('Us','USA'),
('Usa','USA'),
('U.S.A.','USA'),
('Usa / Spain','USA'),
('Use','USA'),
('Wales','United Kingdom'),
('中华人民共和国','China'),
('','-');

CREATE FUNCTION country(c text) RETURNS varchar AS $$
DECLARE
    cn text;
    ct text;
BEGIN
    cn := coalesce(initcap(trim(c)), '');
    SELECT country INTO ct FROM countries WHERE entry = cn;
    RETURN coalesce(ct, cn);
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION public_name(p people) RETURNS varchar AS $$
BEGIN
    RETURN nullif(trim(both from concat_ws(' ', p.public_first_name, p.public_last_name)), '');
END;
$$ LANGUAGE plpgsql;

CREATE VIEW country_stats AS SELECT * FROM crosstab(
   'SELECT coalesce(country(country),''=''),
           coalesce(membership::text,''=''),
           count(*)
      FROM People WHERE membership != ''NonMember''
  GROUP BY CUBE(country(country), membership)',
  $$VALUES ('Adult'), ('FirstWorldcon'), ('Youth'), ('Child'), ('KidInTow'), ('Exhibitor'), ('Supporter'), ('=') $$
) AS ct (
  country text,
  "Adult" int, "FirstWorldcon" int, "Youth" int, "Child" int, "KidInTow" int, "Exhibitor" int, "Supporter" int,
  "=" int
);

CREATE VIEW daypass_stats AS SELECT * FROM crosstab(
     'SELECT status, ''Wed'' AS day, count(*)
        FROM daypasses WHERE day1=true
    GROUP BY status
  UNION
      SELECT status, ''Thu'' AS day, count(*)
        FROM daypasses WHERE day2=true
    GROUP BY status
  UNION
      SELECT status, ''Fri'' AS day, count(*)
        FROM daypasses WHERE day3=true
    GROUP BY status
  UNION
      SELECT status, ''Sat'' AS day, count(*)
        FROM daypasses WHERE day4=true
    GROUP BY status
  UNION
      SELECT status, ''Sun'' AS day, count(*)
        FROM daypasses WHERE day5=true
    GROUP BY status
  ORDER BY status DESC',
  $$VALUES ('Wed'), ('Thu'), ('Fri'), ('Sat'), ('Sun') $$
) AS ct (
  status text,
  "Wed" int, "Thu" int, "Fri" int, "Sat" int, "Sun" int
);

CREATE VIEW public_members AS
     SELECT country(country), membership,
            public_last_name AS last_name,
            public_first_name AS first_name
       FROM people
      WHERE membership != 'NonMember' AND
            (public_first_name != '' OR public_last_name != '')
   ORDER BY last_name, first_name, country;
