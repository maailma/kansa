
DROP DATABASE IF EXISTS raami;
CREATE DATABASE raami;

\c raami;

CREATE TABLE artist (
	id SERIAL PRIMARY KEY,
	person_id INTEGER,
	continent boolean,
	url VARCHAR,
	filename VARCHAR,
	portfolio bytea,
	category VARCHAR,
	orientation boolean,
	description VARCHAR,
	method VARCHAR)
 ;

CREATE TABLE works(
	id SERIAL PRIMARY KEY,
	member_id REFERENCES artist(id),
	title VARCHAR,
	width decimal,
	height decimal,
	technique VARCHAR,
	graduation VARCHAR,
	filename VARCHAR,
	image bytea,
	price decimal
	);
