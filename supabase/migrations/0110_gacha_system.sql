-- ============================================
-- GACHA COMPONENTS SYSTEM
-- ============================================

-- Tabla: Cartas (modifiers de stats/effects)
CREATE TABLE IF NOT EXISTS player_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common','rare','epic','legendary','mythic')),
  quantity INTEGER DEFAULT 1,
  equipped_unit_id UUID REFERENCES player_units(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, card_id)
);

-- Tabla: Armas (equipment)
CREATE TABLE IF NOT EXISTS player_weapons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weapon_id TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common','rare','epic','legendary','mythic')),
  equipped_unit_id UUID REFERENCES player_units(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: Skills (no unlockeadas automaticamente)
CREATE TABLE IF NOT EXISTS player_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  unlocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, skill_id)
);

-- Tabla: Job Cores (alternative evolution paths)
CREATE TABLE IF NOT EXISTS player_job_cores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  variant_id TEXT,
  obtained_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, job_id)
);

-- Tabla: Materiales (evolution)
CREATE TABLE IF NOT EXISTS player_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, material_id)
);

-- Tabla: Gacha pull history (pity system)
CREATE TABLE IF NOT EXISTS gacha_pulls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id TEXT NOT NULL,
  rarity_pulled TEXT NOT NULL,
  pity_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_player_cards_player ON player_cards(player_id);
CREATE INDEX IF NOT EXISTS idx_player_weapons_player ON player_weapons(player_id);
CREATE INDEX IF NOT EXISTS idx_player_skills_player ON player_skills(player_id);
CREATE INDEX IF NOT EXISTS idx_player_job_cores_player ON player_job_cores(player_id);
CREATE INDEX IF NOT EXISTS idx_player_materials_player ON player_materials(player_id);
CREATE INDEX IF NOT EXISTS idx_gacha_pulls_player ON gacha_pulls(player_id);

-- RLS
ALTER TABLE player_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_job_cores ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_pulls ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Players own cards" ON player_cards;
DROP POLICY IF EXISTS "Players own weapons" ON player_weapons;
DROP POLICY IF EXISTS "Players own skills" ON player_skills;
DROP POLICY IF EXISTS "Players own job cores" ON player_job_cores;
DROP POLICY IF EXISTS "Players own materials" ON player_materials;
DROP POLICY IF EXISTS "Players own pulls" ON gacha_pulls;

CREATE POLICY "Players own cards" ON player_cards FOR ALL USING (auth.uid() = player_id);
CREATE POLICY "Players own weapons" ON player_weapons FOR ALL USING (auth.uid() = player_id);
CREATE POLICY "Players own skills" ON player_skills FOR ALL USING (auth.uid() = player_id);
CREATE POLICY "Players own job cores" ON player_job_cores FOR ALL USING (auth.uid() = player_id);
CREATE POLICY "Players own materials" ON player_materials FOR ALL USING (auth.uid() = player_id);
CREATE POLICY "Players own pulls" ON gacha_pulls FOR ALL USING (auth.uid() = player_id);

-- Agregar columnas a player_units si no existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_units' AND column_name = 'equipped_cards') THEN
    ALTER TABLE player_units ADD COLUMN equipped_cards TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_units' AND column_name = 'equipped_skills') THEN
    ALTER TABLE player_units ADD COLUMN equipped_skills TEXT[] DEFAULT '{}';
  END IF;
END
$$;