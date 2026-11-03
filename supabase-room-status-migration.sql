ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS status text;

DO $$
DECLARE
  booking_id_type text;
BEGIN
  SELECT format_type(attribute.atttypid, attribute.atttypmod)
  INTO booking_id_type
  FROM pg_attribute AS attribute
  WHERE attribute.attrelid = 'public.bookings'::regclass
    AND attribute.attname = 'id'
    AND NOT attribute.attisdropped;

  IF booking_id_type IS NULL THEN
    RAISE EXCEPTION 'Could not determine public.bookings.id type';
  END IF;

  EXECUTE format(
    'ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS current_booking_id %s',
    booking_id_type
  );
END;
$$;
