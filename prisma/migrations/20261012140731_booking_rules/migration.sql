CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "reservations"
ADD CONSTRAINT "end_after_start" CHECK ("end_time" > "start_time");

ALTER TABLE "reservations"
ADD CONSTRAINT "no_overlapping_reservations"
EXCLUDE USING gist (
  "resource_id" WITH =,
  tstzrange("start_time", "end_time") WITH &&
)
WHERE ("status" = 'CONFIRMED');