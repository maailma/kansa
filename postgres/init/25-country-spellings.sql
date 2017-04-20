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
