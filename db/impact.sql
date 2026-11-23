-- Apply only to the intended Pondroot database, as owner.
-- Configure pg_cron for this database before enabling collection.
CREATE SCHEMA IF NOT EXISTS pondroot_impact;
CREATE TABLE IF NOT EXISTS pondroot_impact.contacts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL UNIQUE CHECK (length(email) BETWEEN 3 AND 254 AND email !~ '[\r\n]'),
 consent_version text NOT NULL CHECK (consent_version = 'impact-v1'),
 consented_at timestamptz NOT NULL DEFAULT now(),
 delete_after timestamptz NOT NULL DEFAULT now() + interval '89 days',
 CHECK (delete_after <= consented_at + interval '89 days')
);
CREATE TABLE IF NOT EXISTS pondroot_impact.cleanup_health(singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),last_success timestamptz NOT NULL);
CREATE OR REPLACE FUNCTION pondroot_impact.cleanup() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $fn$
DECLARE removed integer;
BEGIN
 DELETE FROM pondroot_impact.contacts WHERE delete_after <= now();
 GET DIAGNOSTICS removed = ROW_COUNT;
 INSERT INTO pondroot_impact.cleanup_health(singleton,last_success) VALUES(true,now()) ON CONFLICT(singleton) DO UPDATE SET last_success=excluded.last_success;
 RETURN removed;
END $fn$;
CREATE OR REPLACE FUNCTION pondroot_impact.collect(address text, version text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $fn$
BEGIN
 IF version <> 'impact-v1' OR length(address)>254 OR address !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Invalid request'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pondroot_impact.cleanup_health WHERE last_success > now()-interval '2 hours') THEN RAISE EXCEPTION 'Cleanup unavailable'; END IF;
 PERFORM pg_advisory_xact_lock(721622);
 IF (SELECT count(*) FROM pondroot_impact.contacts)>=1000 OR (SELECT count(*) FROM pondroot_impact.contacts WHERE consented_at > now()-interval '1 minute')>=30 THEN RAISE EXCEPTION 'Temporarily unavailable'; END IF;
 INSERT INTO pondroot_impact.contacts(email,consent_version) VALUES(lower(trim(address)),version) ON CONFLICT(email) DO NOTHING;
END $fn$;
CREATE OR REPLACE FUNCTION pondroot_impact.remove_contact(address text) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $fn$
DECLARE removed integer;
BEGIN DELETE FROM pondroot_impact.contacts WHERE email=lower(trim(address)); GET DIAGNOSTICS removed=ROW_COUNT; RETURN removed; END $fn$;
CREATE OR REPLACE FUNCTION pondroot_impact.take_for_followup(contact_id uuid) RETURNS TABLE(email text) LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $fn$
 DELETE FROM pondroot_impact.contacts WHERE id=contact_id AND delete_after>now() RETURNING email
$fn$;
REVOKE ALL ON SCHEMA pondroot_impact FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA pondroot_impact FROM PUBLIC;
-- The restricted app role must have no table privileges.
GRANT USAGE ON SCHEMA pondroot_impact TO pondroot_impact_app;
GRANT EXECUTE ON FUNCTION pondroot_impact.collect(text,text) TO pondroot_impact_app;
SELECT cron.schedule('pondroot-impact-cleanup','* * * * *','SELECT pondroot_impact.cleanup()');
