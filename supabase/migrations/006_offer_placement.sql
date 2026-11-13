-- Offers are split into the single home-page modal offer and the announcement-bar offers.
-- Existing rows keep the modal behaviour they already had.
ALTER TABLE offer_settings ADD COLUMN IF NOT EXISTS placement text NOT NULL DEFAULT 'modal';

-- Bar offers are listed in the order they were created
ALTER TABLE offer_settings ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
