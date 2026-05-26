-- Tabela waitlist (lista VIP Ascen)
CREATE TABLE IF NOT EXISTS waitlist (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  source     TEXT DEFAULT 'landing_page',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_insert"
  ON waitlist FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "restrict_select"
  ON waitlist FOR SELECT
  TO authenticated
  USING (true);
