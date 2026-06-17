--
-- PostgreSQL database dump
--

-- \restrict GwYCn5Z5ps9OveRdhmadIBWuDJYpzn3FiUt7UX8mlqjORLTGuDDYEH6u619BaFV

-- Dumped from database version 8.0.2
-- Dumped by pg_dump version 14.23 (Ubuntu 14.23-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET escape_string_warning = off;
SET row_security = off;

--
-- Name: catalog_history; Type: SCHEMA; Schema: -; Owner: rdsdb
--

DROP SCHEMA IF EXISTS catalog_history CASCADE;
CREATE SCHEMA catalog_history;


-- ALTER SCHEMA catalog_history OWNER TO rdsdb;

--
-- Name: SCHEMA catalog_history; Type: COMMENT; Schema: -; Owner: rdsdb
--

COMMENT ON SCHEMA catalog_history IS 'RedCat journal schema';


--
-- Name: point_dev_test; Type: SCHEMA; Schema: -; Owner: master
--

DROP SCHEMA IF EXISTS point_dev_test CASCADE;
CREATE SCHEMA point_dev_test;


-- ALTER SCHEMA point_dev_test OWNER TO master;

--
-- Name: point_performance; Type: SCHEMA; Schema: -; Owner: master
--

DROP SCHEMA IF EXISTS point_performance CASCADE;
CREATE SCHEMA point_performance;


-- ALTER SCHEMA point_performance OWNER TO master;

--
-- Name: CAST (abstime AS date); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (abstime AS date) WITH FUNCTION pg_catalog.date(abstime) AS ASSIGNMENT;


--
-- Name: CAST (abstime AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (abstime AS integer) WITHOUT FUNCTION;


--
-- Name: CAST (abstime AS time without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (abstime AS time without time zone) WITH FUNCTION pg_catalog."time"(abstime) AS ASSIGNMENT;


--
-- Name: CAST (abstime AS timestamp without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (abstime AS timestamp without time zone) WITH FUNCTION pg_catalog."timestamp"(abstime) AS IMPLICIT;


--
-- Name: CAST (abstime AS timestamp with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (abstime AS timestamp with time zone) WITH FUNCTION pg_catalog.timestamptz(abstime) AS IMPLICIT;


--
-- Name: CAST (bit AS bit); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bit AS bit) WITH FUNCTION pg_catalog."bit"(bit, integer, boolean) AS IMPLICIT;


--
-- Name: CAST (bit AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bit AS integer) WITH FUNCTION pg_catalog.int4(bit);


--
-- Name: CAST (bit AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bit AS bigint) WITH FUNCTION pg_catalog.int8(bit);


--
-- Name: CAST (bit AS bit varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bit AS bit varying) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (boolean AS smallint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (boolean AS smallint) WITH FUNCTION pg_catalog.int2(boolean) AS ASSIGNMENT;


--
-- Name: CAST (boolean AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (boolean AS integer) WITH FUNCTION pg_catalog.int4(boolean) AS ASSIGNMENT;


--
-- Name: CAST (boolean AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (boolean AS bigint) WITH FUNCTION pg_catalog.int8(boolean) AS ASSIGNMENT;


--
-- Name: CAST (boolean AS super); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (boolean AS super) WITH FUNCTION pg_catalog.bool_partiql(boolean) AS ASSIGNMENT;


--
-- Name: CAST (box AS circle); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (box AS circle) WITH FUNCTION pg_catalog.circle(box);


--
-- Name: CAST (box AS lseg); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (box AS lseg) WITH FUNCTION pg_catalog.lseg(box);


--
-- Name: CAST (box AS point); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (box AS point) WITH FUNCTION pg_catalog.point(box);


--
-- Name: CAST (box AS polygon); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (box AS polygon) WITH FUNCTION pg_catalog.polygon(box) AS ASSIGNMENT;


--
-- Name: CAST (character AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS character) WITH FUNCTION pg_catalog.bpchar(character, integer, boolean) AS IMPLICIT;


--
-- Name: CAST (character AS "char"); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS "char") WITH FUNCTION pg_catalog."char"(text) AS ASSIGNMENT;


--
-- Name: CAST (character AS date); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS date) WITH FUNCTION pg_catalog.date(character);


--
-- Name: CAST (character AS real); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS real) WITH FUNCTION pg_catalog.float4(character);


--
-- Name: CAST (character AS double precision); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS double precision) WITH FUNCTION pg_catalog.float8(character);


--
-- Name: CAST (character AS smallint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS smallint) WITH FUNCTION pg_catalog.int2(character);


--
-- Name: CAST (character AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS integer) WITH FUNCTION pg_catalog.int4(character);


--
-- Name: CAST (character AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS bigint) WITH FUNCTION pg_catalog.int8(character);


--
-- Name: CAST (character AS interval); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS interval) WITH FUNCTION pg_catalog.bpchar(character);


--
-- Name: CAST (character AS intervald2s); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS intervald2s) WITH FUNCTION pg_catalog.intervald2s(character, integer);


--
-- Name: CAST (character AS intervaly2m); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS intervaly2m) WITH FUNCTION pg_catalog.intervaly2m(character, integer);


--
-- Name: CAST (character AS macaddr); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS macaddr) WITH FUNCTION pg_catalog.macaddr(text);


--
-- Name: CAST (character AS name); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS name) WITH FUNCTION pg_catalog.name(character) AS IMPLICIT;


--
-- Name: CAST (character AS numeric); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS numeric) WITH FUNCTION pg_catalog."numeric"(character);


--
-- Name: CAST (character AS oid); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS oid) WITH FUNCTION pg_catalog.oid(text);


--
-- Name: CAST (character AS super); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS super) WITH FUNCTION pg_catalog.char_partiql(character) AS ASSIGNMENT;


--
-- Name: CAST (character AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS text) WITH FUNCTION pg_catalog.text(character) AS IMPLICIT;


--
-- Name: CAST (character AS time without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS time without time zone) WITH FUNCTION pg_catalog.bpchar_time(character);


--
-- Name: CAST (character AS timestamp without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS timestamp without time zone) WITH FUNCTION pg_catalog."timestamp"(character);


--
-- Name: CAST (character AS timestamp with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS timestamp with time zone) WITH FUNCTION pg_catalog.timestamptz(character);


--
-- Name: CAST (character AS time with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS time with time zone) WITH FUNCTION pg_catalog.bpchar_timetz(character);


--
-- Name: CAST (character AS binary varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS binary varying) WITH FUNCTION pg_catalog.bpchar_varbyte(character);


--
-- Name: CAST (character AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character AS character varying) WITH FUNCTION pg_catalog.text(character) AS IMPLICIT;


--
-- Name: CAST (bytea AS binary varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bytea AS binary varying) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST ("char" AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST ("char" AS character) WITH FUNCTION pg_catalog.bpchar("char") AS ASSIGNMENT;


--
-- Name: CAST ("char" AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST ("char" AS integer) WITH FUNCTION pg_catalog.int4("char");


--
-- Name: CAST ("char" AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST ("char" AS text) WITH FUNCTION pg_catalog.text("char") AS IMPLICIT;


--
-- Name: CAST ("char" AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST ("char" AS character varying) WITH FUNCTION pg_catalog.text("char") AS ASSIGNMENT;


--
-- Name: CAST (cidr AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cidr AS character) WITH FUNCTION pg_catalog.text(inet);


--
-- Name: CAST (cidr AS inet); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cidr AS inet) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (cidr AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cidr AS text) WITH FUNCTION pg_catalog.text(inet);


--
-- Name: CAST (cidr AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cidr AS character varying) WITH FUNCTION pg_catalog.text(inet);


--
-- Name: CAST (circle AS box); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (circle AS box) WITH FUNCTION pg_catalog.box(circle);


--
-- Name: CAST (circle AS point); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (circle AS point) WITH FUNCTION pg_catalog.point(circle);


--
-- Name: CAST (circle AS polygon); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (circle AS polygon) WITH FUNCTION pg_catalog.polygon(circle);


--
-- Name: CAST (cstring AS boolean); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS boolean) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS character) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS date); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS date) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS real); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS real) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS double precision); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS double precision) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS smallint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS smallint) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS integer) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS bigint) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS numeric); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS numeric) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS super); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS super) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS text) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS time without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS time without time zone) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS timestamp without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS timestamp without time zone) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS timestamp with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS timestamp with time zone) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS time with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS time with time zone) WITHOUT FUNCTION;


--
-- Name: CAST (cstring AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (cstring AS character varying) WITHOUT FUNCTION;


--
-- Name: CAST (date AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (date AS character) WITH FUNCTION pg_catalog.bpchar(date) AS ASSIGNMENT;


--
-- Name: CAST (date AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (date AS text) WITH FUNCTION pg_catalog.text(date) AS IMPLICIT;


--
-- Name: CAST (date AS timestamp without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (date AS timestamp without time zone) WITH FUNCTION pg_catalog."timestamp"(date) AS IMPLICIT;


--
-- Name: CAST (date AS timestamp with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (date AS timestamp with time zone) WITH FUNCTION pg_catalog.timestamptz(date) AS IMPLICIT;


--
-- Name: CAST (date AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (date AS character varying) WITH FUNCTION pg_catalog.text(date) AS ASSIGNMENT;


--
-- Name: CAST (real AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (real AS character) WITH FUNCTION pg_catalog.bpchar(real) AS ASSIGNMENT;


--
-- Name: CAST (real AS double precision); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (real AS double precision) WITH FUNCTION pg_catalog.float8(real) AS IMPLICIT;


--
-- Name: CAST (real AS smallint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (real AS smallint) WITH FUNCTION pg_catalog.int2(real) AS ASSIGNMENT;


--
-- Name: CAST (real AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (real AS integer) WITH FUNCTION pg_catalog.int4(real) AS ASSIGNMENT;


--
-- Name: CAST (real AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (real AS bigint) WITH FUNCTION pg_catalog.int8(real) AS ASSIGNMENT;


--
-- Name: CAST (real AS numeric); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (real AS numeric) WITH FUNCTION pg_catalog."numeric"(real) AS ASSIGNMENT;


--
-- Name: CAST (real AS super); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (real AS super) WITH FUNCTION pg_catalog.float4_partiql(real) AS ASSIGNMENT;


--
-- Name: CAST (real AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (real AS text) WITH FUNCTION pg_catalog.text(real) AS IMPLICIT;


--
-- Name: CAST (real AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (real AS character varying) WITH FUNCTION pg_catalog.text(real) AS ASSIGNMENT;


--
-- Name: CAST (double precision AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (double precision AS character) WITH FUNCTION pg_catalog.bpchar(double precision) AS ASSIGNMENT;


--
-- Name: CAST (double precision AS real); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (double precision AS real) WITH FUNCTION pg_catalog.float4(double precision) AS ASSIGNMENT;


--
-- Name: CAST (double precision AS smallint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (double precision AS smallint) WITH FUNCTION pg_catalog.int2(double precision) AS ASSIGNMENT;


--
-- Name: CAST (double precision AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (double precision AS integer) WITH FUNCTION pg_catalog.int4(double precision) AS ASSIGNMENT;


--
-- Name: CAST (double precision AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (double precision AS bigint) WITH FUNCTION pg_catalog.int8(double precision) AS ASSIGNMENT;


--
-- Name: CAST (double precision AS numeric); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (double precision AS numeric) WITH FUNCTION pg_catalog."numeric"(double precision) AS ASSIGNMENT;


--
-- Name: CAST (double precision AS super); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (double precision AS super) WITH FUNCTION pg_catalog.float8_partiql(double precision) AS ASSIGNMENT;


--
-- Name: CAST (double precision AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (double precision AS text) WITH FUNCTION pg_catalog.text(double precision) AS IMPLICIT;


--
-- Name: CAST (double precision AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (double precision AS character varying) WITH FUNCTION pg_catalog.text(double precision) AS ASSIGNMENT;


--
-- Name: CAST (geography AS geometry); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (geography AS geometry) WITH FUNCTION pg_catalog.geography_geometry(geography);


--
-- Name: CAST (geography AS binary varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (geography AS binary varying) WITH FUNCTION pg_catalog.geography_varbyte(geography);


--
-- Name: CAST (geometry AS geography); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (geometry AS geography) WITH FUNCTION pg_catalog.geometry_geography(geometry) AS ASSIGNMENT;


--
-- Name: CAST (geometry AS binary varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (geometry AS binary varying) WITH FUNCTION pg_catalog.geometry_varbyte(geometry);


--
-- Name: CAST (inet AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (inet AS character) WITH FUNCTION pg_catalog.text(inet);


--
-- Name: CAST (inet AS cidr); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (inet AS cidr) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (inet AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (inet AS text) WITH FUNCTION pg_catalog.text(inet);


--
-- Name: CAST (inet AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (inet AS character varying) WITH FUNCTION pg_catalog.text(inet);


--
-- Name: CAST (smallint AS boolean); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS boolean) WITH FUNCTION pg_catalog.bool(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS character) WITH FUNCTION pg_catalog.bpchar(smallint) AS ASSIGNMENT;


--
-- Name: CAST (smallint AS real); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS real) WITH FUNCTION pg_catalog.float4(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS double precision); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS double precision) WITH FUNCTION pg_catalog.float8(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS integer) WITH FUNCTION pg_catalog.int4(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS bigint) WITH FUNCTION pg_catalog.int8(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS numeric); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS numeric) WITH FUNCTION pg_catalog."numeric"(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS oid); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS oid) WITH FUNCTION pg_catalog.int4(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS regclass); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS regclass) WITH FUNCTION pg_catalog.int4(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS regoper); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS regoper) WITH FUNCTION pg_catalog.int4(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS regoperator); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS regoperator) WITH FUNCTION pg_catalog.int4(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS regproc); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS regproc) WITH FUNCTION pg_catalog.int4(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS regprocedure); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS regprocedure) WITH FUNCTION pg_catalog.int4(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS regtype); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS regtype) WITH FUNCTION pg_catalog.int4(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS super); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS super) WITH FUNCTION pg_catalog.int2_partiql(smallint) AS ASSIGNMENT;


--
-- Name: CAST (smallint AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS text) WITH FUNCTION pg_catalog.text(smallint) AS IMPLICIT;


--
-- Name: CAST (smallint AS binary varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS binary varying) WITH FUNCTION pg_catalog.int2_varbyte(smallint);


--
-- Name: CAST (smallint AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (smallint AS character varying) WITH FUNCTION pg_catalog.text(smallint) AS ASSIGNMENT;


--
-- Name: CAST (integer AS abstime); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS abstime) WITHOUT FUNCTION;


--
-- Name: CAST (integer AS bit); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS bit) WITH FUNCTION pg_catalog."bit"(integer, integer);


--
-- Name: CAST (integer AS boolean); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS boolean) WITH FUNCTION pg_catalog.bool(integer) AS IMPLICIT;


--
-- Name: CAST (integer AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS character) WITH FUNCTION pg_catalog.bpchar(integer) AS ASSIGNMENT;


--
-- Name: CAST (integer AS "char"); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS "char") WITH FUNCTION pg_catalog."char"(integer);


--
-- Name: CAST (integer AS real); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS real) WITH FUNCTION pg_catalog.float4(integer) AS IMPLICIT;


--
-- Name: CAST (integer AS double precision); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS double precision) WITH FUNCTION pg_catalog.float8(integer) AS IMPLICIT;


--
-- Name: CAST (integer AS smallint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS smallint) WITH FUNCTION pg_catalog.int2(integer) AS ASSIGNMENT;


--
-- Name: CAST (integer AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS bigint) WITH FUNCTION pg_catalog.int8(integer) AS IMPLICIT;


--
-- Name: CAST (integer AS numeric); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS numeric) WITH FUNCTION pg_catalog."numeric"(integer) AS IMPLICIT;


--
-- Name: CAST (integer AS oid); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS oid) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (integer AS regclass); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS regclass) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (integer AS regoper); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS regoper) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (integer AS regoperator); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS regoperator) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (integer AS regproc); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS regproc) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (integer AS regprocedure); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS regprocedure) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (integer AS regtype); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS regtype) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (integer AS reltime); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS reltime) WITHOUT FUNCTION;


--
-- Name: CAST (integer AS super); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS super) WITH FUNCTION pg_catalog.int4_partiql(integer) AS ASSIGNMENT;


--
-- Name: CAST (integer AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS text) WITH FUNCTION pg_catalog.text(integer) AS IMPLICIT;


--
-- Name: CAST (integer AS binary varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS binary varying) WITH FUNCTION pg_catalog.int4_varbyte(integer);


--
-- Name: CAST (integer AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (integer AS character varying) WITH FUNCTION pg_catalog.text(integer) AS ASSIGNMENT;


--
-- Name: CAST (bigint AS bit); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS bit) WITH FUNCTION pg_catalog."bit"(bigint, integer);


--
-- Name: CAST (bigint AS boolean); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS boolean) WITH FUNCTION pg_catalog.bool(bigint) AS IMPLICIT;


--
-- Name: CAST (bigint AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS character) WITH FUNCTION pg_catalog.bpchar(bigint) AS ASSIGNMENT;


--
-- Name: CAST (bigint AS real); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS real) WITH FUNCTION pg_catalog.float4(bigint) AS IMPLICIT;


--
-- Name: CAST (bigint AS double precision); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS double precision) WITH FUNCTION pg_catalog.float8(bigint) AS IMPLICIT;


--
-- Name: CAST (bigint AS smallint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS smallint) WITH FUNCTION pg_catalog.int2(bigint) AS ASSIGNMENT;


--
-- Name: CAST (bigint AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS integer) WITH FUNCTION pg_catalog.int4(bigint) AS ASSIGNMENT;


--
-- Name: CAST (bigint AS numeric); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS numeric) WITH FUNCTION pg_catalog."numeric"(bigint) AS IMPLICIT;


--
-- Name: CAST (bigint AS oid); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS oid) WITH FUNCTION pg_catalog.oid(bigint) AS IMPLICIT;


--
-- Name: CAST (bigint AS regclass); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS regclass) WITH FUNCTION pg_catalog.oid(bigint) AS IMPLICIT;


--
-- Name: CAST (bigint AS regoper); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS regoper) WITH FUNCTION pg_catalog.oid(bigint) AS IMPLICIT;


--
-- Name: CAST (bigint AS regoperator); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS regoperator) WITH FUNCTION pg_catalog.oid(bigint) AS IMPLICIT;


--
-- Name: CAST (bigint AS regproc); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS regproc) WITH FUNCTION pg_catalog.oid(bigint) AS IMPLICIT;


--
-- Name: CAST (bigint AS regprocedure); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS regprocedure) WITH FUNCTION pg_catalog.oid(bigint) AS IMPLICIT;


--
-- Name: CAST (bigint AS regtype); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS regtype) WITH FUNCTION pg_catalog.oid(bigint) AS IMPLICIT;


--
-- Name: CAST (bigint AS super); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS super) WITH FUNCTION pg_catalog.int8_partiql(bigint) AS ASSIGNMENT;


--
-- Name: CAST (bigint AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS text) WITH FUNCTION pg_catalog.text(bigint) AS IMPLICIT;


--
-- Name: CAST (bigint AS binary varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS binary varying) WITH FUNCTION pg_catalog.int8_varbyte(bigint);


--
-- Name: CAST (bigint AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bigint AS character varying) WITH FUNCTION pg_catalog.text(bigint) AS ASSIGNMENT;


--
-- Name: CAST (interval AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (interval AS character) WITH FUNCTION pg_catalog.bpchar(interval) AS ASSIGNMENT;


--
-- Name: CAST (interval AS interval); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (interval AS interval) WITH FUNCTION pg_catalog."interval"(interval, integer) AS IMPLICIT;


--
-- Name: CAST (interval AS intervald2s); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (interval AS intervald2s) WITH FUNCTION pg_catalog.to_intervald2s(interval) AS IMPLICIT;


--
-- Name: CAST (interval AS intervaly2m); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (interval AS intervaly2m) WITH FUNCTION pg_catalog.to_intervaly2m(interval) AS IMPLICIT;


--
-- Name: CAST (interval AS reltime); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (interval AS reltime) WITH FUNCTION pg_catalog.reltime(interval) AS ASSIGNMENT;


--
-- Name: CAST (interval AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (interval AS text) WITH FUNCTION pg_catalog.text(interval) AS IMPLICIT;


--
-- Name: CAST (interval AS time without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (interval AS time without time zone) WITH FUNCTION pg_catalog."time"(interval) AS ASSIGNMENT;


--
-- Name: CAST (interval AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (interval AS character varying) WITH FUNCTION pg_catalog.text(interval) AS ASSIGNMENT;


--
-- Name: CAST (intervald2s AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (intervald2s AS character) WITH FUNCTION pg_catalog.bpchar(intervald2s) AS ASSIGNMENT;


--
-- Name: CAST (intervald2s AS interval); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (intervald2s AS interval) WITH FUNCTION pg_catalog.to_interval(intervald2s);


--
-- Name: CAST (intervald2s AS intervald2s); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (intervald2s AS intervald2s) WITH FUNCTION pg_catalog.intervald2s(intervald2s, integer) AS IMPLICIT;


--
-- Name: CAST (intervald2s AS reltime); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (intervald2s AS reltime) WITH FUNCTION pg_catalog.reltime(intervald2s) AS ASSIGNMENT;


--
-- Name: CAST (intervald2s AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (intervald2s AS text) WITH FUNCTION pg_catalog.text(intervald2s) AS IMPLICIT;


--
-- Name: CAST (intervald2s AS time without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (intervald2s AS time without time zone) WITH FUNCTION pg_catalog."time"(intervald2s) AS ASSIGNMENT;


--
-- Name: CAST (intervald2s AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (intervald2s AS character varying) WITH FUNCTION pg_catalog.text(intervald2s) AS ASSIGNMENT;


--
-- Name: CAST (intervaly2m AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (intervaly2m AS character) WITH FUNCTION pg_catalog.bpchar(intervaly2m) AS ASSIGNMENT;


--
-- Name: CAST (intervaly2m AS interval); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (intervaly2m AS interval) WITH FUNCTION pg_catalog.to_interval(intervaly2m);


--
-- Name: CAST (intervaly2m AS intervaly2m); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (intervaly2m AS intervaly2m) WITH FUNCTION pg_catalog.intervaly2m(intervaly2m, integer) AS IMPLICIT;


--
-- Name: CAST (intervaly2m AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (intervaly2m AS text) WITH FUNCTION pg_catalog.text(intervaly2m) AS IMPLICIT;


--
-- Name: CAST (intervaly2m AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (intervaly2m AS character varying) WITH FUNCTION pg_catalog.text(intervaly2m) AS ASSIGNMENT;


--
-- Name: CAST (lseg AS point); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (lseg AS point) WITH FUNCTION pg_catalog.point(lseg);


--
-- Name: CAST (macaddr AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (macaddr AS character) WITH FUNCTION pg_catalog.text(macaddr);


--
-- Name: CAST (macaddr AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (macaddr AS text) WITH FUNCTION pg_catalog.text(macaddr);


--
-- Name: CAST (macaddr AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (macaddr AS character varying) WITH FUNCTION pg_catalog.text(macaddr);


--
-- Name: CAST (name AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (name AS character) WITH FUNCTION pg_catalog.bpchar(name) AS ASSIGNMENT;


--
-- Name: CAST (name AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (name AS text) WITH FUNCTION pg_catalog.text(name) AS IMPLICIT;


--
-- Name: CAST (name AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (name AS character varying) WITH FUNCTION pg_catalog."varchar"(name) AS ASSIGNMENT;


--
-- Name: CAST (numeric AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (numeric AS character) WITH FUNCTION pg_catalog.bpchar(numeric) AS ASSIGNMENT;


--
-- Name: CAST (numeric AS real); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (numeric AS real) WITH FUNCTION pg_catalog.float4(numeric) AS IMPLICIT;


--
-- Name: CAST (numeric AS double precision); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (numeric AS double precision) WITH FUNCTION pg_catalog.float8(numeric) AS IMPLICIT;


--
-- Name: CAST (numeric AS smallint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (numeric AS smallint) WITH FUNCTION pg_catalog.int2(numeric) AS ASSIGNMENT;


--
-- Name: CAST (numeric AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (numeric AS integer) WITH FUNCTION pg_catalog.int4(numeric) AS ASSIGNMENT;


--
-- Name: CAST (numeric AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (numeric AS bigint) WITH FUNCTION pg_catalog.int8(numeric) AS ASSIGNMENT;


--
-- Name: CAST (numeric AS numeric); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (numeric AS numeric) WITH FUNCTION pg_catalog."numeric"(numeric, integer) AS IMPLICIT;


--
-- Name: CAST (numeric AS super); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (numeric AS super) WITH FUNCTION pg_catalog.numeric_partiql(numeric) AS ASSIGNMENT;


--
-- Name: CAST (numeric AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (numeric AS text) WITH FUNCTION pg_catalog.text(numeric) AS IMPLICIT;


--
-- Name: CAST (numeric AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (numeric AS character varying) WITH FUNCTION pg_catalog.text(numeric) AS ASSIGNMENT;


--
-- Name: CAST (oid AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (oid AS character) WITH FUNCTION pg_catalog.text(oid) AS ASSIGNMENT;


--
-- Name: CAST (oid AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (oid AS integer) WITHOUT FUNCTION AS ASSIGNMENT;


--
-- Name: CAST (oid AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (oid AS bigint) WITH FUNCTION pg_catalog.int8(oid) AS ASSIGNMENT;


--
-- Name: CAST (oid AS regclass); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (oid AS regclass) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (oid AS regoper); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (oid AS regoper) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (oid AS regoperator); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (oid AS regoperator) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (oid AS regproc); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (oid AS regproc) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (oid AS regprocedure); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (oid AS regprocedure) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (oid AS regtype); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (oid AS regtype) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (oid AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (oid AS text) WITH FUNCTION pg_catalog.text(oid) AS IMPLICIT;


--
-- Name: CAST (oid AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (oid AS character varying) WITH FUNCTION pg_catalog.text(oid) AS ASSIGNMENT;


--
-- Name: CAST ("path" AS point); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST ("path" AS point) WITH FUNCTION pg_catalog.point("path");


--
-- Name: CAST ("path" AS polygon); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST ("path" AS polygon) WITH FUNCTION pg_catalog.polygon("path") AS ASSIGNMENT;


--
-- Name: CAST (polygon AS box); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (polygon AS box) WITH FUNCTION pg_catalog.box(polygon);


--
-- Name: CAST (polygon AS circle); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (polygon AS circle) WITH FUNCTION pg_catalog.circle(polygon);


--
-- Name: CAST (polygon AS "path"); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (polygon AS "path") WITH FUNCTION pg_catalog.path(polygon) AS ASSIGNMENT;


--
-- Name: CAST (polygon AS point); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (polygon AS point) WITH FUNCTION pg_catalog.point(polygon);


--
-- Name: CAST (regclass AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regclass AS integer) WITHOUT FUNCTION AS ASSIGNMENT;


--
-- Name: CAST (regclass AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regclass AS bigint) WITH FUNCTION pg_catalog.int8(oid) AS ASSIGNMENT;


--
-- Name: CAST (regclass AS oid); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regclass AS oid) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (regoper AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regoper AS integer) WITHOUT FUNCTION AS ASSIGNMENT;


--
-- Name: CAST (regoper AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regoper AS bigint) WITH FUNCTION pg_catalog.int8(oid) AS ASSIGNMENT;


--
-- Name: CAST (regoper AS oid); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regoper AS oid) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (regoper AS regoperator); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regoper AS regoperator) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (regoperator AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regoperator AS integer) WITHOUT FUNCTION AS ASSIGNMENT;


--
-- Name: CAST (regoperator AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regoperator AS bigint) WITH FUNCTION pg_catalog.int8(oid) AS ASSIGNMENT;


--
-- Name: CAST (regoperator AS oid); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regoperator AS oid) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (regoperator AS regoper); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regoperator AS regoper) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (regproc AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regproc AS integer) WITHOUT FUNCTION AS ASSIGNMENT;


--
-- Name: CAST (regproc AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regproc AS bigint) WITH FUNCTION pg_catalog.int8(oid) AS ASSIGNMENT;


--
-- Name: CAST (regproc AS oid); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regproc AS oid) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (regproc AS regprocedure); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regproc AS regprocedure) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (regprocedure AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regprocedure AS integer) WITHOUT FUNCTION AS ASSIGNMENT;


--
-- Name: CAST (regprocedure AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regprocedure AS bigint) WITH FUNCTION pg_catalog.int8(oid) AS ASSIGNMENT;


--
-- Name: CAST (regprocedure AS oid); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regprocedure AS oid) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (regprocedure AS regproc); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regprocedure AS regproc) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (regtype AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regtype AS integer) WITHOUT FUNCTION AS ASSIGNMENT;


--
-- Name: CAST (regtype AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regtype AS bigint) WITH FUNCTION pg_catalog.int8(oid) AS ASSIGNMENT;


--
-- Name: CAST (regtype AS oid); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (regtype AS oid) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (reltime AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (reltime AS integer) WITHOUT FUNCTION;


--
-- Name: CAST (reltime AS interval); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (reltime AS interval) WITH FUNCTION pg_catalog."interval"(reltime) AS IMPLICIT;


--
-- Name: CAST (reltime AS intervald2s); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (reltime AS intervald2s) WITH FUNCTION pg_catalog.intervald2s(reltime) AS IMPLICIT;


--
-- Name: CAST (super AS boolean); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS boolean) WITH FUNCTION pg_catalog.partiql_bool(super);


--
-- Name: CAST (super AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS character) WITH FUNCTION pg_catalog.partiql_char(super);


--
-- Name: CAST (super AS date); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS date) WITH FUNCTION pg_catalog.partiql_date(super);


--
-- Name: CAST (super AS real); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS real) WITH FUNCTION pg_catalog.partiql_float4(super);


--
-- Name: CAST (super AS double precision); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS double precision) WITH FUNCTION pg_catalog.partiql_float8(super);


--
-- Name: CAST (super AS smallint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS smallint) WITH FUNCTION pg_catalog.partiql_int2(super);


--
-- Name: CAST (super AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS integer) WITH FUNCTION pg_catalog.partiql_int4(super);


--
-- Name: CAST (super AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS bigint) WITH FUNCTION pg_catalog.partiql_int8(super);


--
-- Name: CAST (super AS numeric); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS numeric) WITH FUNCTION pg_catalog.partiql_numeric(super);


--
-- Name: CAST (super AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS text) WITH FUNCTION pg_catalog.partiql_text(super);


--
-- Name: CAST (super AS time without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS time without time zone) WITH FUNCTION pg_catalog.partiql_time(super);


--
-- Name: CAST (super AS timestamp without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS timestamp without time zone) WITH FUNCTION pg_catalog.partiql_timestamp(super);


--
-- Name: CAST (super AS timestamp with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS timestamp with time zone) WITH FUNCTION pg_catalog.partiql_timestamptz(super);


--
-- Name: CAST (super AS time with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS time with time zone) WITH FUNCTION pg_catalog.partiql_timetz(super);


--
-- Name: CAST (super AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (super AS character varying) WITH FUNCTION pg_catalog.partiql_varchar(super);


--
-- Name: CAST (text AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS character) WITH FUNCTION pg_catalog.tobpchar(character varying, integer, boolean) AS IMPLICIT;


--
-- Name: CAST (text AS "char"); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS "char") WITH FUNCTION pg_catalog."char"(text) AS ASSIGNMENT;


--
-- Name: CAST (text AS cidr); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS cidr) WITH FUNCTION pg_catalog.cidr(text);


--
-- Name: CAST (text AS date); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS date) WITH FUNCTION pg_catalog.date(text);


--
-- Name: CAST (text AS real); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS real) WITH FUNCTION pg_catalog.float4(text);


--
-- Name: CAST (text AS double precision); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS double precision) WITH FUNCTION pg_catalog.float8(text);


--
-- Name: CAST (text AS inet); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS inet) WITH FUNCTION pg_catalog.inet(text);


--
-- Name: CAST (text AS smallint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS smallint) WITH FUNCTION pg_catalog.int2(text);


--
-- Name: CAST (text AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS integer) WITH FUNCTION pg_catalog.int4(text);


--
-- Name: CAST (text AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS bigint) WITH FUNCTION pg_catalog.int8(text);


--
-- Name: CAST (text AS interval); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS interval) WITH FUNCTION pg_catalog."interval"(text);


--
-- Name: CAST (text AS intervald2s); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS intervald2s) WITH FUNCTION pg_catalog.intervald2s(text, integer);


--
-- Name: CAST (text AS intervaly2m); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS intervaly2m) WITH FUNCTION pg_catalog.intervaly2m(text, integer);


--
-- Name: CAST (text AS macaddr); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS macaddr) WITH FUNCTION pg_catalog.macaddr(text);


--
-- Name: CAST (text AS name); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS name) WITH FUNCTION pg_catalog.name(text) AS IMPLICIT;


--
-- Name: CAST (text AS numeric); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS numeric) WITH FUNCTION pg_catalog."numeric"(text) AS IMPLICIT;


--
-- Name: CAST (text AS oid); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS oid) WITH FUNCTION pg_catalog.oid(text);


--
-- Name: CAST (text AS super); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS super) WITH FUNCTION pg_catalog.text_partiql(text) AS ASSIGNMENT;


--
-- Name: CAST (text AS time without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS time without time zone) WITH FUNCTION pg_catalog."time"(text);


--
-- Name: CAST (text AS timestamp without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS timestamp without time zone) WITH FUNCTION pg_catalog."timestamp"(text);


--
-- Name: CAST (text AS timestamp with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS timestamp with time zone) WITH FUNCTION pg_catalog.timestamptz(text);


--
-- Name: CAST (text AS time with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS time with time zone) WITH FUNCTION pg_catalog.timetz(text);


--
-- Name: CAST (text AS binary varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS binary varying) WITH FUNCTION pg_catalog.text_varbyte(text);


--
-- Name: CAST (text AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (text AS character varying) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (time without time zone AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (time without time zone AS character) WITH FUNCTION pg_catalog.time_bpchar(time without time zone) AS ASSIGNMENT;


--
-- Name: CAST (time without time zone AS interval); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (time without time zone AS interval) WITH FUNCTION pg_catalog."interval"(time without time zone);


--
-- Name: CAST (time without time zone AS intervald2s); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (time without time zone AS intervald2s) WITH FUNCTION pg_catalog.intervald2s(time without time zone) AS IMPLICIT;


--
-- Name: CAST (time without time zone AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (time without time zone AS text) WITH FUNCTION pg_catalog.text(time without time zone) AS IMPLICIT;


--
-- Name: CAST (time without time zone AS time without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (time without time zone AS time without time zone) WITH FUNCTION pg_catalog."time"(time without time zone, integer) AS IMPLICIT;


--
-- Name: CAST (time without time zone AS time with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (time without time zone AS time with time zone) WITH FUNCTION pg_catalog.timetz(time without time zone) AS IMPLICIT;


--
-- Name: CAST (time without time zone AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (time without time zone AS character varying) WITH FUNCTION pg_catalog.text(time without time zone) AS ASSIGNMENT;


--
-- Name: CAST (timestamp without time zone AS abstime); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp without time zone AS abstime) WITH FUNCTION pg_catalog.abstime(timestamp without time zone) AS ASSIGNMENT;


--
-- Name: CAST (timestamp without time zone AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp without time zone AS character) WITH FUNCTION pg_catalog.bpchar(timestamp without time zone) AS ASSIGNMENT;


--
-- Name: CAST (timestamp without time zone AS date); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp without time zone AS date) WITH FUNCTION pg_catalog.date(timestamp without time zone) AS ASSIGNMENT;


--
-- Name: CAST (timestamp without time zone AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp without time zone AS text) WITH FUNCTION pg_catalog.text(timestamp without time zone) AS IMPLICIT;


--
-- Name: CAST (timestamp without time zone AS time without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp without time zone AS time without time zone) WITH FUNCTION pg_catalog."time"(timestamp without time zone) AS ASSIGNMENT;


--
-- Name: CAST (timestamp without time zone AS timestamp without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp without time zone AS timestamp without time zone) WITH FUNCTION pg_catalog."timestamp"(timestamp without time zone, integer) AS IMPLICIT;


--
-- Name: CAST (timestamp without time zone AS timestamp with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp without time zone AS timestamp with time zone) WITH FUNCTION pg_catalog.timestamptz(timestamp without time zone) AS IMPLICIT;


--
-- Name: CAST (timestamp without time zone AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp without time zone AS character varying) WITH FUNCTION pg_catalog.text(timestamp without time zone) AS ASSIGNMENT;


--
-- Name: CAST (timestamp with time zone AS abstime); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp with time zone AS abstime) WITH FUNCTION pg_catalog.abstime(timestamp with time zone) AS ASSIGNMENT;


--
-- Name: CAST (timestamp with time zone AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp with time zone AS character) WITH FUNCTION pg_catalog.bpchar(timestamp with time zone) AS ASSIGNMENT;


--
-- Name: CAST (timestamp with time zone AS date); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp with time zone AS date) WITH FUNCTION pg_catalog.date(timestamp with time zone) AS ASSIGNMENT;


--
-- Name: CAST (timestamp with time zone AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp with time zone AS text) WITH FUNCTION pg_catalog.text(timestamp with time zone) AS IMPLICIT;


--
-- Name: CAST (timestamp with time zone AS time without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp with time zone AS time without time zone) WITH FUNCTION pg_catalog."time"(timestamp with time zone) AS ASSIGNMENT;


--
-- Name: CAST (timestamp with time zone AS timestamp without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp with time zone AS timestamp without time zone) WITH FUNCTION pg_catalog."timestamp"(timestamp with time zone) AS ASSIGNMENT;


--
-- Name: CAST (timestamp with time zone AS timestamp with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp with time zone AS timestamp with time zone) WITH FUNCTION pg_catalog.timestamptz(timestamp with time zone, integer) AS IMPLICIT;


--
-- Name: CAST (timestamp with time zone AS time with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp with time zone AS time with time zone) WITH FUNCTION pg_catalog.timetz(timestamp with time zone) AS ASSIGNMENT;


--
-- Name: CAST (timestamp with time zone AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (timestamp with time zone AS character varying) WITH FUNCTION pg_catalog.text(timestamp with time zone) AS ASSIGNMENT;


--
-- Name: CAST (time with time zone AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (time with time zone AS character) WITH FUNCTION pg_catalog.timetz_bpchar(time with time zone) AS ASSIGNMENT;


--
-- Name: CAST (time with time zone AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (time with time zone AS text) WITH FUNCTION pg_catalog.text(time with time zone) AS IMPLICIT;


--
-- Name: CAST (time with time zone AS time without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (time with time zone AS time without time zone) WITH FUNCTION pg_catalog."time"(time with time zone) AS ASSIGNMENT;


--
-- Name: CAST (time with time zone AS time with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (time with time zone AS time with time zone) WITH FUNCTION pg_catalog.timetz(time with time zone, integer) AS IMPLICIT;


--
-- Name: CAST (time with time zone AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (time with time zone AS character varying) WITH FUNCTION pg_catalog.text(time with time zone) AS ASSIGNMENT;


--
-- Name: CAST (bit varying AS bit); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bit varying AS bit) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (bit varying AS bit varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (bit varying AS bit varying) WITH FUNCTION pg_catalog.varbit(bit varying, integer, boolean) AS IMPLICIT;


--
-- Name: CAST (binary varying AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (binary varying AS character) WITH FUNCTION pg_catalog.varbyte_bpchar(binary varying, integer, boolean);


--
-- Name: CAST (binary varying AS geography); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (binary varying AS geography) WITH FUNCTION pg_catalog.varbyte_geography(binary varying);


--
-- Name: CAST (binary varying AS geometry); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (binary varying AS geometry) WITH FUNCTION pg_catalog.varbyte_geometry(binary varying);


--
-- Name: CAST (binary varying AS smallint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (binary varying AS smallint) WITH FUNCTION pg_catalog.varbyte_int2(binary varying);


--
-- Name: CAST (binary varying AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (binary varying AS integer) WITH FUNCTION pg_catalog.varbyte_int4(binary varying);


--
-- Name: CAST (binary varying AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (binary varying AS bigint) WITH FUNCTION pg_catalog.varbyte_int8(binary varying);


--
-- Name: CAST (binary varying AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (binary varying AS text) WITH FUNCTION pg_catalog.varbyte_text(binary varying);


--
-- Name: CAST (binary varying AS binary varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (binary varying AS binary varying) WITH FUNCTION pg_catalog.varbyte(binary varying, integer, boolean) AS IMPLICIT;


--
-- Name: CAST (binary varying AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (binary varying AS character varying) WITH FUNCTION pg_catalog.varbyte_varchar(binary varying);


--
-- Name: CAST (character varying AS character); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS character) WITH FUNCTION pg_catalog.tobpchar(character varying, integer, boolean) AS IMPLICIT;


--
-- Name: CAST (character varying AS "char"); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS "char") WITH FUNCTION pg_catalog."char"(text) AS ASSIGNMENT;


--
-- Name: CAST (character varying AS cidr); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS cidr) WITH FUNCTION pg_catalog.cidr(text);


--
-- Name: CAST (character varying AS date); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS date) WITH FUNCTION pg_catalog.date(text);


--
-- Name: CAST (character varying AS real); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS real) WITH FUNCTION pg_catalog.float4(text);


--
-- Name: CAST (character varying AS double precision); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS double precision) WITH FUNCTION pg_catalog.float8(text);


--
-- Name: CAST (character varying AS inet); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS inet) WITH FUNCTION pg_catalog.inet(text);


--
-- Name: CAST (character varying AS smallint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS smallint) WITH FUNCTION pg_catalog.int2(text);


--
-- Name: CAST (character varying AS integer); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS integer) WITH FUNCTION pg_catalog.int4(text);


--
-- Name: CAST (character varying AS bigint); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS bigint) WITH FUNCTION pg_catalog.int8(text);


--
-- Name: CAST (character varying AS interval); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS interval) WITH FUNCTION pg_catalog."interval"(text);


--
-- Name: CAST (character varying AS intervald2s); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS intervald2s) WITH FUNCTION pg_catalog.intervald2s(text, integer);


--
-- Name: CAST (character varying AS intervaly2m); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS intervaly2m) WITH FUNCTION pg_catalog.intervaly2m(text, integer);


--
-- Name: CAST (character varying AS macaddr); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS macaddr) WITH FUNCTION pg_catalog.macaddr(text);


--
-- Name: CAST (character varying AS name); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS name) WITH FUNCTION pg_catalog.name(character varying) AS IMPLICIT;


--
-- Name: CAST (character varying AS numeric); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS numeric) WITH FUNCTION pg_catalog."numeric"(text) AS IMPLICIT;


--
-- Name: CAST (character varying AS oid); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS oid) WITH FUNCTION pg_catalog.oid(text);


--
-- Name: CAST (character varying AS super); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS super) WITH FUNCTION pg_catalog.varchar_partiql(character varying) AS ASSIGNMENT;


--
-- Name: CAST (character varying AS text); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS text) WITHOUT FUNCTION AS IMPLICIT;


--
-- Name: CAST (character varying AS time without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS time without time zone) WITH FUNCTION pg_catalog."time"(text);


--
-- Name: CAST (character varying AS timestamp without time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS timestamp without time zone) WITH FUNCTION pg_catalog."timestamp"(text);


--
-- Name: CAST (character varying AS timestamp with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS timestamp with time zone) WITH FUNCTION pg_catalog.timestamptz(text);


--
-- Name: CAST (character varying AS time with time zone); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS time with time zone) WITH FUNCTION pg_catalog.timetz(text);


--
-- Name: CAST (character varying AS binary varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS binary varying) WITH FUNCTION pg_catalog.varchar_varbyte(character varying);


--
-- Name: CAST (character varying AS character varying); Type: CAST; Schema: -; Owner: -
--

-- CREATE CAST (character varying AS character varying) WITH FUNCTION pg_catalog."varchar"(character varying, integer, boolean) AS IMPLICIT;


SET default_tablespace = '';

--
-- Name: glue_user_info; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_user_info CASCADE;
CREATE TABLE public.glue_user_info (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    first_kana character varying(255) NOT NULL,
    last_kana character varying(255) NOT NULL,
    nationality character varying(255) NOT NULL,
    zip_code character varying(255) NOT NULL,
    prefecture character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    building character varying(255),
    birthday character varying(255) NOT NULL,
    gender integer,
    phone_number character varying(255) NOT NULL,
    occupation integer NOT NULL,
    industry integer,
    work_place character varying(255),
    "position" character varying(255),
    pricefrom integer,
    income integer NOT NULL,
    financial_assets integer NOT NULL,
    purpose integer NOT NULL,
    investment_purposes integer NOT NULL,
    crypto_experience integer NOT NULL,
    fx_experience integer NOT NULL,
    stocks_experience integer NOT NULL,
    fund_experience integer NOT NULL,
    application_history integer NOT NULL,
    application_history_other character varying(255),
    foreign_peps boolean NOT NULL,
    country character varying(128),
    antisocial_status character varying(1),
    residence_status integer,
    residence_card_expired_at timestamp without time zone,
    insider boolean DEFAULT false NOT NULL,
    risk_type character varying(2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    residence_card_validity date
);


-- ALTER TABLE public.glue_user_info OWNER TO master;

--
-- Name: aml_same_email_prefix_daily_detection_jst; Type: TABLE; Schema: point_dev_test; Owner: master
--

DROP TABLE IF EXISTS point_dev_test.aml_same_email_prefix_daily_detection_jst CASCADE;
CREATE TABLE point_dev_test.aml_same_email_prefix_daily_detection_jst (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    detection_date date NOT NULL,
    local_prefix character varying(16) NOT NULL,
    detected_at timestamp without time zone NOT NULL,
    daily_count integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


-- ALTER TABLE point_dev_test.aml_same_email_prefix_daily_detection_jst OWNER TO master;

--
-- Name: aml_same_email_prefix_daily_detection_user; Type: TABLE; Schema: point_dev_test; Owner: master
--

DROP TABLE IF EXISTS point_dev_test.aml_same_email_prefix_daily_detection_user CASCADE;
CREATE TABLE point_dev_test.aml_same_email_prefix_daily_detection_user (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    summary_id bigint NOT NULL,
    user_id bigint NOT NULL,
    "position" integer NOT NULL,
    email character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


-- ALTER TABLE point_dev_test.aml_same_email_prefix_daily_detection_user OWNER TO master;

--
-- Name: pos_best_price; Type: TABLE; Schema: point_dev_test; Owner: master
--

DROP TABLE IF EXISTS point_dev_test.pos_best_price CASCADE;
CREATE TABLE point_dev_test.pos_best_price (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    symbol_id bigint NOT NULL,
    best_ask numeric(34,20) NOT NULL,
    best_bid numeric(34,20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE point_dev_test.pos_best_price OWNER TO master;

--
-- Name: pos_order; Type: TABLE; Schema: point_dev_test; Owner: master
--

DROP TABLE IF EXISTS point_dev_test.pos_order CASCADE;
CREATE TABLE point_dev_test.pos_order (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20),
    mm_price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    remaining_amount numeric(34,20) NOT NULL,
    order_status character varying(255) NOT NULL,
    order_operator character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    covered boolean,
    notes character varying(128),
    id_type character varying(34)
);


-- ALTER TABLE point_dev_test.pos_order OWNER TO master;

--
-- Name: pos_trade; Type: TABLE; Schema: point_dev_test; Owner: master
--

DROP TABLE IF EXISTS point_dev_test.pos_trade CASCADE;
CREATE TABLE point_dev_test.pos_trade (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(128) NOT NULL,
    order_type character varying(128) NOT NULL,
    order_channel character varying(128) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20) DEFAULT 0 NOT NULL,
    trade_action character varying(255) NOT NULL,
    order_id bigint NOT NULL,
    fee numeric(34,20) NOT NULL,
    asset_amount numeric(34,20) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    id_type character varying(34),
    eval_profit_loss_amt numeric(34,20),
    eval_profit_loss_amt_rate numeric(34,20),
    avg_acq_unit_price numeric(34,20),
    income numeric(34,20),
    user_growth_stage_id integer DEFAULT 0,
    experience_points integer,
    notes character varying(128)
);


-- ALTER TABLE point_dev_test.pos_trade OWNER TO master;

--
-- Name: waf_blocked_access; Type: TABLE; Schema: point_dev_test; Owner: master
--

DROP TABLE IF EXISTS point_dev_test.waf_blocked_access CASCADE;
CREATE TABLE point_dev_test.waf_blocked_access (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    client_ip character varying(45) NOT NULL,
    country character varying(10) NOT NULL,
    blocked_by_rule character varying(100) NOT NULL,
    request_uri character varying(2048),
    blocked_at timestamp without time zone NOT NULL,
    total_calls integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE point_dev_test.waf_blocked_access OWNER TO master;

--
-- Name: point_pos_order; Type: TABLE; Schema: point_performance; Owner: master
--

DROP TABLE IF EXISTS point_performance.point_pos_order CASCADE;
CREATE TABLE point_performance.point_pos_order (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20),
    mm_price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    remaining_amount numeric(34,20) NOT NULL,
    order_status character varying(255) NOT NULL,
    order_operator character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    covered boolean,
    notes character varying(128),
    id_type character varying(34),
    request_quote_asset numeric(34,20) DEFAULT 0 NOT NULL,
    used_quote_asset numeric(34,20) DEFAULT 0 NOT NULL,
    request_point_asset numeric(34,20) DEFAULT 0 NOT NULL,
    used_point_asset numeric(34,20) DEFAULT 0 NOT NULL,
    client_id character varying(36)
);
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN id SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN symbol_id SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN order_side SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN order_type SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN order_channel SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN mm_price SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN amount SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN remaining_amount SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN order_status SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN order_operator SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN request_quote_asset SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN used_quote_asset SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN request_point_asset SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_order ALTER COLUMN used_point_asset SET NOT NULL;


-- ALTER TABLE point_performance.point_pos_order OWNER TO master;

--
-- Name: point_pos_trade; Type: TABLE; Schema: point_performance; Owner: master
--

DROP TABLE IF EXISTS point_performance.point_pos_trade CASCADE;
CREATE TABLE point_performance.point_pos_trade (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20) DEFAULT 0 NOT NULL,
    trade_action character varying(255) NOT NULL,
    order_id bigint NOT NULL,
    fee numeric(34,20) NOT NULL,
    asset_amount numeric(34,20) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    id_type character varying(34),
    eval_profit_loss_amt numeric(34,20),
    eval_profit_loss_amt_rate numeric(34,20),
    avg_acq_unit_price numeric(34,20),
    income numeric(34,20),
    user_growth_stage_id integer DEFAULT 0,
    experience_points integer,
    notes character varying(128),
    request_quote_asset numeric(34,20) DEFAULT 0 NOT NULL,
    used_quote_asset numeric(34,20) DEFAULT 0 NOT NULL,
    request_point_asset numeric(34,20) DEFAULT 0 NOT NULL,
    used_point_asset numeric(34,20) DEFAULT 0 NOT NULL
);
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN id SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN symbol_id SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN order_side SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN order_type SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN order_channel SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN price SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN amount SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN jpy_conversion SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN trade_action SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN order_id SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN fee SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN asset_amount SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN request_quote_asset SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN used_quote_asset SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN request_point_asset SET NOT NULL;
ALTER TABLE ONLY point_performance.point_pos_trade ALTER COLUMN used_point_asset SET NOT NULL;


-- ALTER TABLE point_performance.point_pos_trade OWNER TO master;

--
-- Name: pos_best_price; Type: TABLE; Schema: point_performance; Owner: master
--

DROP TABLE IF EXISTS point_performance.pos_best_price CASCADE;
CREATE TABLE point_performance.pos_best_price (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    symbol_id bigint NOT NULL,
    best_ask numeric(34,20) NOT NULL,
    best_bid numeric(34,20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    best_mm_ask numeric(34,20),
    best_mm_bid numeric(34,20),
    uuid character varying(36)
);
ALTER TABLE ONLY point_performance.pos_best_price ALTER COLUMN id SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_best_price ALTER COLUMN symbol_id SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_best_price ALTER COLUMN best_ask SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_best_price ALTER COLUMN best_bid SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_best_price ALTER COLUMN created_at SET NOT NULL;


-- ALTER TABLE point_performance.pos_best_price OWNER TO master;

--
-- Name: pos_order; Type: TABLE; Schema: point_performance; Owner: master
--

DROP TABLE IF EXISTS point_performance.pos_order CASCADE;
CREATE TABLE point_performance.pos_order (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20),
    mm_price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    remaining_amount numeric(34,20) NOT NULL,
    order_status character varying(255) NOT NULL,
    order_operator character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    covered boolean
);
ALTER TABLE ONLY point_performance.pos_order ALTER COLUMN id SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_order ALTER COLUMN symbol_id SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_order ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_order ALTER COLUMN order_side SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_order ALTER COLUMN order_type SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_order ALTER COLUMN order_channel SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_order ALTER COLUMN mm_price SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_order ALTER COLUMN amount SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_order ALTER COLUMN remaining_amount SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_order ALTER COLUMN order_status SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_order ALTER COLUMN order_operator SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_order ALTER COLUMN created_at SET NOT NULL;


-- ALTER TABLE point_performance.pos_order OWNER TO master;

--
-- Name: pos_trade; Type: TABLE; Schema: point_performance; Owner: master
--

DROP TABLE IF EXISTS point_performance.pos_trade CASCADE;
CREATE TABLE point_performance.pos_trade (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20) DEFAULT 0 NOT NULL,
    trade_action character varying(255) NOT NULL,
    order_id bigint NOT NULL,
    fee numeric(34,20) NOT NULL,
    asset_amount numeric(34,20) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN id SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN symbol_id SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN order_side SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN order_type SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN order_channel SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN price SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN amount SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN jpy_conversion SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN trade_action SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN order_id SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN fee SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN asset_amount SET NOT NULL;
ALTER TABLE ONLY point_performance.pos_trade ALTER COLUMN created_at SET NOT NULL;


-- ALTER TABLE point_performance.pos_trade OWNER TO master;

--
-- Name: spot_best_price_ada_jpy; Type: TABLE; Schema: point_performance; Owner: master
--

DROP TABLE IF EXISTS point_performance.spot_best_price_ada_jpy CASCADE;
CREATE TABLE point_performance.spot_best_price_ada_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    best_ask numeric(34,20) NOT NULL,
    best_bid numeric(34,20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);
ALTER TABLE ONLY point_performance.spot_best_price_ada_jpy ALTER COLUMN id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_best_price_ada_jpy ALTER COLUMN symbol_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_best_price_ada_jpy ALTER COLUMN best_ask SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_best_price_ada_jpy ALTER COLUMN best_bid SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_best_price_ada_jpy ALTER COLUMN created_at SET NOT NULL;


-- ALTER TABLE point_performance.spot_best_price_ada_jpy OWNER TO master;

--
-- Name: spot_best_price_amber_ada_jpy; Type: TABLE; Schema: point_performance; Owner: master
--

DROP TABLE IF EXISTS point_performance.spot_best_price_amber_ada_jpy CASCADE;
CREATE TABLE point_performance.spot_best_price_amber_ada_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    best_ask numeric(34,20) NOT NULL,
    best_bid numeric(34,20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);
ALTER TABLE ONLY point_performance.spot_best_price_amber_ada_jpy ALTER COLUMN id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_best_price_amber_ada_jpy ALTER COLUMN symbol_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_best_price_amber_ada_jpy ALTER COLUMN best_ask SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_best_price_amber_ada_jpy ALTER COLUMN best_bid SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_best_price_amber_ada_jpy ALTER COLUMN created_at SET NOT NULL;


-- ALTER TABLE point_performance.spot_best_price_amber_ada_jpy OWNER TO master;

--
-- Name: spot_best_price_nidt_jpy; Type: TABLE; Schema: point_performance; Owner: master
--

DROP TABLE IF EXISTS point_performance.spot_best_price_nidt_jpy CASCADE;
CREATE TABLE point_performance.spot_best_price_nidt_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    best_ask numeric(34,20) NOT NULL,
    best_bid numeric(34,20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);
ALTER TABLE ONLY point_performance.spot_best_price_nidt_jpy ALTER COLUMN id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_best_price_nidt_jpy ALTER COLUMN symbol_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_best_price_nidt_jpy ALTER COLUMN best_ask SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_best_price_nidt_jpy ALTER COLUMN best_bid SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_best_price_nidt_jpy ALTER COLUMN created_at SET NOT NULL;


-- ALTER TABLE point_performance.spot_best_price_nidt_jpy OWNER TO master;

--
-- Name: spot_order_ada_jpy; Type: TABLE; Schema: point_performance; Owner: master
--

DROP TABLE IF EXISTS point_performance.spot_order_ada_jpy CASCADE;
CREATE TABLE point_performance.spot_order_ada_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20),
    average_price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    remaining_amount numeric(34,20) NOT NULL,
    order_status character varying(255) NOT NULL,
    order_operator character varying(255) NOT NULL,
    post_only boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    cancel_reason character varying(128)
);
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN symbol_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN order_side SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN order_type SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN order_channel SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN average_price SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN amount SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN remaining_amount SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN order_status SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN order_operator SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN post_only SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_ada_jpy ALTER COLUMN created_at SET NOT NULL;


-- ALTER TABLE point_performance.spot_order_ada_jpy OWNER TO master;

--
-- Name: spot_order_nidt_jpy; Type: TABLE; Schema: point_performance; Owner: master
--

DROP TABLE IF EXISTS point_performance.spot_order_nidt_jpy CASCADE;
CREATE TABLE point_performance.spot_order_nidt_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20),
    average_price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    remaining_amount numeric(34,20) NOT NULL,
    order_status character varying(255) NOT NULL,
    order_operator character varying(255) NOT NULL,
    post_only boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    cancel_reason character varying(128)
);
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN symbol_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN order_side SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN order_type SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN order_channel SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN average_price SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN amount SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN remaining_amount SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN order_status SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN order_operator SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN post_only SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_order_nidt_jpy ALTER COLUMN created_at SET NOT NULL;


-- ALTER TABLE point_performance.spot_order_nidt_jpy OWNER TO master;

--
-- Name: spot_trade_ada_jpy; Type: TABLE; Schema: point_performance; Owner: master
--

DROP TABLE IF EXISTS point_performance.spot_trade_ada_jpy CASCADE;
CREATE TABLE point_performance.spot_trade_ada_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20) DEFAULT 0 NOT NULL,
    trade_action character varying(255) NOT NULL,
    order_id bigint NOT NULL,
    fee numeric(34,20) NOT NULL,
    target_order_id bigint NOT NULL,
    target_user_id bigint DEFAULT 0 NOT NULL,
    asset_amount numeric(34,20) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN symbol_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN order_side SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN order_type SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN order_channel SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN price SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN amount SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN jpy_conversion SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN trade_action SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN order_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN fee SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN target_order_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN target_user_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN asset_amount SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_ada_jpy ALTER COLUMN created_at SET NOT NULL;


-- ALTER TABLE point_performance.spot_trade_ada_jpy OWNER TO master;

--
-- Name: spot_trade_nidt_jpy; Type: TABLE; Schema: point_performance; Owner: master
--

DROP TABLE IF EXISTS point_performance.spot_trade_nidt_jpy CASCADE;
CREATE TABLE point_performance.spot_trade_nidt_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20) DEFAULT 0 NOT NULL,
    trade_action character varying(255) NOT NULL,
    order_id bigint NOT NULL,
    fee numeric(34,20) NOT NULL,
    target_order_id bigint NOT NULL,
    target_user_id bigint DEFAULT 0 NOT NULL,
    asset_amount numeric(34,20) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN symbol_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN order_side SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN order_type SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN order_channel SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN price SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN amount SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN jpy_conversion SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN trade_action SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN order_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN fee SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN target_order_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN target_user_id SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN asset_amount SET NOT NULL;
ALTER TABLE ONLY point_performance.spot_trade_nidt_jpy ALTER COLUMN created_at SET NOT NULL;


-- ALTER TABLE point_performance.spot_trade_nidt_jpy OWNER TO master;

--
-- Name: aml_multi_bank_account_fiat_tx_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.aml_multi_bank_account_fiat_tx_user CASCADE;
CREATE TABLE public.aml_multi_bank_account_fiat_tx_user (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    detect_date_jst date NOT NULL,
    tx_type character varying(32) NOT NULL,
    tx_ids character varying(65535) NOT NULL,
    unique_account_count integer NOT NULL,
    detected_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


-- ALTER TABLE public.aml_multi_bank_account_fiat_tx_user OWNER TO master;

--
-- Name: glue_aml_dormant_fiat_withdrawal_detection; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_aml_dormant_fiat_withdrawal_detection CASCADE;
CREATE TABLE public.glue_aml_dormant_fiat_withdrawal_detection (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    fiat_withdrawal_id bigint NOT NULL,
    amount numeric(34,20),
    fee numeric(34,20),
    comment character varying(1020),
    apply_no character varying(1020),
    last_fiat_withdrawal_id bigint NOT NULL,
    last_fiat_withdrawal_at timestamp without time zone NOT NULL,
    bank_id bigint,
    bank_name_kana character varying(1020),
    bank_name character varying(1020),
    branch_name_kana character varying(1020),
    branch_name character varying(1020),
    bank_account_id bigint,
    bank_account_name character varying(1020),
    bank_account_number character varying(1020),
    created_by character varying(1020),
    updated_by character varying(1020),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


-- ALTER TABLE public.glue_aml_dormant_fiat_withdrawal_detection OWNER TO master;

--
-- Name: glue_aml_high_frequency_fiat_tx_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_aml_high_frequency_fiat_tx_user CASCADE;
CREATE TABLE public.glue_aml_high_frequency_fiat_tx_user (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    detect_date_jst date NOT NULL,
    deposit_count integer DEFAULT 0 NOT NULL,
    withdrawal_count integer DEFAULT 0 NOT NULL,
    detected_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


-- ALTER TABLE public.glue_aml_high_frequency_fiat_tx_user OWNER TO master;

--
-- Name: glue_aml_same_email_prefix_daily_log; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_aml_same_email_prefix_daily_log CASCADE;
CREATE TABLE public.glue_aml_same_email_prefix_daily_log (
    id bigint NOT NULL,
    target_date date NOT NULL,
    local_prefix character varying(64) NOT NULL,
    user_id bigint NOT NULL,
    email character varying(1020) NOT NULL,
    created_at timestamp without time zone NOT NULL
);


-- ALTER TABLE public.glue_aml_same_email_prefix_daily_log OWNER TO master;

--
-- Name: glue_asset; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_asset CASCADE;
CREATE TABLE public.glue_asset (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    currency character varying(128) NOT NULL,
    onhand_amount numeric(34,20) NOT NULL,
    locked_amount numeric(34,20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_asset OWNER TO master;

--
-- Name: glue_asset_summary; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_asset_summary CASCADE;
CREATE TABLE public.glue_asset_summary (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    target_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    currency character varying(128) NOT NULL,
    current_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    jpy_conversion numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    deposit_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    deposit_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    deposit_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    deposit_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    withdrawal_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    withdrawal_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    withdrawal_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    withdrawal_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    transaction_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    transaction_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    spot_trade_buy_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    spot_trade_buy_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    spot_trade_sell_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    spot_trade_sell_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    spot_trade_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    spot_trade_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    pos_trade_buy_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    pos_trade_buy_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    pos_trade_sell_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    pos_trade_sell_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    pos_trade_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    pos_trade_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    staking_lock_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    expiration_not_continue_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    expiration_not_continue_reward numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    expiration_continue_reward numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    cancel_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    staking_lock_amount_sum numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    asset_transfer_in_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    asset_transfer_in_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    asset_transfer_out_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    asset_transfer_out_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    forced_transfer_in_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    forced_transfer_in_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    forced_transfer_out_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    forced_transfer_out_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL
);


-- ALTER TABLE public.glue_asset_summary OWNER TO master;

--
-- Name: glue_asset_transfer; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_asset_transfer CASCADE;
CREATE TABLE public.glue_asset_transfer (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    invest_user_id bigint,
    user_id bigint NOT NULL,
    currency character varying(128) NOT NULL,
    transfer_direction character varying(50) NOT NULL,
    transfer_type character varying(50) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20),
    transfer_buy_price numeric(34,20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_asset_transfer OWNER TO master;

--
-- Name: glue_bank; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_bank CASCADE;
CREATE TABLE public.glue_bank (
    id bigint NOT NULL,
    bank_code smallint NOT NULL,
    branch_code smallint NOT NULL,
    bank_name_kana character varying(255) NOT NULL,
    bank_name character varying(255) NOT NULL,
    branch_name_kana character varying(255) NOT NULL,
    branch_name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_bank OWNER TO master;

--
-- Name: glue_bank_account; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_bank_account CASCADE;
CREATE TABLE public.glue_bank_account (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    bank_id bigint NOT NULL,
    account_type character varying(128) NOT NULL,
    account_number character varying(255) NOT NULL,
    account_name character varying(255) NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_bank_account OWNER TO master;

--
-- Name: glue_choice_p_withdrawal; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_choice_p_withdrawal CASCADE;
CREATE TABLE public.glue_choice_p_withdrawal (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    target_user_id bigint NOT NULL,
    amount numeric(15,2) NOT NULL,
    withdraw_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    withdraw_type character varying(16) NOT NULL,
    description character varying(256),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_choice_p_withdrawal OWNER TO master;

--
-- Name: glue_currency_config; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_currency_config CASCADE;
CREATE TABLE public.glue_currency_config (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    trade_type character varying(128) NOT NULL,
    currency character varying(128) NOT NULL,
    deposit_fee numeric(34,20) NOT NULL,
    withdrawal_fee numeric(34,20) NOT NULL,
    transaction_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    max_order_amount_per_day numeric(24,10) NOT NULL,
    min_deposit_amount numeric(34,20) NOT NULL,
    min_withdrawal_amount numeric(34,20) NOT NULL,
    depositable boolean NOT NULL,
    withdrawable boolean NOT NULL,
    enabled boolean NOT NULL,
    firstsetflg boolean DEFAULT false NOT NULL,
    visible boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    stakeable boolean DEFAULT false NOT NULL,
    display_order integer NOT NULL
);


-- ALTER TABLE public.glue_currency_config OWNER TO master;

--
-- Name: glue_currency_pair_config; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_currency_pair_config CASCADE;
CREATE TABLE public.glue_currency_pair_config (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    trade_type character varying(128) NOT NULL,
    currency_pair character varying(128) NOT NULL,
    min_order_amount numeric(34,20),
    max_order_amount numeric(34,20),
    max_active_order_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    limit_price_range_rate numeric(34,20),
    market_price_range_rate numeric(34,20),
    market_amount_range_rate numeric(34,20),
    maker_trade_fee_percent numeric(34,20) NOT NULL,
    taker_trade_fee_percent numeric(34,20) NOT NULL,
    tradable boolean NOT NULL,
    enabled boolean NOT NULL,
    circuit_break_updated_at timestamp without time zone,
    circuit_break_percent numeric(34,20),
    circuit_break_check_timespan bigint,
    circuit_break_stop_timespan bigint,
    simple_market_spread_percent numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    simple_market_fee_percent numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    spike_percent numeric(34,20),
    spike_minutes integer,
    spike_count integer,
    wash_trading_check_span_hours integer DEFAULT 12 NOT NULL,
    wash_trading_percent_threshold numeric(34,20) DEFAULT 0.25000000000000000000 NOT NULL,
    same_ip_check_span_hours integer DEFAULT 1 NOT NULL,
    same_ip_threshold integer DEFAULT 3 NOT NULL,
    high_value_trader_check_span_hours integer DEFAULT 12 NOT NULL,
    high_value_trader_pos_order_limit_amount_threshold numeric(34,20) DEFAULT 1000000.00000000000000000000 NOT NULL,
    high_value_trader_pos_trade_market_amount_threshold numeric(34,20) DEFAULT 1000000.00000000000000000000 NOT NULL,
    high_value_trader_count_threshold integer DEFAULT 3 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    pos_spread_percent numeric(34,20),
    pos_slippage_percent numeric(34,20),
    spoofing_check_span_hours integer DEFAULT 12 NOT NULL,
    canceled_orders_percent_threshold numeric(34,20) DEFAULT 94.00000000000000000000 NOT NULL,
    pos_spread_percent_buy numeric(34,20),
    pos_spread_percent_sell numeric(34,20)
);


-- ALTER TABLE public.glue_currency_pair_config OWNER TO master;

--
-- Name: glue_deposit; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_deposit CASCADE;
CREATE TABLE public.glue_deposit (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    currency character varying(128) NOT NULL,
    deposit_account_id bigint NOT NULL,
    deposit_channel character varying(128) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    deposit_type character varying(128),
    deposit_purpose character varying(128),
    amount numeric(34,20) NOT NULL,
    asset_amount numeric(24,10),
    fee numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20),
    address character varying(255) NOT NULL,
    transaction_id character varying(255),
    distinction character varying(128) DEFAULT 'IN'::character varying,
    transaction_index bigint,
    deposit_status character varying(128) NOT NULL,
    comment character varying(2000),
    ownertype character varying(255),
    recipienttype character varying(255),
    last_name character varying(255),
    first_name character varying(255),
    last_name_kana character varying(255),
    first_name_kana character varying(255),
    last_name_english character varying(255),
    first_name_english character varying(255),
    legalname character varying(255),
    legalname_kana character varying(255),
    legalname_english character varying(255),
    addresstype character varying(255),
    exchange character varying(255),
    area character varying(255),
    aregion character varying(255),
    purpose character varying(255),
    risk_score integer,
    transaction_hash character varying(255),
    sygna_tx_id character varying(255),
    sanction_match boolean DEFAULT false NOT NULL,
    sygna_notify_flg character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    chainalysis_external_id character varying(100),
    chainalysis_max_alert_level character varying(100),
    memo character varying(50)
);


-- ALTER TABLE public.glue_deposit OWNER TO master;

--
-- Name: glue_deposit_account; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_deposit_account CASCADE;
CREATE TABLE public.glue_deposit_account (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    currency character varying(128) NOT NULL,
    address character varying(255) NOT NULL,
    destination_tag bigint,
    enabled boolean NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    vault_account_id bigint
);


-- ALTER TABLE public.glue_deposit_account OWNER TO master;

--
-- Name: glue_email_change_summary; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_email_change_summary CASCADE;
CREATE TABLE public.glue_email_change_summary (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    event_end_at timestamp without time zone NOT NULL,
    original_email character varying(1020) NOT NULL,
    changed_emails character varying(65535),
    change_count integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


-- ALTER TABLE public.glue_email_change_summary OWNER TO master;

--
-- Name: glue_excessive_deposit_user_by_one_time; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_excessive_deposit_user_by_one_time CASCADE;
CREATE TABLE public.glue_excessive_deposit_user_by_one_time (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    target_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id bigint NOT NULL,
    email character varying(255) NOT NULL,
    currency character varying(128),
    amount numeric(34,20) NOT NULL,
    financial_assets integer NOT NULL,
    income integer NOT NULL,
    tms_status character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_excessive_deposit_user_by_one_time OWNER TO master;

--
-- Name: glue_excessive_deposit_user_by_period; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_excessive_deposit_user_by_period CASCADE;
CREATE TABLE public.glue_excessive_deposit_user_by_period (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    target_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id bigint NOT NULL,
    email character varying(255) NOT NULL,
    amount numeric(34,20) NOT NULL,
    financial_assets integer NOT NULL,
    income integer NOT NULL,
    tms_status character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_excessive_deposit_user_by_period OWNER TO master;

--
-- Name: glue_exchange_and_invest_asset_summary; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_exchange_and_invest_asset_summary CASCADE;
CREATE TABLE public.glue_exchange_and_invest_asset_summary (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint,
    user_name character varying(255),
    user_investment_id bigint,
    target_at timestamp without time zone,
    currency character varying(20),
    current_amount numeric(34,20),
    jpy_conversion numeric(34,20),
    deposit_amount numeric(34,20),
    deposit_amount_jpy numeric(34,20),
    deposit_fee numeric(34,20),
    deposit_fee_jpy numeric(34,20),
    withdrawal_amount numeric(34,20),
    withdrawal_amount_jpy numeric(34,20),
    withdrawal_fee numeric(34,20),
    withdrawal_fee_jpy numeric(34,20),
    spot_trade_buy_amount numeric(34,20),
    spot_trade_buy_amount_jpy numeric(34,20),
    spot_trade_sell_amount numeric(34,20),
    spot_trade_sell_amount_jpy numeric(34,20),
    spot_trade_fee numeric(34,20),
    spot_trade_fee_jpy numeric(34,20),
    pos_trade_buy_amount numeric(34,20),
    pos_trade_buy_amount_jpy numeric(34,20),
    pos_trade_sell_amount numeric(34,20),
    pos_trade_sell_amount_jpy numeric(34,20),
    pos_trade_fee numeric(34,20),
    pos_trade_fee_jpy numeric(34,20),
    expiration_not_continue_reward numeric(34,20),
    expiration_continue_reward numeric(34,20),
    asset_transfer_in_amount numeric(34,20),
    asset_transfer_in_amount_jpy numeric(34,20),
    asset_transfer_out_amount numeric(34,20),
    asset_transfer_out_amount_jpy numeric(34,20),
    transaction_type character varying(30),
    invest_trade_buy_amount numeric(34,20),
    invest_trade_buy_amount_jpy numeric(34,20),
    invest_trade_sell_amount numeric(34,20),
    invest_trade_sell_amount_jpy numeric(34,20),
    invest_trade_fee numeric(34,20),
    invest_trade_fee_jpy numeric(34,20),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_exchange_and_invest_asset_summary OWNER TO master;

--
-- Name: glue_invest_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_invest_user CASCADE;
CREATE TABLE public.glue_invest_user (
    id bigint NOT NULL,
    user_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    partner_id bigint,
    partner_member_id character varying(255)
);


-- ALTER TABLE public.glue_invest_user OWNER TO master;

--
-- Name: glue_point_asset; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_point_asset CASCADE;
CREATE TABLE public.glue_point_asset (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    currency character varying(128) NOT NULL,
    onhand_amount numeric(34,20) NOT NULL,
    locked_amount numeric(34,20) NOT NULL,
    eval_profit_loss_amt numeric(34,20),
    eval_profit_loss_amt_rate numeric(34,20),
    avg_acq_unit_price numeric(34,20),
    asset_total numeric(34,20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_point_asset OWNER TO master;

--
-- Name: glue_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_user CASCADE;
CREATE TABLE public.glue_user (
    id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    email character varying(255),
    password character varying(255),
    anti_phishing_code character varying(255),
    account_non_expired boolean,
    account_non_locked boolean,
    credentials_non_expired boolean,
    enabled boolean,
    user_status character varying(128) DEFAULT 'ACTIVE'::character varying,
    kyc_status character varying(128) DEFAULT 'NONE'::character varying,
    user_kyc_id bigint,
    level integer DEFAULT 1,
    user_info_id bigint,
    user_info_corporate_id bigint,
    old_user_id integer,
    inside_account_flg boolean DEFAULT false,
    trade_uncapped boolean DEFAULT false,
    insider boolean DEFAULT false,
    risker boolean DEFAULT false,
    session_id character varying(128),
    affiliate_info_id bigint,
    uuid character varying(128),
    case_id bigint DEFAULT 0,
    case_system_id bigint,
    test_data_flag character varying(50),
    market_maker_flg boolean DEFAULT false,
    account_opened_at timestamp without time zone,
    is_monitoring_target boolean DEFAULT false
);


-- ALTER TABLE public.glue_user OWNER TO master;

--
-- Name: glue_exchange_and_invest_user_all_asset_view; Type: VIEW; Schema: public; Owner: master
--

DROP VIEW IF EXISTS public.glue_exchange_and_invest_user_all_asset_view CASCADE;
CREATE VIEW public.glue_exchange_and_invest_user_all_asset_view AS
SELECT pg_catalog.row_number() OVER( ) AS id, u.email, u.user_id, u.invest_user_id, combined_assets.currency, "max"(combined_assets.onhand_amount) AS onhand_amount, "max"(combined_assets.point_onhand_amount) AS point_onhand_amount, "max"(combined_assets.locked_amount) AS locked_amount, "max"(combined_assets.point_locked_amount) AS point_locked_amount, CURRENT_TIMESTAMP AS created_at, CURRENT_TIMESTAMP AS updated_at FROM ((SELECT gu.id AS user_id, min(iu.id) AS invest_user_id, gu.email FROM (public.glue_user gu LEFT JOIN public.glue_invest_user iu ON ((gu.id = iu.user_id))) GROUP BY gu.id, gu.email) u LEFT JOIN (SELECT a.user_id, a.currency, a.onhand_amount, NULL::numeric AS point_onhand_amount, a.locked_amount, NULL::numeric AS point_locked_amount FROM public.glue_asset a UNION ALL SELECT iu.user_id, pa.currency, NULL::numeric, pa.onhand_amount, NULL::numeric, pa.locked_amount FROM (public.glue_point_asset pa JOIN public.glue_invest_user iu ON ((pa.user_id = iu.id)))) combined_assets ON ((u.user_id = combined_assets.user_id))) GROUP BY u.user_id, u.email, u.invest_user_id, combined_assets.currency;


-- ALTER TABLE public.glue_exchange_and_invest_user_all_asset_view OWNER TO master;

--
-- Name: glue_point_partner; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_point_partner CASCADE;
CREATE TABLE public.glue_point_partner (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    partner_number character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    effective_date timestamp without time zone NOT NULL,
    expiry_date timestamp without time zone NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    show_name character varying(255) NOT NULL,
    responsible_person character varying(255),
    phone_num character varying(255),
    mail character varying(255),
    address character varying(255),
    scope integer,
    website_url character varying(255),
    description character varying(65535),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255),
    updated_at timestamp without time zone,
    updated_by character varying(255)
);


-- ALTER TABLE public.glue_point_partner OWNER TO master;

--
-- Name: glue_point_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_point_user CASCADE;
CREATE TABLE public.glue_point_user (
    id bigint NOT NULL,
    invest_user_id bigint,
    partner_id bigint NOT NULL,
    partner_member_id character varying(255) NOT NULL,
    transfered_flag boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_point_user OWNER TO master;

--
-- Name: glue_user_antisocial_check; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_user_antisocial_check CASCADE;
CREATE TABLE public.glue_user_antisocial_check (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    kyc_flag character varying(1) NOT NULL,
    reference_id character varying(50) NOT NULL,
    case_system_id character varying(128),
    refinitiv_status character varying(20),
    check_group_key character varying(40) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_info_id bigint,
    user_info_corporate_id bigint
);


-- ALTER TABLE public.glue_user_antisocial_check OWNER TO master;

--
-- Name: glue_user_authority; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_user_authority CASCADE;
CREATE TABLE public.glue_user_authority (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    authority character varying(128) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_user_authority OWNER TO master;

--
-- Name: glue_user_info_corporate; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_user_info_corporate CASCADE;
CREATE TABLE public.glue_user_info_corporate (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    agent_id bigint,
    representative_id bigint,
    owner_ids character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    name_kana character varying(255) NOT NULL,
    established_year integer NOT NULL,
    established_month integer NOT NULL,
    established_day integer NOT NULL,
    accounting_month integer NOT NULL,
    zip_code character varying(255) NOT NULL,
    prefecture character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    building character varying(255),
    phone_number character varying(255) NOT NULL,
    business_content character varying(255) NOT NULL,
    sales integer NOT NULL,
    financial_assets integer NOT NULL,
    purpose integer NOT NULL,
    investment_purposes integer NOT NULL,
    application_history integer NOT NULL,
    application_history_other character varying(255),
    person_except_representative boolean NOT NULL,
    ultimate_beneficial_ownership boolean NOT NULL,
    crypto_experience integer NOT NULL,
    fx_experience integer NOT NULL,
    stocks_experience integer NOT NULL,
    fund_experience integer NOT NULL,
    foreign_peps boolean NOT NULL,
    insider boolean DEFAULT false NOT NULL,
    risk_type character varying(2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_user_info_corporate OWNER TO master;

--
-- Name: glue_user_kyc; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_user_kyc CASCADE;
CREATE TABLE public.glue_user_kyc (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    kyc_type character varying(128) DEFAULT 'NONE'::character varying NOT NULL,
    kyc_status character varying(128) DEFAULT 'NONE'::character varying NOT NULL,
    kyc_mail_status character varying(128) DEFAULT 'NONE'::character varying NOT NULL,
    mail_send_at timestamp without time zone,
    judging_comment character varying(2000),
    aml_cft_comment character varying(2000),
    antisocial_status character varying(128) DEFAULT 'NONE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    operator character varying(16),
    user_info_id bigint,
    user_info_corporate_id bigint,
    email character varying(255),
    change_type character varying(2),
    test_data_flag character varying(50)
);


-- ALTER TABLE public.glue_user_kyc OWNER TO master;

--
-- Name: glue_user_mail_config; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_user_mail_config CASCADE;
CREATE TABLE public.glue_user_mail_config (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    mail_type character varying(100) NOT NULL,
    is_checked boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


-- ALTER TABLE public.glue_user_mail_config OWNER TO master;

--
-- Name: glue_exchange_and_point_and_invest_user_view; Type: VIEW; Schema: public; Owner: master
--

DROP VIEW IF EXISTS public.glue_exchange_and_point_and_invest_user_view CASCADE;
CREATE VIEW public.glue_exchange_and_point_and_invest_user_view AS
SELECT pg_catalog.row_number() OVER( ) AS id, t.user_id, t.old_user_id, t.user_info_id, t.account_opened_at, t.invest_user_id, t.point_user_id, t.point_user_updated_at, t.partner_member, t.partner_name, t.partner_member_id, t.first_name, t.last_name, t.user_info_corporate_id, t.representative_id, t.agent_id, t.corporate_name, t.corporate_name_kana, t.owner_ids, t.email, t.user_status, t.kyc_status, t.kyc_antisocial_status, t.kyc_updated_at, t.insider, t.inside_account_flg, t.market_maker_flg, t.created_at, t.updated_at, t.invest_user_id_created_at, t.point_user_id_created_at, t.authority, t.first_kana, t.last_kana, t.nationality, t.zip_code, t.prefecture, t.city, t.address, t.building, t.birthday, t.gender, t.country, t.phone_number, t.occupation, t.work_place, t."position", t.antisocial_status, t.residence_status, t.residence_card_expired_at, t.income, t.financial_assets, t.purpose, t.investment_purposes, t.crypto_experience, t.fx_experience, t.stocks_experience, t.fund_experience, t.application_history, t.application_history_other, t.foreign_peps, t.industry, t.ui_created_at, t.ui_updated_at, t.established_year, t.established_month, t.established_day, t.accounting_month, t.business_content, t.pricefrom, t.sales, t.ultimate_beneficial_ownership, t.umc_id, t.is_checked, t.umc_updated_at, t.user_antisocial_check_id, t.case_system_id, t.account_non_locked, t.user_id_created_at FROM (SELECT u.id AS user_id, u.old_user_id, u.user_info_id, u.account_opened_at, iu.id AS invest_user_id, pu.id AS point_user_id, pu.updated_at AS point_user_updated_at, pp.partner_number AS partner_member, pp.name AS partner_name, iu.partner_member_id, ui.first_name, ui.last_name, u.user_info_corporate_id, uic.representative_id, uic.agent_id, uic.name AS corporate_name, uic.name_kana AS corporate_name_kana, uic.owner_ids, u.email, u.user_status, u.kyc_status, uk.antisocial_status AS kyc_antisocial_status, uk.updated_at AS kyc_updated_at, u.insider, u.inside_account_flg, u.market_maker_flg, u.created_at, u.updated_at, iu.created_at AS invest_user_id_created_at, pu.created_at AS point_user_id_created_at, au.authority, ui.first_kana, ui.last_kana, ui.nationality, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.zip_code ELSE ui.zip_code END AS zip_code, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.prefecture ELSE ui.prefecture END AS prefecture, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.city ELSE ui.city END AS city, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.address ELSE ui.address END AS address, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.building ELSE ui.building END AS building, ui.birthday, ui.gender, ui.country, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.phone_number ELSE ui.phone_number END AS phone_number, ui.occupation, ui.work_place, ui."position", CASE WHEN ((ui.antisocial_status)::text = ''::text) THEN NULL::character varying ELSE ui.antisocial_status END AS antisocial_status, ui.residence_status, ui.residence_card_expired_at, ui.income, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.financial_assets ELSE ui.financial_assets END AS financial_assets, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.purpose ELSE ui.purpose END AS purpose, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.investment_purposes ELSE ui.investment_purposes END AS investment_purposes, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.crypto_experience ELSE ui.crypto_experience END AS crypto_experience, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.fx_experience ELSE ui.fx_experience END AS fx_experience, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.stocks_experience ELSE ui.stocks_experience END AS stocks_experience, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.fund_experience ELSE ui.fund_experience END AS fund_experience, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.application_history ELSE ui.application_history END AS application_history, CASE WHEN ((au.authority)::text = 'CORPORATE'::text) THEN uic.application_history_other ELSE ui.application_history_other END AS application_history_other, COALESCE(ui.foreign_peps, false) AS foreign_peps, ui.industry, ui.created_at AS ui_created_at, ui.updated_at AS ui_updated_at, uic.established_year, uic.established_month, uic.established_day, uic.accounting_month, uic.business_content, ui.pricefrom, uic.sales, uic.ultimate_beneficial_ownership, umc.id AS umc_id, umc.is_checked, umc.updated_at AS umc_updated_at, uac.id AS user_antisocial_check_id, uac.case_system_id, u.account_non_locked, u.created_at AS user_id_created_at FROM (((((((((public.glue_user u LEFT JOIN public.glue_user_authority au ON ((au.user_id = u.id))) LEFT JOIN (SELECT glue_user_info_corporate.id, glue_user_info_corporate.user_id, glue_user_info_corporate.agent_id, glue_user_info_corporate.representative_id, glue_user_info_corporate.owner_ids, glue_user_info_corporate.name, glue_user_info_corporate.name_kana, glue_user_info_corporate.established_year, glue_user_info_corporate.established_month, glue_user_info_corporate.established_day, glue_user_info_corporate.accounting_month, glue_user_info_corporate.zip_code, glue_user_info_corporate.prefecture, glue_user_info_corporate.city, glue_user_info_corporate.address, glue_user_info_corporate.building, glue_user_info_corporate.phone_number, glue_user_info_corporate.business_content, glue_user_info_corporate.sales, glue_user_info_corporate.financial_assets, glue_user_info_corporate.purpose, glue_user_info_corporate.investment_purposes, glue_user_info_corporate.application_history, glue_user_info_corporate.application_history_other, glue_user_info_corporate.person_except_representative, glue_user_info_corporate.ultimate_beneficial_ownership, glue_user_info_corporate.crypto_experience, glue_user_info_corporate.fx_experience, glue_user_info_corporate.stocks_experience, glue_user_info_corporate.fund_experience, glue_user_info_corporate.foreign_peps, glue_user_info_corporate.insider, glue_user_info_corporate.risk_type, glue_user_info_corporate.created_at, glue_user_info_corporate.updated_at, pg_catalog.row_number() OVER(  PARTITION BY glue_user_info_corporate.user_id ORDER BY glue_user_info_corporate.created_at DESC) AS rn FROM public.glue_user_info_corporate) uic ON (((uic.user_id = u.id) AND (uic.rn = 1)))) LEFT JOIN (SELECT glue_user_info.id, glue_user_info.user_id, glue_user_info.first_name, glue_user_info.last_name, glue_user_info.first_kana, glue_user_info.last_kana, glue_user_info.nationality, glue_user_info.zip_code, glue_user_info.prefecture, glue_user_info.city, glue_user_info.address, glue_user_info.building, glue_user_info.birthday, glue_user_info.gender, glue_user_info.phone_number, glue_user_info.occupation, glue_user_info.industry, glue_user_info.work_place, glue_user_info."position", glue_user_info.pricefrom, glue_user_info.income, glue_user_info.financial_assets, glue_user_info.purpose, glue_user_info.investment_purposes, glue_user_info.crypto_experience, glue_user_info.fx_experience, glue_user_info.stocks_experience, glue_user_info.fund_experience, glue_user_info.application_history, glue_user_info.application_history_other, glue_user_info.foreign_peps, glue_user_info.country, glue_user_info.antisocial_status, glue_user_info.residence_status, glue_user_info.residence_card_expired_at, glue_user_info.insider, glue_user_info.risk_type, glue_user_info.created_at, glue_user_info.updated_at, glue_user_info.residence_card_validity, pg_catalog.row_number() OVER(  PARTITION BY glue_user_info.user_id ORDER BY glue_user_info.created_at DESC) AS rn FROM public.glue_user_info) ui ON (((ui.user_id = u.id) AND (ui.rn = 1)))) LEFT JOIN public.glue_invest_user iu ON ((iu.user_id = u.id))) LEFT JOIN public.glue_point_user pu ON ((pu.invest_user_id = iu.id))) LEFT JOIN public.glue_point_partner pp ON ((pp.id = pu.partner_id))) LEFT JOIN public.glue_user_kyc uk ON ((uk.id = u.user_kyc_id))) LEFT JOIN (SELECT glue_user_mail_config.id, glue_user_mail_config.user_id, glue_user_mail_config.mail_type, glue_user_mail_config.is_checked, glue_user_mail_config.created_at, glue_user_mail_config.updated_at FROM public.glue_user_mail_config WHERE ((glue_user_mail_config.mail_type)::text = 'RECEIVE_CAMPAIGN_EMAIL'::text)) umc ON ((umc.user_id = u.id))) LEFT JOIN public.glue_user_antisocial_check uac ON ((uac.id = u.case_system_id))) UNION ALL SELECT NULL::bigint AS user_id, NULL::integer AS old_user_id, NULL::bigint AS user_info_id, NULL::timestamp without time zone AS account_opened_at, pu.invest_user_id, pu.id AS point_user_id, pu.updated_at AS point_user_updated_at, pp.partner_number AS partner_member, pp.name AS partner_name, pu.partner_member_id, NULL::character varying AS first_name, NULL::character varying AS last_name, NULL::bigint AS user_info_corporate_id, NULL::bigint AS representative_id, NULL::bigint AS agent_id, NULL::character varying AS corporate_name, NULL::character varying AS corporate_name_kana, NULL::character varying AS owner_ids, NULL::character varying AS email, NULL::character varying AS user_status, NULL::character varying AS kyc_status, NULL::character varying AS kyc_antisocial_status, NULL::timestamp without time zone AS kyc_updated_at, NULL::boolean AS insider, NULL::boolean AS inside_account_flg, NULL::boolean AS market_maker_flg, pu.created_at, pu.updated_at, NULL::timestamp without time zone AS invest_user_id_created_at, pu.created_at AS point_user_id_created_at, NULL::character varying AS authority, NULL::character varying AS first_kana, NULL::character varying AS last_kana, NULL::character varying AS nationality, NULL::character varying AS zip_code, NULL::character varying AS prefecture, NULL::character varying AS city, NULL::character varying AS address, NULL::character varying AS building, NULL::character varying AS birthday, NULL::integer AS gender, NULL::character varying AS country, NULL::character varying AS phone_number, NULL::integer AS occupation, NULL::character varying AS work_place, NULL::character varying AS "position", NULL::character varying AS antisocial_status, NULL::integer AS residence_status, NULL::timestamp without time zone AS residence_card_expired_at, NULL::integer AS income, NULL::integer AS financial_assets, NULL::integer AS purpose, NULL::integer AS investment_purposes, NULL::integer AS crypto_experience, NULL::integer AS fx_experience, NULL::integer AS stocks_experience, NULL::integer AS fund_experience, NULL::integer AS application_history, NULL::character varying AS application_history_other, false AS foreign_peps, NULL::integer AS industry, NULL::timestamp without time zone AS ui_created_at, NULL::timestamp without time zone AS ui_updated_at, NULL::integer AS established_year, NULL::integer AS established_month, NULL::integer AS established_day, NULL::integer AS accounting_month, NULL::character varying AS business_content, NULL::integer AS pricefrom, NULL::integer AS sales, NULL::boolean AS ultimate_beneficial_ownership, NULL::bigint AS umc_id, NULL::boolean AS is_checked, NULL::timestamp without time zone AS umc_updated_at, NULL::bigint AS user_antisocial_check_id, NULL::character varying AS case_system_id, NULL::boolean AS account_non_locked, NULL::timestamp without time zone AS user_id_created_at FROM (public.glue_point_user pu LEFT JOIN public.glue_point_partner pp ON ((pp.id = pu.partner_id))) WHERE (pu.invest_user_id IS NULL)) t;


-- ALTER TABLE public.glue_exchange_and_point_and_invest_user_view OWNER TO master;

--
-- Name: glue_exchange_summary; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_exchange_summary CASCADE;
CREATE TABLE public.glue_exchange_summary (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    target_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    currency character varying(128) NOT NULL,
    current_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    jpy_conversion numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    deposit_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    deposit_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    deposit_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    deposit_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    withdrawal_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    withdrawal_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    withdrawal_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    withdrawal_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    transaction_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    transaction_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    exchange_spot_trade_buy_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    exchange_spot_trade_buy_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    exchange_spot_trade_sell_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    exchange_spot_trade_sell_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    exchange_spot_trade_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    exchange_spot_trade_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    simple_market_pos_trade_buy_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    simple_market_pos_trade_buy_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    simple_market_pos_trade_sell_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    simple_market_pos_trade_sell_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    simple_market_pos_trade_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    simple_market_pos_trade_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    simple_market_spot_trade_profit numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    simple_market_spot_trade_profit_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    staking_lock_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    expiration_not_continue_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    expiration_not_continue_reward numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    expiration_continue_reward numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    cancel_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    asset_transfer_in_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    asset_transfer_in_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    asset_transfer_out_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    asset_transfer_out_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    forced_transfer_in_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    forced_transfer_in_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    forced_transfer_out_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    forced_transfer_out_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL
);


-- ALTER TABLE public.glue_exchange_summary OWNER TO master;

--
-- Name: glue_failed_login_summary; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_failed_login_summary CASCADE;
CREATE TABLE public.glue_failed_login_summary (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    event_end_at timestamp without time zone NOT NULL,
    failure_count integer NOT NULL,
    ip_device_pairs character varying(65535) NOT NULL,
    last_successful_login_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


-- ALTER TABLE public.glue_failed_login_summary OWNER TO master;

--
-- Name: glue_fiat_deposit; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_fiat_deposit CASCADE;
CREATE TABLE public.glue_fiat_deposit (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    bank_account_id bigint,
    onetime_bank_account_id bigint,
    amount numeric(34,20) NOT NULL,
    fee numeric(34,20) NOT NULL,
    fiat_deposit_status character varying(512) NOT NULL,
    fiat_deposit_sub_status character varying(512),
    comment character varying(8000),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_fiat_deposit OWNER TO master;

--
-- Name: glue_fiat_withdrawal; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_fiat_withdrawal CASCADE;
CREATE TABLE public.glue_fiat_withdrawal (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    bank_account_id bigint NOT NULL,
    amount numeric(34,20) NOT NULL,
    fee numeric(34,20) NOT NULL,
    fiat_withdrawal_status character varying(512) NOT NULL,
    comment character varying(8000),
    apply_no character varying(1020),
    item_id character varying(1020),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(1020),
    updated_by character varying(1020)
);


-- ALTER TABLE public.glue_fiat_withdrawal OWNER TO master;

--
-- Name: glue_fiat_withdrawal_audit; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_fiat_withdrawal_audit CASCADE;
CREATE TABLE public.glue_fiat_withdrawal_audit (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    fiat_withdrawal_id bigint NOT NULL,
    status character varying(128) NOT NULL,
    created_by character varying(255) DEFAULT ''::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_fiat_withdrawal_audit OWNER TO master;

--
-- Name: glue_financial_assets_deviation_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_financial_assets_deviation_user CASCADE;
CREATE TABLE public.glue_financial_assets_deviation_user (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    trade_type character varying(255) DEFAULT 'SPOT'::character varying,
    over_trades integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_financial_assets_deviation_user OWNER TO master;

--
-- Name: glue_frequent_crypto_deposit_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_frequent_crypto_deposit_user CASCADE;
CREATE TABLE public.glue_frequent_crypto_deposit_user (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    target_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id bigint NOT NULL,
    deposit_count integer NOT NULL,
    tms_status character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_frequent_crypto_deposit_user OWNER TO master;

--
-- Name: glue_gmo_deposit; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_gmo_deposit CASCADE;
CREATE TABLE public.glue_gmo_deposit (
    id bigint NOT NULL,
    item_key character varying(200) NOT NULL,
    fiat_deposit_id bigint,
    transaction_date date NOT NULL,
    va_account_name_kana character varying(200),
    remitter_name_kana character varying(200),
    payment_bank_name character varying(200),
    payment_branch_name character varying(80),
    partner_name character varying(200),
    remarks character varying(1020),
    deposit_amount integer NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    va_id character varying(40) NOT NULL
);


-- ALTER TABLE public.glue_gmo_deposit OWNER TO master;

--
-- Name: glue_high_value_trader; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_high_value_trader CASCADE;
CREATE TABLE public.glue_high_value_trader (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    trade_type character varying(255) DEFAULT 'SPOT'::character varying,
    currency_pair character varying(255),
    spot_order_limits integer NOT NULL,
    spot_trade_markets integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_high_value_trader OWNER TO master;

--
-- Name: glue_ieo_details; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_ieo_details CASCADE;
CREATE TABLE public.glue_ieo_details (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    ieo_recruit_info_id bigint NOT NULL,
    apply_amount numeric(34,20) NOT NULL,
    win_amount numeric(34,20),
    ieo_detail_status character varying(128),
    ieo_channel character varying(128),
    operation character varying(128),
    comment character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(255),
    updated_by character varying(255)
);


-- ALTER TABLE public.glue_ieo_details OWNER TO master;

--
-- Name: glue_ieo_recruit_info; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_ieo_recruit_info CASCADE;
CREATE TABLE public.glue_ieo_recruit_info (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    deal character varying(255),
    branch_name_ticker character varying(255),
    branch_name_kana character varying(255),
    outline character varying(65535),
    recruit_date_from timestamp without time zone,
    recruit_date_to timestamp without time zone,
    raffle_date timestamp without time zone,
    quota_date_from timestamp without time zone,
    quota_date_to timestamp without time zone,
    bo_process_status character varying(255),
    sale_amount numeric(34,20),
    unit_price numeric(34,20),
    fee_ratio numeric(34,20),
    share_amount numeric(34,20),
    apply_shares_max numeric(34,20),
    apply_shares_min numeric(34,20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(255),
    updated_by character varying(255)
);


-- ALTER TABLE public.glue_ieo_recruit_info OWNER TO master;

--
-- Name: glue_ieo_user_elect_info; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_ieo_user_elect_info CASCADE;
CREATE TABLE public.glue_ieo_user_elect_info (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    ieo_recruit_info_id bigint NOT NULL,
    total_apply_amount numeric(34,20),
    total_elect_target_amount numeric(34,20),
    total_elect_win_amount numeric(34,20),
    apply_limit_amount numeric(34,20),
    income_financial_assets_limit_price numeric(34,20),
    has_change_elect_amount character varying(128),
    mail_status character varying(255),
    comment character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(255),
    updated_by character varying(255)
);


-- ALTER TABLE public.glue_ieo_user_elect_info OWNER TO master;

--
-- Name: glue_investment_purpose_deviation_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_investment_purpose_deviation_user CASCADE;
CREATE TABLE public.glue_investment_purpose_deviation_user (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    trade_type character varying(255) DEFAULT 'SPOT'::character varying,
    trades integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_investment_purpose_deviation_user OWNER TO master;

--
-- Name: glue_ip_tracking_concealment_jst; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_ip_tracking_concealment_jst CASCADE;
CREATE TABLE public.glue_ip_tracking_concealment_jst (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    detected_at timestamp without time zone NOT NULL,
    detection_date date NOT NULL,
    category character varying(128) NOT NULL,
    ip_address character varying(65535) NOT NULL,
    country character varying(65535),
    risk_score integer,
    vpn_cloud_name character varying(1020),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_ip_tracking_concealment_jst OWNER TO master;

--
-- Name: glue_multi_private_wallet_withdrawal_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_multi_private_wallet_withdrawal_user CASCADE;
CREATE TABLE public.glue_multi_private_wallet_withdrawal_user (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    target_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id bigint NOT NULL,
    tms_status character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_multi_private_wallet_withdrawal_user OWNER TO master;

--
-- Name: glue_paypay_deposit; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_paypay_deposit CASCADE;
CREATE TABLE public.glue_paypay_deposit (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    tran_id character(24) DEFAULT ''::bpchar NOT NULL,
    fiat_deposit_id bigint,
    data_kbn smallint NOT NULL,
    shokai_no integer NOT NULL,
    kanjo_date character(6) DEFAULT ''::bpchar NOT NULL,
    kisan_date character(6) DEFAULT ''::bpchar NOT NULL,
    amount integer NOT NULL,
    another_amount integer NOT NULL,
    output_code character(10) DEFAULT ''::bpchar NOT NULL,
    output_name character(48) DEFAULT ''::bpchar NOT NULL,
    rmt_bank_name character(15) DEFAULT ''::bpchar NOT NULL,
    rmt_br_name character(15) DEFAULT ''::bpchar NOT NULL,
    cancel_kind smallint NOT NULL,
    dummy character varying(52) DEFAULT ''::character varying NOT NULL,
    comment character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_paypay_deposit OWNER TO master;

--
-- Name: glue_point_asset_summary; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_point_asset_summary CASCADE;
CREATE TABLE public.glue_point_asset_summary (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    target_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    currency character varying(128) NOT NULL,
    current_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    jpy_conversion numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    deposit_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    deposit_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    deposit_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    deposit_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    withdrawal_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    withdrawal_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    withdrawal_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    withdrawal_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    transaction_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    transaction_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    pos_trade_buy_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    pos_trade_buy_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    pos_trade_sell_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    pos_trade_sell_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    pos_trade_fee numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    pos_trade_fee_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    expiration_not_continue_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    expiration_not_continue_reward numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    expiration_continue_reward numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    cancel_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    asset_transfer_in_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    asset_transfer_in_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    asset_transfer_out_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    asset_transfer_out_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    forced_transfer_in_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    forced_transfer_in_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    forced_transfer_out_amount numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL,
    forced_transfer_out_amount_jpy numeric(34,20) DEFAULT 0.00000000000000000000 NOT NULL
);


-- ALTER TABLE public.glue_point_asset_summary OWNER TO master;

--
-- Name: glue_point_transfer; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_point_transfer CASCADE;
CREATE TABLE public.glue_point_transfer (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    partner_id bigint NOT NULL,
    id_type character varying(50),
    transfer_type character varying(50) NOT NULL,
    amount numeric(34,20) NOT NULL,
    fee numeric(34,20),
    status character varying(50) NOT NULL,
    upload_status character varying(50),
    request_time timestamp without time zone,
    transfer_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    upload_time timestamp without time zone,
    trade_number character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_point_transfer OWNER TO master;

--
-- Name: glue_point_user_summary; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_point_user_summary CASCADE;
CREATE TABLE public.glue_point_user_summary (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    target_at timestamp without time zone,
    users integer NOT NULL,
    point_user_partner_active integer,
    point_user_partner_date integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_point_user_summary OWNER TO master;

--
-- Name: glue_pos_order; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_pos_order CASCADE;
CREATE TABLE public.glue_pos_order (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(512) NOT NULL,
    order_type character varying(512) NOT NULL,
    order_channel character varying(512) NOT NULL,
    mm_price numeric(34,20),
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    covered boolean NOT NULL,
    remaining_amount numeric(34,20) NOT NULL,
    order_status character varying(512) NOT NULL,
    order_operator character varying(512) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_pos_order OWNER TO master;

--
-- Name: glue_pos_trade; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_pos_trade CASCADE;
CREATE TABLE public.glue_pos_trade (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(512) NOT NULL,
    order_type character varying(512) NOT NULL,
    order_channel character varying(512) NOT NULL,
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20) NOT NULL,
    trade_action character varying(512) NOT NULL,
    order_id bigint NOT NULL,
    fee numeric(34,20) NOT NULL,
    asset_amount numeric(34,20) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_pos_trade OWNER TO master;

--
-- Name: glue_quick_crypto_to_jpy_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_quick_crypto_to_jpy_user CASCADE;
CREATE TABLE public.glue_quick_crypto_to_jpy_user (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    target_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id bigint NOT NULL,
    tms_status character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_quick_crypto_to_jpy_user OWNER TO master;

--
-- Name: glue_quick_crypto_transfer_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_quick_crypto_transfer_user CASCADE;
CREATE TABLE public.glue_quick_crypto_transfer_user (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    target_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id bigint NOT NULL,
    tms_status character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_quick_crypto_transfer_user OWNER TO master;

--
-- Name: glue_same_ip_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_same_ip_user CASCADE;
CREATE TABLE public.glue_same_ip_user (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    ip_address character varying(255) NOT NULL,
    user_ids character varying(65535) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    user_id_type character varying(50) DEFAULT 'Operate'::character varying NOT NULL
);


-- ALTER TABLE public.glue_same_ip_user OWNER TO master;

--
-- Name: glue_spot_order_ada_jpy; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_spot_order_ada_jpy CASCADE;
CREATE TABLE public.glue_spot_order_ada_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(512) NOT NULL,
    order_type character varying(512) NOT NULL,
    order_channel character varying(512) NOT NULL,
    price numeric(34,20),
    average_price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    remaining_amount numeric(34,20) NOT NULL,
    order_status character varying(512) NOT NULL,
    order_operator character varying(512) NOT NULL,
    post_only boolean NOT NULL,
    cancel_reason character varying(512),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_spot_order_ada_jpy OWNER TO master;

--
-- Name: glue_spot_order_nidt_jpy; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_spot_order_nidt_jpy CASCADE;
CREATE TABLE public.glue_spot_order_nidt_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(512) NOT NULL,
    order_type character varying(512) NOT NULL,
    order_channel character varying(512) NOT NULL,
    price numeric(34,20),
    average_price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    remaining_amount numeric(34,20) NOT NULL,
    order_status character varying(512) NOT NULL,
    order_operator character varying(512) NOT NULL,
    post_only boolean NOT NULL,
    cancel_reason character varying(512),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_spot_order_nidt_jpy OWNER TO master;

--
-- Name: glue_spot_trade_ada_jpy; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_spot_trade_ada_jpy CASCADE;
CREATE TABLE public.glue_spot_trade_ada_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(512) NOT NULL,
    order_type character varying(512) NOT NULL,
    order_channel character varying(512) NOT NULL,
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20) NOT NULL,
    trade_action character varying(512) NOT NULL,
    order_id bigint NOT NULL,
    fee numeric(34,20) NOT NULL,
    target_order_id bigint NOT NULL,
    target_user_id bigint NOT NULL,
    asset_amount numeric(34,20) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_spot_trade_ada_jpy OWNER TO master;

--
-- Name: glue_spot_trade_nidt_jpy; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_spot_trade_nidt_jpy CASCADE;
CREATE TABLE public.glue_spot_trade_nidt_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(512) NOT NULL,
    order_type character varying(512) NOT NULL,
    order_channel character varying(512) NOT NULL,
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20) NOT NULL,
    trade_action character varying(512) NOT NULL,
    order_id bigint NOT NULL,
    fee numeric(34,20) NOT NULL,
    target_order_id bigint NOT NULL,
    target_user_id bigint NOT NULL,
    asset_amount numeric(34,20) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_spot_trade_nidt_jpy OWNER TO master;

--
-- Name: glue_staking_apply_detail; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_staking_apply_detail CASCADE;
CREATE TABLE public.glue_staking_apply_detail (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    staking_info_id bigint NOT NULL,
    currency character varying(255) NOT NULL,
    apply_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    staking_date_plan timestamp without time zone,
    apply_amount numeric(34,20) NOT NULL,
    staking_status character varying(128),
    year_rate numeric(34,20),
    reward_accumulate numeric(34,20) NOT NULL,
    recent_reward_date timestamp without time zone,
    reward_start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expiration_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cancel_apply_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cancel_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cancel_disable_date_from timestamp without time zone,
    cancel_disable_date_to timestamp without time zone,
    amount_to_account numeric(34,20),
    amount_to_account_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    auto_continue boolean NOT NULL,
    staking_control_id bigint,
    relation_id bigint,
    auto_continue_num bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(255),
    updated_by character varying(255)
);


-- ALTER TABLE public.glue_staking_apply_detail OWNER TO master;

--
-- Name: glue_suspicious_login_distance; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_suspicious_login_distance CASCADE;
CREATE TABLE public.glue_suspicious_login_distance (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    detected_at timestamp without time zone NOT NULL,
    login_ip_address character varying(180) NOT NULL,
    registration_prefecture character varying(400),
    login_prefecture character varying(400),
    distance_km numeric(10,2) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_suspicious_login_distance OWNER TO master;

--
-- Name: glue_symbol; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_symbol CASCADE;
CREATE TABLE public.glue_symbol (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    trade_type character varying(128) NOT NULL,
    currency_pair character varying(128) NOT NULL,
    visible boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_symbol OWNER TO master;

--
-- Name: glue_system_config; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_system_config CASCADE;
CREATE TABLE public.glue_system_config (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    currency character varying(128),
    currency_pair character varying(128),
    name character varying(255) NOT NULL,
    value character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_system_config OWNER TO master;

--
-- Name: glue_uneconomical_crypto_deposit_user; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_uneconomical_crypto_deposit_user CASCADE;
CREATE TABLE public.glue_uneconomical_crypto_deposit_user (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    target_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id bigint NOT NULL,
    email character varying(255) NOT NULL,
    deposit_count integer NOT NULL,
    tms_status character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_uneconomical_crypto_deposit_user OWNER TO master;

--
-- Name: glue_user_info_corporate_agent; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_user_info_corporate_agent CASCADE;
CREATE TABLE public.glue_user_info_corporate_agent (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    first_kana character varying(255) NOT NULL,
    last_kana character varying(255) NOT NULL,
    "position" character varying(255) NOT NULL,
    nationality character varying(255) NOT NULL,
    zip_code character varying(255) NOT NULL,
    prefecture character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    building character varying(255),
    birthday character varying(255) NOT NULL,
    foreign_peps boolean NOT NULL,
    country character varying(128),
    phone_number character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    residence_status integer,
    residence_card_validity date
);


-- ALTER TABLE public.glue_user_info_corporate_agent OWNER TO master;

--
-- Name: glue_user_info_corporate_owner; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_user_info_corporate_owner CASCADE;
CREATE TABLE public.glue_user_info_corporate_owner (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    first_kana character varying(255) NOT NULL,
    last_kana character varying(255) NOT NULL,
    "position" character varying(255) NOT NULL,
    nationality character varying(255) NOT NULL,
    zip_code character varying(255) NOT NULL,
    prefecture character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    building character varying(255),
    birthday character varying(255) NOT NULL,
    foreign_peps boolean NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_user_info_corporate_owner OWNER TO master;

--
-- Name: glue_user_info_corporate_representative; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_user_info_corporate_representative CASCADE;
CREATE TABLE public.glue_user_info_corporate_representative (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    first_kana character varying(255) NOT NULL,
    last_kana character varying(255) NOT NULL,
    "position" character varying(255) NOT NULL,
    nationality character varying(255) NOT NULL,
    zip_code character varying(255) NOT NULL,
    prefecture character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    building character varying(255),
    birthday character varying(255) NOT NULL,
    gender integer,
    country character varying(128),
    phone_number character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    residence_status integer,
    residence_card_validity date
);


-- ALTER TABLE public.glue_user_info_corporate_representative OWNER TO master;

--
-- Name: glue_user_login_info; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_user_login_info CASCADE;
CREATE TABLE public.glue_user_login_info (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    ip_address character varying(255),
    in_japan boolean NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    user_id_type character varying(50) DEFAULT 'Operate'::character varying NOT NULL
);


-- ALTER TABLE public.glue_user_login_info OWNER TO master;

--
-- Name: glue_user_summary; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_user_summary CASCADE;
CREATE TABLE public.glue_user_summary (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    target_at timestamp without time zone,
    users integer NOT NULL,
    user_kyc_account_opening_done integer NOT NULL,
    user_kyc_done integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    account_opening_done bigint DEFAULT 0::bigint NOT NULL,
    corporate_personal_account_opening_done bigint DEFAULT 0::bigint NOT NULL,
    point_investment_registered_users bigint DEFAULT 0::bigint NOT NULL
);


-- ALTER TABLE public.glue_user_summary OWNER TO master;

--
-- Name: glue_wash_trader; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_wash_trader CASCADE;
CREATE TABLE public.glue_wash_trader (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    trades integer NOT NULL,
    targetuserids integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_wash_trader OWNER TO master;

--
-- Name: glue_withdrawal; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_withdrawal CASCADE;
CREATE TABLE public.glue_withdrawal (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    currency character varying(128) NOT NULL,
    withdrawal_channel character varying(128) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    withdrawal_type character varying(128),
    withdrawal_purpose character varying(128),
    amount numeric(34,20) NOT NULL,
    asset_amount numeric(24,10),
    withdrawal_fee numeric(34,20) NOT NULL,
    transaction_fee numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20),
    comment character varying(2000),
    sygna_tx_id character varying(255),
    sanction_match boolean DEFAULT false NOT NULL,
    email_protocol_flg boolean DEFAULT false NOT NULL,
    withdrawal_account_id bigint NOT NULL,
    address character varying(255) NOT NULL,
    transaction_id character varying(255),
    distinction character varying(128) DEFAULT 'OUT'::character varying,
    withdrawal_status character varying(128) NOT NULL,
    risk_score integer,
    failed_number integer DEFAULT 0 NOT NULL,
    transaction_hash character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(255),
    updated_by character varying(255),
    chainalysis_external_id character varying(100),
    chainalysis_max_alert_level character varying(100),
    memo character varying(50),
    external_wallet_id character varying(255)
);


-- ALTER TABLE public.glue_withdrawal OWNER TO master;

--
-- Name: glue_withdrawal_account; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_withdrawal_account CASCADE;
CREATE TABLE public.glue_withdrawal_account (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    user_id bigint NOT NULL,
    currency character varying(128) NOT NULL,
    label character varying(255),
    address character varying(255) NOT NULL,
    ownertype character varying(255),
    recipienttype character varying(255),
    last_name character varying(255),
    first_name character varying(255),
    last_name_kana character varying(255),
    first_name_kana character varying(255),
    last_name_english character varying(255),
    first_name_english character varying(255),
    legalname character varying(255),
    legalname_kana character varying(255),
    legalname_english character varying(255),
    addresstype character varying(255),
    exchange character varying(255),
    country character varying(255),
    area character varying(255),
    purpose character varying(255),
    destination_tag bigint,
    enabled boolean NOT NULL,
    distinction character varying(128) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_withdrawal_account OWNER TO master;

--
-- Name: glue_withdrawal_audit; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.glue_withdrawal_audit CASCADE;
CREATE TABLE public.glue_withdrawal_audit (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    withdrawal_id bigint NOT NULL,
    status character varying(128) DEFAULT ''::character varying NOT NULL,
    created_by character varying(255) DEFAULT ''::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.glue_withdrawal_audit OWNER TO master;

--
-- Name: point_pos_order; Type: TABLE; Schema: public; Owner: point
--

DROP TABLE IF EXISTS public.point_pos_order CASCADE;
CREATE TABLE public.point_pos_order (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20),
    mm_price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    remaining_amount numeric(34,20) NOT NULL,
    order_status character varying(255) NOT NULL,
    order_operator character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    covered boolean,
    notes character varying(128),
    id_type character varying(34),
    request_quote_asset numeric(34,20) DEFAULT 0 NOT NULL,
    used_quote_asset numeric(34,20) DEFAULT 0 NOT NULL,
    request_point_asset numeric(34,20) DEFAULT 0 NOT NULL,
    used_point_asset numeric(34,20) DEFAULT 0 NOT NULL,
    client_id character varying(36)
);


-- ALTER TABLE public.point_pos_order OWNER TO point;

--
-- Name: point_pos_trade; Type: TABLE; Schema: public; Owner: point
--

DROP TABLE IF EXISTS public.point_pos_trade CASCADE;
CREATE TABLE public.point_pos_trade (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20) DEFAULT 0 NOT NULL,
    trade_action character varying(255) NOT NULL,
    order_id bigint NOT NULL,
    fee numeric(34,20) NOT NULL,
    asset_amount numeric(34,20) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    id_type character varying(34),
    eval_profit_loss_amt numeric(34,20),
    eval_profit_loss_amt_rate numeric(34,20),
    avg_acq_unit_price numeric(34,20),
    income numeric(34,20),
    user_growth_stage_id integer DEFAULT 0,
    experience_points integer,
    notes character varying(128),
    request_quote_asset numeric(34,20) DEFAULT 0 NOT NULL,
    used_quote_asset numeric(34,20) DEFAULT 0 NOT NULL,
    request_point_asset numeric(34,20) DEFAULT 0 NOT NULL,
    used_point_asset numeric(34,20) DEFAULT 0 NOT NULL
);


-- ALTER TABLE public.point_pos_trade OWNER TO point;

--
-- Name: pos_best_price; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.pos_best_price CASCADE;
CREATE TABLE public.pos_best_price (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    symbol_id bigint NOT NULL,
    best_ask numeric(34,20) NOT NULL,
    best_bid numeric(34,20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    best_mm_ask numeric(34,20),
    best_mm_bid numeric(34,20),
    uuid character varying(36)
);


-- ALTER TABLE public.pos_best_price OWNER TO master;

--
-- Name: pos_order; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.pos_order CASCADE;
CREATE TABLE public.pos_order (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20),
    mm_price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    remaining_amount numeric(34,20) NOT NULL,
    order_status character varying(255) NOT NULL,
    order_operator character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    covered boolean
);


-- ALTER TABLE public.pos_order OWNER TO master;

--
-- Name: pos_trade; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.pos_trade CASCADE;
CREATE TABLE public.pos_trade (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20) DEFAULT 0 NOT NULL,
    trade_action character varying(255) NOT NULL,
    order_id bigint NOT NULL,
    fee numeric(34,20) NOT NULL,
    asset_amount numeric(34,20) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.pos_trade OWNER TO master;

--
-- Name: spot_best_price_ada_jpy; Type: TABLE; Schema: public; Owner: point
--

DROP TABLE IF EXISTS public.spot_best_price_ada_jpy CASCADE;
CREATE TABLE public.spot_best_price_ada_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    best_ask numeric(34,20) NOT NULL,
    best_bid numeric(34,20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.spot_best_price_ada_jpy OWNER TO point;

--
-- Name: spot_best_price_amber_ada_jpy; Type: TABLE; Schema: public; Owner: point
--

DROP TABLE IF EXISTS public.spot_best_price_amber_ada_jpy CASCADE;
CREATE TABLE public.spot_best_price_amber_ada_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    best_ask numeric(34,20) NOT NULL,
    best_bid numeric(34,20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.spot_best_price_amber_ada_jpy OWNER TO point;

--
-- Name: spot_best_price_nidt_jpy; Type: TABLE; Schema: public; Owner: point
--

DROP TABLE IF EXISTS public.spot_best_price_nidt_jpy CASCADE;
CREATE TABLE public.spot_best_price_nidt_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    best_ask numeric(34,20) NOT NULL,
    best_bid numeric(34,20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.spot_best_price_nidt_jpy OWNER TO point;

--
-- Name: spot_order_ada_jpy; Type: TABLE; Schema: public; Owner: point
--

DROP TABLE IF EXISTS public.spot_order_ada_jpy CASCADE;
CREATE TABLE public.spot_order_ada_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20),
    average_price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    remaining_amount numeric(34,20) NOT NULL,
    order_status character varying(255) NOT NULL,
    order_operator character varying(255) NOT NULL,
    post_only boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    cancel_reason character varying(128)
);


-- ALTER TABLE public.spot_order_ada_jpy OWNER TO point;

--
-- Name: spot_order_nidt_jpy; Type: TABLE; Schema: public; Owner: point
--

DROP TABLE IF EXISTS public.spot_order_nidt_jpy CASCADE;
CREATE TABLE public.spot_order_nidt_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20),
    average_price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    remaining_amount numeric(34,20) NOT NULL,
    order_status character varying(255) NOT NULL,
    order_operator character varying(255) NOT NULL,
    post_only boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    cancel_reason character varying(128)
);


-- ALTER TABLE public.spot_order_nidt_jpy OWNER TO point;

--
-- Name: spot_trade_ada_jpy; Type: TABLE; Schema: public; Owner: point
--

DROP TABLE IF EXISTS public.spot_trade_ada_jpy CASCADE;
CREATE TABLE public.spot_trade_ada_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20) DEFAULT 0 NOT NULL,
    trade_action character varying(255) NOT NULL,
    order_id bigint NOT NULL,
    fee numeric(34,20) NOT NULL,
    target_order_id bigint NOT NULL,
    target_user_id bigint DEFAULT 0 NOT NULL,
    asset_amount numeric(34,20) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.spot_trade_ada_jpy OWNER TO point;

--
-- Name: spot_trade_nidt_jpy; Type: TABLE; Schema: public; Owner: point
--

DROP TABLE IF EXISTS public.spot_trade_nidt_jpy CASCADE;
CREATE TABLE public.spot_trade_nidt_jpy (
    id bigint NOT NULL,
    symbol_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_side character varying(255) NOT NULL,
    order_type character varying(255) NOT NULL,
    order_channel character varying(255) DEFAULT 'UNKNOWN'::character varying NOT NULL,
    price numeric(34,20) NOT NULL,
    amount numeric(34,20) NOT NULL,
    jpy_conversion numeric(34,20) DEFAULT 0 NOT NULL,
    trade_action character varying(255) NOT NULL,
    order_id bigint NOT NULL,
    fee numeric(34,20) NOT NULL,
    target_order_id bigint NOT NULL,
    target_user_id bigint DEFAULT 0 NOT NULL,
    asset_amount numeric(34,20) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.spot_trade_nidt_jpy OWNER TO point;

--
-- Name: waf_blocked_access; Type: TABLE; Schema: public; Owner: master
--

DROP TABLE IF EXISTS public.waf_blocked_access CASCADE;
CREATE TABLE public.waf_blocked_access (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    client_ip character varying(45) NOT NULL,
    country character varying(10) NOT NULL,
    blocked_by_rule character varying(100) NOT NULL,
    request_uri character varying(2048),
    blocked_at timestamp without time zone NOT NULL,
    total_calls integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


-- ALTER TABLE public.waf_blocked_access OWNER TO master;

--
-- Data for Name: aml_same_email_prefix_daily_detection_jst; Type: TABLE DATA; Schema: point_dev_test; Owner: master
--

COPY point_dev_test.aml_same_email_prefix_daily_detection_jst (id, detection_date, local_prefix, detected_at, daily_count, created_at, updated_at) FROM stdin;
