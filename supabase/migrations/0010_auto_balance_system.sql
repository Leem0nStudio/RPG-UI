-- Sistema de métricas de batalla para balance automático
-- Agregar después de las tablas existentes

-- Tabla para tracking de métricas del jugador
CREATE TABLE IF NOT EXISTS player_battle_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_battles INTEGER DEFAULT 0,
  wins_by_difficulty JSONB DEFAULT '{"Normal": 0, "Hard": 0, "Heroic": 0}',
  losses_by_difficulty JSONB DEFAULT '{"Normal": 0, "Hard": 0, "Heroic": 0}',
  total_damage_dealt INTEGER DEFAULT 0,
  total_damage_taken INTEGER DEFAULT 0,
  enemies_killed INTEGER DEFAULT 0,
  units_lost INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id)
);

-- Tabla para historial de balance (para analytics)
CREATE TABLE IF NOT EXISTS balance_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty VARCHAR(20) NOT NULL,
  player_level INTEGER NOT NULL,
  enemy_level INTEGER NOT NULL,
  battle_result VARCHAR(10) NOT NULL,
  damage_dealt INTEGER NOT NULL,
  damage_taken INTEGER NOT NULL,
  reward_earned INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para analytics
CREATE INDEX IF NOT EXISTS idx_balance_history_player ON balance_history(player_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_difficulty ON balance_history(difficulty);
CREATE INDEX IF NOT EXISTS idx_balance_history_created ON balance_history(created_at DESC);

-- Políticas RLS
ALTER TABLE player_battle_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_history ENABLE ROW LEVEL SECURITY;

-- Policies para player_battle_metrics
CREATE POLICY "Players can view own metrics" ON player_battle_metrics
  FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Players can update own metrics" ON player_battle_metrics
  FOR UPDATE USING (auth.uid() = player_id);

CREATE POLICY "Service can insert metrics" ON player_battle_metrics
  FOR INSERT WITH CHECK (true);

-- Policies para balance_history
CREATE POLICY "Players can view own history" ON balance_history
  FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Players can insert own history" ON balance_history
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Función para obtener recommendations de difficulty
CREATE OR REPLACE FUNCTION get_difficulty_recommendation(p_player_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  v_metrics RECORD;
  v_normal_rate DECIMAL;
  v_hard_rate DECIMAL;
  v_heroic_rate DECIMAL;
BEGIN
  SELECT * INTO v_metrics FROM player_battle_metrics WHERE player_id = p_player_id;
  
  IF v_metrics IS NULL OR v_metrics.total_battles < 10 THEN
    RETURN 'Normal';
  END IF;
  
  v_normal_rate := CASE WHEN (v_metrics.wins_by_difficulty->>'Normal')::INT + (v_metrics.losses_by_difficulty->>'Normal')::INT > 0 
    THEN (v_metrics.wins_by_difficulty->>'Normal')::DECIMAL / 
         ((v_metrics.wins_by_difficulty->>'Normal')::INT + (v_metrics.losses_by_difficulty->>'Normal')::INT)
    ELSE 0.5 END;
    
  v_hard_rate := CASE WHEN (v_metrics.wins_by_difficulty->>'Hard')::INT + (v_metrics.losses_by_difficulty->>'Hard')::INT > 0 
    THEN (v_metrics.wins_by_difficulty->>'Hard')::DECIMAL / 
         ((v_metrics.wins_by_difficulty->>'Hard')::INT + (v_metrics.losses_by_difficulty->>'Hard')::INT)
    ELSE 0.5 END;
    
  v_heroic_rate := CASE WHEN (v_metrics.wins_by_difficulty->>'Heroic')::INT + (v_metrics.losses_by_difficulty->>'Heroic')::INT > 0 
    THEN (v_metrics.wins_by_difficulty->>'Heroic')::DECIMAL / 
         ((v_metrics.wins_by_difficulty->>'Heroic')::INT + (v_metrics.losses_by_difficulty->>'Heroic')::INT)
    ELSE 0.5 END;
  
  IF v_normal_rate >= 0.85 AND v_metrics.total_battles > 10 THEN
    RETURN 'Hard';
  END IF;
  
  IF v_hard_rate >= 0.70 AND v_metrics.total_battles > 20 THEN
    RETURN 'Heroic';
  END IF;
  
  IF v_heroic_rate < 0.40 AND v_metrics.total_battles > 30 THEN
    RETURN 'Hard';
  END IF;
  
  RETURN 'Normal';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_difficulty_recommendation IS 'Returns recommended difficulty based on player battle metrics';
COMMENT ON TABLE player_battle_metrics IS 'Tracks player battle performance for automatic difficulty adjustment';
COMMENT ON TABLE balance_history IS 'Historical data for balance analytics and tuning';