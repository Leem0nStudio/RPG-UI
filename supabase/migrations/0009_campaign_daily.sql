-- Daily/Weekly Quests and Campaign Story System
-- Migration 0009

-- ============================================
-- DAILY QUESTS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS daily_quests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  target_type TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL REFERENCES daily_quests(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  claimed BOOLEAN DEFAULT false,
  period_start TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, quest_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_player_daily_progress_player ON player_daily_progress(player_id, period_start);
CREATE INDEX IF NOT EXISTS idx_daily_quests_type ON daily_quests(type, is_active);

-- ============================================
-- STORY CHAPTERS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS story_chapters (
  id TEXT PRIMARY KEY,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  world TEXT NOT NULL DEFAULT 'rune_midgard',
  subtitle TEXT,
  lore_intro TEXT NOT NULL,
  lore_body TEXT NOT NULL,
  required_level INTEGER DEFAULT 1,
  required_chapter TEXT REFERENCES story_chapters(id),
  rewards JSONB NOT NULL DEFAULT '{"gems": 0, "zel": 0, "items": []}',
  quest_ids JSONB DEFAULT '[]',
  choices JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  is_boss_chapter BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES story_chapters(id),
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed')),
  choices_made JSONB DEFAULT '[]',
  path_type TEXT DEFAULT 'neutral' CHECK (path_type IN ('light', 'dark', 'neutral')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS player_story_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES story_chapters(id),
  choice_id TEXT NOT NULL,
  choice_text TEXT NOT NULL,
  path_type TEXT DEFAULT 'neutral',
  made_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, chapter_id, choice_id)
);

CREATE INDEX IF NOT EXISTS idx_player_story_progress_player ON player_story_progress(player_id);
CREATE INDEX IF NOT EXISTS idx_story_chapters_world ON story_chapters(world, sort_order);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_story_choices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read daily_quests" ON daily_quests;
CREATE POLICY "Anyone can read daily_quests" ON daily_quests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players manage own daily progress" ON player_daily_progress;
CREATE POLICY "Players manage own daily progress" ON player_daily_progress FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Anyone can read story_chapters" ON story_chapters;
CREATE POLICY "Anyone can read story_chapters" ON story_chapters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players manage own story progress" ON player_story_progress;
CREATE POLICY "Players manage own story progress" ON player_story_progress FOR ALL USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players manage own story choices" ON player_story_choices;
CREATE POLICY "Players manage own story choices" ON player_story_choices FOR ALL USING (auth.uid() = player_id);

-- ============================================
-- SEED DATA: Daily Quests
-- ============================================

INSERT INTO daily_quests (id, type, category, title, description, target_count, target_type, reward_type, reward_data, sort_order) VALUES
('daily_battles_3', 'daily', 'battle', 'Primer Paso', 'Completa 3 batallas', 3, 'battles_completed', 'gems', '{"gems": 5}', 1),
('daily_wins_2', 'daily', 'battle', 'Victoria Brillante', 'Gana 2 batallas', 2, 'battles_won', 'zel', '{"zel": 50}', 2),
('daily_summon_1', 'daily', 'summon', 'Invocador', 'Invoca 1 unidad', 1, 'summons', 'gems', '{"gems": 2}', 3),
('daily_qr_1', 'daily', 'social', 'Cazador QR', 'Escanea 1 QR', 1, 'qr_scanned', 'gems', '{"gems": 3}', 4),
('weekly_battles_10', 'weekly', 'battle', 'Guerrero Dedicado', 'Completa 10 batallas', 10, 'battles_completed', 'gems', '{"gems": 14}', 1),
('weekly_kills_50', 'weekly', 'battle', 'Carnicero', 'Derrota 50 enemigos', 50, 'enemies_killed', 'zel', '{"zel": 500}', 2),
('weekly_summons_5', 'weekly', 'summon', 'Coleccionista', 'Invoca 5 unidades', 5, 'summons', 'gems', '{"gems": 30}', 3),
('weekly_level_30', 'weekly', 'progression', 'Veterano', 'Unit alcanza nivel 30', 30, 'unit_level', 'zel', '{"zel": 1000}', 4)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED DATA: Story Chapters
-- ============================================

INSERT INTO story_chapters (id, chapter_number, title, world, subtitle, lore_intro, lore_body, required_level, rewards, quest_ids, choices, sort_order, is_boss_chapter) VALUES
('chapter_1', 1, 'El Novato', 'rune_midgard', 'La llegada', 
'En las costas de Rune-Midgard, un nuevo amanecer despierta sobre Prontera, la capital del Reino.',
'El Rey Throth observa las tierras. Has llegado a Prontera, un novato sin experiencia pero con determinacion. Tu objetivo: presentarte en el Gremio de Aventureros.',
1, '{"gems": 10, "zel": 100, "items": []}', '["quest_1", "quest_2"]',
'[{"id": "choice_1_1", "text": "Ir al Gremio", "effects": [{"type": "reputation", "target": "guild", "value": 5}], "path": "neutral"}, {"id": "choice_1_2", "text": "Explorar el mercado", "effects": [{"type": "zel", "target": "bonus", "value": 20}], "path": "neutral"}, {"id": "choice_1_3", "text": "Hablar con guardias", "effects": [{"type": "stat", "target": "atk", "value": 5}], "path": "light"}]',
1, false),

('chapter_2', 2, 'El Gremio', 'rune_midgard', 'Nuevos aliados',
'El edificio del Gremio se alza ante ti con emblemas de heroes legendarios.',
'El Capitan Marcus te recibe: "Bienvenido al Gremio. Completa misiones y ganaras reputacion." Vargas, un Knight, te advierte sobre los peligros.',
5, '{"gems": 20, "ziel": 200, "items": [{"itemId": "w_iron_sword", "quantity": 1}]}', '["quest_3", "quest_4"]',
'[{"id": "choice_2_1", "text": "Aceptar con determinacion", "effects": [{"type": "reputation", "target": "guild", "value": 10}], "path": "light"}, {"id": "choice_2_2", "text": "Preguntar estrategias", "effects": [{"type": "stat", "target": "atk", "value": 10}], "path": "neutral"}, {"id": "choice_2_3", "text": "Preguntar por el pago", "effects": [{"type": "zel", "target": "bonus", "value": 50}], "path": "dark"}]',
2, false),

('chapter_3', 3, 'Primera Prueba', 'rune_midgard', 'Batalla en el bosque',
'El bosque al norte esta infestado de Goblins. Tu primera prueba de combate.',
'El Capitan Marcus te dice: "La bosque esta infestada. Tu mision: eliminarlos a todos." Los goblins aparecen entre los arbustos.',
10, '{"gems": 30, "zel": 350, "items": [{"itemId": "a_wood_shield", "quantity": 1}]}', '["quest_5", "quest_6"]',
'[{"id": "choice_3_1", "text": "Enfrentar de frente", "effects": [{"type": "stat", "target": "atk", "value": 15}], "path": "light"}, {"id": "choice_3_2", "text": "Usar emboscada", "effects": [{"type": "stat", "target": "def", "value": 10}], "path": "neutral"}, {"id": "choice_3_3", "text": "Buscar escondite", "effects": [{"type": "zel", "target": "bonus", "value": 100}], "path": "dark"}]',
3, false),

('chapter_4', 4, 'Oscuridad Creciente', 'rune_midgard', 'La sombra se extiende',
'Shadow Beasts aparecen. El Rey ordena toque de queda. La batalla se acerca.',
'Un mensajero llega: "Un Shadow Beast cerca de las cuevas. El Gremio necesita aventureros!" Tres opciones se presentan.',
15, '{"gems": 50, "zel": 500, "items": [{"itemId": "ac_power_ring", "quantity": 1}]}', '["quest_7", "quest_8"]',
'[{"id": "choice_4_1", "text": "Enfrentar directamente", "effects": [{"type": "reputation", "target": "kingdom", "value": 15}], "path": "light"}, {"id": "choice_4_2", "text": "Huir y alertar", "effects": [{"type": "reputation", "target": "guild", "value": 5}], "path": "neutral"}, {"id": "choice_4_3", "text": "Investigar origen", "effects": [{"type": "stat", "target": "atk", "value": 10}], "path": "dark"}]',
4, false),

('chapter_5', 5, 'La Respuesta del Heroe', 'rune_midgard', 'El enfrentamiento final',
'El momento ha llegado. Un Shadow Lord establece su guarida en las montanas.',
'El viento frio corta tu rostro mientras escalas. Segun tu camino, tendras diferentes aliados. El Shadow Lord emerge de las sombras.',
20, '{"gems": 100, "zel": 2000, "items": []}', '["quest_9", "quest_10"]',
'[{"id": "choice_5_1", "text": "Atacar con fuerza", "effects": [{"type": "stat", "target": "atk", "value": 50}], "path": "light"}, {"id": "choice_5_2", "text": "Usar entorno", "effects": [{"type": "stat", "target": "def", "value": 30}], "path": "neutral"}, {"id": "choice_5_3", "text": "Tecnicas de sombra", "effects": [{"type": "stat", "target": "atk", "value": 30}], "path": "dark"}]',
5, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_player_quest_progress(p_player_id UUID)
RETURNS TABLE (
  quest_id TEXT,
  quest_type TEXT,
  quest_title TEXT,
  progress INTEGER,
  target_count INTEGER,
  completed BOOLEAN,
  claimed BOOLEAN,
  period_start TIMESTAMPTZ,
  can_claim BOOLEAN,
  time_until_reset BIGINT
) AS $$
DECLARE
  v_daily_reset TIMESTAMPTZ;
  v_weekly_reset TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  v_daily_reset := DATE_TRUNC('day', v_now) + INTERVAL '1 day';
  v_weekly_reset := DATE_TRUNC('week', v_now) + INTERVAL '1 week';

  RETURN QUERY
  SELECT
    dq.id,
    dq.type,
    dq.title,
    COALESCE(pdp.progress, 0),
    dq.target_count,
    COALESCE(pdp.completed, false),
    COALESCE(pdp.claimed, false),
    COALESCE(pdp.period_start, CASE WHEN dq.type = 'daily' THEN v_daily_reset - INTERVAL '1 day' ELSE v_weekly_reset - INTERVAL '1 week' END),
    COALESCE(pdp.completed, false) AND NOT COALESCE(pdp.claimed, false),
    CASE 
      WHEN dq.type = 'daily' THEN EXTRACT(EPOCH FROM (v_daily_reset - v_now))::BIGINT
      ELSE EXTRACT(EPOCH FROM (v_weekly_reset - v_now))::BIGINT
    END
  FROM daily_quests dq
  LEFT JOIN player_daily_progress pdp ON dq.id = pdp.quest_id AND pdp.player_id = p_player_id
  WHERE dq.is_active = true
  ORDER BY dq.type, dq.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_player_story_progress(p_player_id UUID)
RETURNS TABLE (
  chapter_id TEXT,
  chapter_number INTEGER,
  title TEXT,
  subtitle TEXT,
  world TEXT,
  required_level INTEGER,
  status TEXT,
  path_type TEXT,
  is_boss_chapter BOOLEAN,
  can_start BOOLEAN,
  lore_intro TEXT,
  lore_body TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.chapter_number,
    sc.title,
    sc.subtitle,
    sc.world,
    sc.required_level,
    COALESCE(psp.status, 'locked'),
    COALESCE(psp.path_type, 'neutral'),
    sc.is_boss_chapter,
    CASE WHEN psp.status IS NOT NULL THEN true ELSE false END,
    sc.lore_intro,
    sc.lore_body
  FROM story_chapters sc
  LEFT JOIN player_story_progress psp ON sc.id = psp.chapter_id AND psp.player_id = p_player_id
  ORDER BY sc.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION start_chapter(p_player_id UUID, p_chapter_id TEXT)
RETURNS JSONB AS $$
BEGIN
  INSERT INTO player_story_progress (player_id, chapter_id, status, started_at)
  VALUES (p_player_id, p_chapter_id, 'active', NOW())
  ON CONFLICT (player_id, chapter_id) DO UPDATE
  SET status = 'active', started_at = NOW();
  
  RETURN jsonb_build_object('success', true, 'chapter', p_chapter_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION complete_chapter(p_player_id UUID, p_chapter_id TEXT, p_choice_id TEXT DEFAULT NULL, p_path_type TEXT DEFAULT 'neutral')
RETURNS JSONB AS $$
DECLARE
  v_chapter record;
BEGIN
  SELECT * INTO v_chapter FROM story_chapters WHERE id = p_chapter_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Chapter not found');
  END IF;

  UPDATE player_story_progress 
  SET status = 'completed', completed_at = NOW(), path_type = p_path_type
  WHERE player_id = p_player_id AND chapter_id = p_chapter_id;

  IF p_choice_id IS NOT NULL THEN
    INSERT INTO player_story_choices (player_id, chapter_id, choice_id, choice_text, path_type)
    VALUES (p_player_id, p_chapter_id, p_choice_id, 'Selected', p_path_type)
    ON CONFLICT (player_id, chapter_id, choice_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'chapter', p_chapter_id,
    'rewards', v_chapter.rewards
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_quest_progress(p_player_id UUID, p_quest_type TEXT, p_increment INTEGER DEFAULT 1)
RETURNS JSONB AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_period_start TIMESTAMPTZ;
  v_quest record;
BEGIN
  FOR v_quest IN 
    SELECT dq.id, dq.type, dq.target_count, dq.reward_data
    FROM daily_quests dq
    WHERE dq.type = p_quest_type AND dq.is_active = true
  LOOP
    v_period_start := CASE 
      WHEN v_quest.type = 'daily' THEN DATE_TRUNC('day', v_now)
      ELSE DATE_TRUNC('week', v_now)
    END;

    INSERT INTO player_daily_progress (player_id, quest_id, progress, period_start)
    VALUES (p_player_id, v_quest.id, p_increment, v_period_start)
    ON CONFLICT (player_id, quest_id, period_start) 
    DO UPDATE SET 
      progress = player_daily_progress.progress + p_increment,
      completed = CASE 
        WHEN player_daily_progress.progress + p_increment >= v_quest.target_count THEN true 
        ELSE player_daily_progress.completed 
      END;
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION claim_quest_reward(p_player_id UUID, p_quest_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_progress record;
  v_quest record;
BEGIN
  SELECT dp.*, dq.reward_data, dq.reward_type INTO v_progress, v_quest
  FROM player_daily_progress dp
  JOIN daily_quests dq ON dp.quest_id = dq.id
  WHERE dp.player_id = p_player_id AND dp.quest_id = p_quest_id AND dp.claimed = false;

  IF NOT FOUND OR v_progress.completed = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quest not completed or already claimed');
  END IF;

  UPDATE player_daily_progress SET claimed = true, completed_at = NOW()
  WHERE player_id = p_player_id AND quest_id = p_quest_id;

  RETURN jsonb_build_object(
    'success', true,
    'quest_id', p_quest_id,
    'reward', v_progress.reward_data,
    'reward_type', v_progress.reward_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Update energy settings
-- ============================================

ALTER TABLE player_profiles ALTER COLUMN energy_max SET DEFAULT 100;