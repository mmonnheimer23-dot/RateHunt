-- RateHunt production submission hardening.
-- Safe to apply repeatedly to the existing Neon database.

CREATE INDEX IF NOT EXISTS idx_rate_hunts_requester_created
  ON public.rate_hunts ((summary_payload->>'requesterHash'), created_at DESC);
