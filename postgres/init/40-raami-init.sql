\set raamiPwd `echo "$RAAMI_PG_PASSWORD"`

CREATE USER raami WITH PASSWORD :'raamiPwd' IN ROLE api_access;
CREATE SCHEMA AUTHORIZATION raami;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO raami;
SET ROLE raami;

CREATE TABLE if NOT EXISTS Artist (
    id SERIAL PRIMARY KEY,
    member_id REFERENCES People(id),
    continent boolean,
    url text,
    filename text,
    portfolio bytea,
    category text,
    orientation boolean,
    description text,
    trasnport text)
 ;

CREATE TABLE if NOT EXISTS Works(
    id SERIAL PRIMARY KEY,
    artist_id REFERENCES artist(id),
    title text,
    width decimal,
    height decimal,
    technique text,
    graduation text,
    filename text,
    image bytea,
    price decimal
    );

BEGIN
    PERFORM pg_notify('people', row_to_json(NEW)::text);
    RETURN null;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify
    AFTER INSERT OR UPDATE ON People
    FOR EACH ROW EXECUTE PROCEDURE people_notify();