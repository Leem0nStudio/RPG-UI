-- QR Hunt System Migration
-- Adds tables and functions for real-world QR code scanning rewards

-- Drop existing qr tables if they exist (for clean reinstalls)
DROP TABLE IF EXISTS qr_claims CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP FUNCTION IF EXISTS claim_qr_reward CASCADE;

-- QR Codes table - defines rewards for physical QR codes
CREATE TABLE qr_codes (
  code TEXT PRIMARY KEY,
  location_name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('item', 'unit', 'currency')),
  reward_data JSONB NOT NULL,
  rarity INTEGER CHECK (rarity >= 1 AND rarity <= 5),
  is_active BOOLEAN DEFAULT true,
  reset_period INTERVAL DEFAULT '1 year',
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Claims table - tracks what each player has claimed
CREATE TABLE qr_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code TEXT NOT NULL REFERENCES qr_codes(code),
  claimed_year INTEGER NOT NULL,
  reward_type TEXT NOT NULL,
  reward_received JSONB NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, qr_code, claimed_year)
);

-- Index for efficient claim lookups
CREATE INDEX idx_qr_claims_player ON qr_claims(player_id, qr_code);

-- Function to claim QR reward
CREATE OR REPLACE FUNCTION claim_qr_reward(
  p_code TEXT,
  p_player_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_qr RECORD;
  v_result JSONB;
  v_year INTEGER;
  v_already_claimed BOOLEAN;
BEGIN
  v_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Check if QR exists and is active
  SELECT * INTO v_qr
  FROM qr_codes
  WHERE code = p_code AND is_active = true;
  
  IF v_qr IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'QR code not found or inactive'
    );
  END IF;
  
  -- Check if already claimed this year
  SELECT true INTO v_already_claimed
  FROM qr_claims
  WHERE player_id = p_player_id 
    AND qr_code = p_code 
    AND claimed_year = v_year
  LIMIT 1;
  
  IF v_already_claimed THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Already claimed this year',
      'next_reset', v_qr.last_reset_at + v_qr.reset_period
    );
  END IF;
  
  -- Check if reset period has passed
  IF v_qr.last_reset_at + v_qr.reset_period < NOW() THEN
    -- Reset the QR code
    UPDATE qr_codes 
    SET last_reset_at = NOW() 
    WHERE code = p_code;
    
    v_qr.last_reset_at := NOW();
  END IF;
  
  -- Add the claim record
  INSERT INTO qr_claims (player_id, qr_code, claimed_year, reward_type, reward_received)
  VALUES (p_player_id, p_code, v_year, v_qr.type, v_qr.reward_data);
  
  -- Build success result
  v_result := jsonb_build_object(
    'success', true,
    'type', v_qr.type,
    'reward', v_qr.reward_data,
    'location', v_qr.location_name,
    'message', 'Claimed: ' || v_qr.reward_data::TEXT
  );
  
  RETURN v_result;
  
EXCEPTION WHEN UNIQUE_VIOLATION THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'Already claimed this year'
  );
END;
$$;

-- Sample QR codes for testing (restaurants, parks, etc.)
INSERT INTO qr_codes (code, location_name, description, type, reward_data, rarity) VALUES
('PIZZA_ITALIANO', 'Pizza Italiano', 'Scan at table for a free pizza!', 'currency', '{"gems": 5, "zel": 500}', 3),
('BURGER_PLACE', 'Burger Place', 'Best burgers in town', 'currency', '{"gems": 3, "zel": 300}', 2),
('PARK_CENTRAL', 'Central Park', 'Found near the fountain', 'item', '{"itemId": "ac_power_ring", "quantity": 1}', 3),
('LIBRARY_TOWN', 'Town Library', 'Quiet reading spot', 'currency', '{"gems": 2, "zel": 200}', 2),
('GYM_FITNESS', 'Fitness Gym', 'Stay strong!', 'item', '{"itemId": "a_wood_shield", "quantity": 1}', 2),
('CAFE_ROSE', 'Rose Cafe', 'Coffee and snacks', 'currency', '{"gems": 1, "zel": 100}', 1),
('DOJO_MASTER', 'Master Dojo', 'Training grounds', 'unit', '{"unitId": "job_swordman", "level": 5}', 4),
('MYSTERY_BOX', 'Mystery Spot', 'Who knows what you might find...', 'item', '{"itemId": "w_iron_sword", "quantity": 1}', 1)
ON CONFLICT (code) DO NOTHING;

-- Add RLS policies
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_claims ENABLE ROW LEVEL SECURITY;

-- Everyone can read QR codes
CREATE POLICY "Anyone can read qr_codes" ON qr_codes
  FOR SELECT USING (true);

-- Players can read their own claims
CREATE POLICY "Players can read own qr_claims" ON qr_claims
  FOR SELECT USING (auth.uid() = player_id);

-- Service role can insert claims
CREATE POLICY "Service can insert qr_claims" ON qr_claims
  FOR INSERT WITH CHECK (true);

-- Anonymous can invoke the RPC (needs special handling for anon users)
COMMENT ON FUNCTION claim_qr_reward IS 'Claims a QR code reward. Usage: SELECT claim_qr_reward(code, player_id)';