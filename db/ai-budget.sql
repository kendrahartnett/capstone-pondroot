-- Apply as owner to the intended development database. Keep the app role table-blind.
-- Conservative reservation: at most 20 calls and $1 reserved per UTC day,
-- with $0.05 reserved for each dispatch. Uncertain calls never release budget.
CREATE SCHEMA IF NOT EXISTS pondroot_ai;
CREATE TABLE IF NOT EXISTS pondroot_ai.periods (
 day date PRIMARY KEY,
 calls integer NOT NULL DEFAULT 0,
 reserved_microusd bigint NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS pondroot_ai.reservations (
 id uuid PRIMARY KEY,
 day date NOT NULL REFERENCES pondroot_ai.periods(day),
 reserved_at timestamptz NOT NULL DEFAULT now(),
 reserved_microusd bigint NOT NULL DEFAULT 50000
);
CREATE OR REPLACE FUNCTION pondroot_ai.reserve(request_id uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $fn$
DECLARE today date := (now() AT TIME ZONE 'UTC')::date;
BEGIN
 PERFORM pg_advisory_xact_lock(721623);
 IF EXISTS(SELECT 1 FROM pondroot_ai.reservations WHERE id=request_id) THEN RETURN false; END IF;
 IF (SELECT count(*) FROM pondroot_ai.reservations WHERE reserved_at>now()-interval '1 minute')>=3 THEN RETURN false; END IF;
 INSERT INTO pondroot_ai.periods(day) VALUES(today) ON CONFLICT(day) DO NOTHING;
 UPDATE pondroot_ai.periods SET calls=calls+1,reserved_microusd=reserved_microusd+50000
 WHERE day=today AND calls<20 AND reserved_microusd+50000<=1000000;
 IF NOT FOUND THEN RETURN false; END IF;
 INSERT INTO pondroot_ai.reservations(id,day) VALUES(request_id,today);
 RETURN true;
END $fn$;
CREATE OR REPLACE FUNCTION pondroot_ai.cleanup() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $fn$
DECLARE removed integer;
BEGIN
 DELETE FROM pondroot_ai.reservations WHERE reserved_at<now()-interval '90 days';
 GET DIAGNOSTICS removed=ROW_COUNT;
 DELETE FROM pondroot_ai.periods WHERE day<(now() AT TIME ZONE 'UTC')::date-90;
 RETURN removed;
END $fn$;
REVOKE ALL ON SCHEMA pondroot_ai FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA pondroot_ai FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA pondroot_ai FROM PUBLIC;
-- Create pondroot_ai_app with no table grants before applying this file.
GRANT USAGE ON SCHEMA pondroot_ai TO pondroot_ai_app;
GRANT EXECUTE ON FUNCTION pondroot_ai.reserve(uuid) TO pondroot_ai_app;
