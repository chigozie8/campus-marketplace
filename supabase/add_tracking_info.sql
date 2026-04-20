-- Adds optional shipment tracking fields to orders.
-- Sellers can attach a tracking number + courier name when (or after)
-- they mark an order as shipped. Both columns are nullable so older orders
-- and orders without tracking continue to work unchanged.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS tracking_courier TEXT;

COMMENT ON COLUMN public.orders.tracking_number IS
  'Courier-issued tracking number for this shipment. Set by the seller.';
COMMENT ON COLUMN public.orders.tracking_courier IS
  'Free-text courier name (e.g. GIG Logistics, DHL, Konga Express).';
