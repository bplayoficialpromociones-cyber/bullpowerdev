/*
  # Agregar Constraints de Unicidad a Catálogos de Juegos

  ## Descripción
  Esta migración agrega constraints UNIQUE a las tablas de catálogos de juegos para prevenir
  la creación de registros duplicados. Esto garantiza la integridad de los datos y evita
  confusión al tener múltiples registros con el mismo nombre.

  ## Cambios Realizados

  ### 1. Tabla `games`
  - Agrega UNIQUE constraint en columna `name`
  - Justificación: No puede haber dos juegos con el mismo nombre exacto

  ### 2. Tabla `game_types`
  - Agrega UNIQUE constraint en columna `name`
  - Justificación: No puede haber dos tipos de juegos con el mismo nombre

  ### 3. Tabla `themes`
  - Agrega UNIQUE constraint en columna `name`
  - Justificación: No puede haber dos temáticas con el mismo nombre

  ### 4. Tabla `mechanics`
  - Agrega UNIQUE constraint en columna `name`
  - Justificación: No puede haber dos mecánicas con el mismo nombre

  ### 5. Tabla `denominations`
  - Agrega UNIQUE constraint en combinación (name, currency_id, min_bet, max_bet)
  - Justificación: Una denominación se define por su nombre, moneda y rangos de apuesta
  - Permite tener la misma denominación nominal con diferentes configuraciones

  ## Beneficios
  - Previene duplicados a nivel de base de datos
  - Mejora la integridad referencial
  - Proporciona mensajes de error claros cuando se intenta crear duplicados
  - Reduce la necesidad de validaciones complejas en aplicación

  ## Impacto
  - Si existen registros duplicados actuales, la migración fallará
  - Los edge functions recibirán errores de constraint violation si intentan crear duplicados
  - Se recomienda actualizar los edge functions para validar antes de insertar
*/

-- =====================================================
-- 1. AGREGAR UNIQUE CONSTRAINT A GAMES
-- =====================================================

DO $$
BEGIN
  -- Verificar si el constraint ya existe antes de agregarlo
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'games_name_unique'
  ) THEN
    ALTER TABLE games ADD CONSTRAINT games_name_unique UNIQUE (name);
  END IF;
END $$;

-- =====================================================
-- 2. AGREGAR UNIQUE CONSTRAINT A GAME_TYPES
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'game_types_name_unique'
  ) THEN
    ALTER TABLE game_types ADD CONSTRAINT game_types_name_unique UNIQUE (name);
  END IF;
END $$;

-- =====================================================
-- 3. AGREGAR UNIQUE CONSTRAINT A THEMES
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'themes_name_unique'
  ) THEN
    ALTER TABLE themes ADD CONSTRAINT themes_name_unique UNIQUE (name);
  END IF;
END $$;

-- =====================================================
-- 4. AGREGAR UNIQUE CONSTRAINT A MECHANICS
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'mechanics_name_unique'
  ) THEN
    ALTER TABLE mechanics ADD CONSTRAINT mechanics_name_unique UNIQUE (name);
  END IF;
END $$;

-- =====================================================
-- 5. AGREGAR UNIQUE CONSTRAINT A DENOMINATIONS
-- =====================================================
-- Una denominación es única por su nombre + moneda + rangos de apuesta

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'denominations_config_unique'
  ) THEN
    ALTER TABLE denominations 
    ADD CONSTRAINT denominations_config_unique 
    UNIQUE (name, currency_id, min_bet, max_bet);
  END IF;
END $$;

-- =====================================================
-- 6. CREAR ÍNDICES ADICIONALES PARA MEJORAR BÚSQUEDAS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_game_types_name ON game_types(name);
CREATE INDEX IF NOT EXISTS idx_themes_name ON themes(name);
CREATE INDEX IF NOT EXISTS idx_mechanics_name ON mechanics(name);
CREATE INDEX IF NOT EXISTS idx_denominations_name ON denominations(name);
