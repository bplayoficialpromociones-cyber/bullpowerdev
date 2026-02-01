/*
  # Seed de datos de prueba para Juegos

  ## Descripción
  Esta migración carga datos de prueba completos para el sistema de juegos, incluyendo:
  - Tipos de juegos
  - Temáticas
  - Mecánicas
  - Denominaciones
  - 15 juegos con información basada en juegos reales de RedTiger y Play'n GO

  ## Datos Incluidos
  - 5 tipos de juegos diferentes
  - 10 temáticas variadas
  - 8 mecánicas populares
  - 6 denominaciones con diferentes monedas
  - 15 juegos completos con sus relaciones

  ## Notas
  - Los RTP son realistas (92-97%)
  - Las volatilidades están balanceadas
  - Los juegos incluyen trailers y multimedia
*/

DO $$
DECLARE
  v_game_type_slot uuid;
  v_game_type_megaways uuid;
  v_game_type_video_slot uuid;
  v_game_type_cluster uuid;
  v_game_type_hold_win uuid;
  
  v_theme_egyptian uuid;
  v_theme_fruits uuid;
  v_theme_asian uuid;
  v_theme_mythology uuid;
  v_theme_adventure uuid;
  v_theme_animals uuid;
  v_theme_fantasy uuid;
  v_theme_pirates uuid;
  v_theme_western uuid;
  v_theme_space uuid;
  
  v_mech_free_spins uuid;
  v_mech_multipliers uuid;
  v_mech_cascading uuid;
  v_mech_expanding_wilds uuid;
  v_mech_bonus_game uuid;
  v_mech_respins uuid;
  v_mech_megaways uuid;
  v_mech_buy_feature uuid;
  
  v_denom_ars_low uuid;
  v_denom_ars_mid uuid;
  v_denom_ars_high uuid;
  v_denom_usd_low uuid;
  v_denom_usd_mid uuid;
  v_denom_usd_high uuid;
  
  v_vol_low uuid;
  v_vol_medium uuid;
  v_vol_medium_high uuid;
  v_vol_high uuid;
  
  v_status_active uuid;
  v_status_inactive uuid;
  
  v_currency_ars uuid;
  v_currency_usd uuid;
  
  v_game_id uuid;
  i integer;
BEGIN
  -- Obtener monedas
  SELECT id INTO v_currency_ars FROM expenses_currencies WHERE code = 'ARS' LIMIT 1;
  SELECT id INTO v_currency_usd FROM expenses_currencies WHERE code = 'USD' LIMIT 1;
  
  -- Obtener volatilidades y estados
  SELECT id INTO v_vol_low FROM game_volatilities WHERE name = 'Baja' LIMIT 1;
  SELECT id INTO v_vol_medium FROM game_volatilities WHERE name = 'Media' LIMIT 1;
  SELECT id INTO v_vol_medium_high FROM game_volatilities WHERE name = 'Media/Alta' LIMIT 1;
  SELECT id INTO v_vol_high FROM game_volatilities WHERE name = 'Alta' LIMIT 1;
  
  SELECT id INTO v_status_active FROM game_statuses WHERE name = 'activo' LIMIT 1;
  SELECT id INTO v_status_inactive FROM game_statuses WHERE name = 'inactivo' LIMIT 1;
  
  -- ===== TIPOS DE JUEGOS =====
  INSERT INTO game_types (name, description, paylines, max_payout, reels_rows, hit_frequency) VALUES
    ('Classic Slot', 'Tragamonedas clásico de 3 carretes', 5, '5,000x', '3x3', '25%')
  RETURNING id INTO v_game_type_slot;
  
  INSERT INTO game_types (name, description, paylines, max_payout, reels_rows, hit_frequency) VALUES
    ('Megaways', 'Sistema Megaways con hasta 117,649 formas de ganar', 117649, '20,000x', '6x7', '35%')
  RETURNING id INTO v_game_type_megaways;
  
  INSERT INTO game_types (name, description, paylines, max_payout, reels_rows, hit_frequency) VALUES
    ('Video Slot', 'Video slot moderno de 5 carretes', 20, '10,000x', '5x3', '30%')
  RETURNING id INTO v_game_type_video_slot;
  
  INSERT INTO game_types (name, description, paylines, max_payout, reels_rows, hit_frequency) VALUES
    ('Cluster Pays', 'Sistema de pagos por grupos/clusters', 0, '15,000x', '5x5', '28%')
  RETURNING id INTO v_game_type_cluster;
  
  INSERT INTO game_types (name, description, paylines, max_payout, reels_rows, hit_frequency) VALUES
    ('Hold & Win', 'Mecánica Hold & Win con respins', 10, '5,000x', '5x3', '22%')
  RETURNING id INTO v_game_type_hold_win;
  
  -- ===== TEMÁTICAS =====
  INSERT INTO themes (name, description) VALUES ('Egipcia', 'Temática del antiguo Egipto con faraones y pirámides') RETURNING id INTO v_theme_egyptian;
  INSERT INTO themes (name, description) VALUES ('Frutas', 'Temática clásica de frutas y símbolos retro') RETURNING id INTO v_theme_fruits;
  INSERT INTO themes (name, description) VALUES ('Asiática', 'Cultura y mitología asiática') RETURNING id INTO v_theme_asian;
  INSERT INTO themes (name, description) VALUES ('Mitología', 'Dioses y criaturas mitológicas') RETURNING id INTO v_theme_mythology;
  INSERT INTO themes (name, description) VALUES ('Aventura', 'Exploradores y tesoros perdidos') RETURNING id INTO v_theme_adventure;
  INSERT INTO themes (name, description) VALUES ('Animales', 'Fauna salvaje y doméstica') RETURNING id INTO v_theme_animals;
  INSERT INTO themes (name, description) VALUES ('Fantasía', 'Magia, hechiceros y criaturas fantásticas') RETURNING id INTO v_theme_fantasy;
  INSERT INTO themes (name, description) VALUES ('Piratas', 'Corsarios, tesoros y mapas') RETURNING id INTO v_theme_pirates;
  INSERT INTO themes (name, description) VALUES ('Western', 'Vaqueros y el salvaje oeste') RETURNING id INTO v_theme_western;
  INSERT INTO themes (name, description) VALUES ('Espacio', 'Exploración espacial y ciencia ficción') RETURNING id INTO v_theme_space;
  
  -- ===== MECÁNICAS =====
  INSERT INTO mechanics (name, description) VALUES ('Free Spins', 'Rondas de giros gratis') RETURNING id INTO v_mech_free_spins;
  INSERT INTO mechanics (name, description) VALUES ('Multiplicadores', 'Multiplicadores progresivos o fijos') RETURNING id INTO v_mech_multipliers;
  INSERT INTO mechanics (name, description) VALUES ('Cascadas', 'Símbolos caen en cascada creando nuevas victorias') RETURNING id INTO v_mech_cascading;
  INSERT INTO mechanics (name, description) VALUES ('Wilds Expansivos', 'Símbolos wild que se expanden en el carrete') RETURNING id INTO v_mech_expanding_wilds;
  INSERT INTO mechanics (name, description) VALUES ('Juego de Bonus', 'Ronda de bonus interactiva') RETURNING id INTO v_mech_bonus_game;
  INSERT INTO mechanics (name, description) VALUES ('Respins', 'Re-giros con símbolos bloqueados') RETURNING id INTO v_mech_respins;
  INSERT INTO mechanics (name, description) VALUES ('Megaways', 'Sistema de carretes variables') RETURNING id INTO v_mech_megaways;
  INSERT INTO mechanics (name, description) VALUES ('Comprar Bonus', 'Opción de comprar la función bonus') RETURNING id INTO v_mech_buy_feature;
  
  -- ===== DENOMINACIONES =====
  INSERT INTO denominations (name, currency_id, min_bet, max_bet, available_bets) VALUES
    ('ARS Low Stakes', v_currency_ars, 10.00, 100.00, ARRAY[10, 20, 50, 100]::numeric[])
  RETURNING id INTO v_denom_ars_low;
  
  INSERT INTO denominations (name, currency_id, min_bet, max_bet, available_bets) VALUES
    ('ARS Medium Stakes', v_currency_ars, 100.00, 1000.00, ARRAY[100, 250, 500, 1000]::numeric[])
  RETURNING id INTO v_denom_ars_mid;
  
  INSERT INTO denominations (name, currency_id, min_bet, max_bet, available_bets) VALUES
    ('ARS High Roller', v_currency_ars, 1000.00, 10000.00, ARRAY[1000, 2500, 5000, 10000]::numeric[])
  RETURNING id INTO v_denom_ars_high;
  
  INSERT INTO denominations (name, currency_id, min_bet, max_bet, available_bets) VALUES
    ('USD Low Stakes', v_currency_usd, 0.10, 1.00, ARRAY[0.10, 0.25, 0.50, 1.00]::numeric[])
  RETURNING id INTO v_denom_usd_low;
  
  INSERT INTO denominations (name, currency_id, min_bet, max_bet, available_bets) VALUES
    ('USD Medium Stakes', v_currency_usd, 1.00, 10.00, ARRAY[1, 2.5, 5, 10]::numeric[])
  RETURNING id INTO v_denom_usd_mid;
  
  INSERT INTO denominations (name, currency_id, min_bet, max_bet, available_bets) VALUES
    ('USD High Roller', v_currency_usd, 10.00, 100.00, ARRAY[10, 25, 50, 100]::numeric[])
  RETURNING id INTO v_denom_usd_high;
  
  -- ===== JUEGOS (basados en RedTiger y Play'n GO) =====
  
  -- Juego 1: Dragon's Fire Megaways (inspirado en RedTiger)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Dragon''s Fire Megaways', v_game_type_megaways, '2024-01-15', '2024-02-01', 96.12, v_vol_high, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_fantasy), (v_game_id, v_theme_mythology);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_megaways), (v_game_id, v_mech_cascading), (v_game_id, v_mech_free_spins), (v_game_id, v_mech_multipliers);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_low), (v_game_id, v_denom_ars_mid), (v_game_id, v_denom_usd_low);
  INSERT INTO trailers (game_id, name, description, trailer_date) VALUES (v_game_id, 'Dragon''s Fire Megaways - Official Trailer', 'Sumérgete en un mundo de dragones y fuego con hasta 117,649 formas de ganar', '2024-01-15');
  
  -- Juego 2: Book of Dead (inspirado en Play'n GO)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Book of Dead', v_game_type_video_slot, '2023-11-20', '2023-12-05', 96.21, v_vol_high, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_egyptian), (v_game_id, v_theme_adventure);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_free_spins), (v_game_id, v_mech_expanding_wilds);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_low), (v_game_id, v_denom_ars_mid), (v_game_id, v_denom_ars_high);
  INSERT INTO trailers (game_id, name, description, trailer_date) VALUES (v_game_id, 'Book of Dead - Teaser', 'Descubre los secretos del antiguo Egipto', '2023-11-20');
  
  -- Juego 3: Reactoonz (inspirado en Play'n GO)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Reactoonz', v_game_type_cluster, '2024-02-10', '2024-02-25', 96.51, v_vol_medium_high, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_space), (v_game_id, v_theme_fantasy);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_cascading), (v_game_id, v_mech_multipliers);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_usd_low), (v_game_id, v_denom_usd_mid);
  
  -- Juego 4: Wild Fortune (inspirado en RedTiger)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Wild Fortune', v_game_type_video_slot, '2024-01-05', '2024-01-20', 95.75, v_vol_medium, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_asian);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_free_spins), (v_game_id, v_mech_multipliers), (v_game_id, v_mech_respins);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_mid), (v_game_id, v_denom_usd_mid);
  
  -- Juego 5: Pirates' Plenty (inspirado en RedTiger)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Pirates'' Plenty Battle for Gold', v_game_type_video_slot, '2023-12-15', '2024-01-10', 95.73, v_vol_medium, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_pirates), (v_game_id, v_theme_adventure);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_free_spins), (v_game_id, v_mech_expanding_wilds), (v_game_id, v_mech_bonus_game);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_low), (v_game_id, v_denom_ars_mid);
  
  -- Juego 6: Gonzo's Quest Megaways
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Gonzo''s Quest Megaways', v_game_type_megaways, '2024-03-01', '2024-03-15', 96.00, v_vol_medium_high, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_adventure);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_megaways), (v_game_id, v_mech_cascading), (v_game_id, v_mech_free_spins), (v_game_id, v_mech_multipliers);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_mid), (v_game_id, v_denom_ars_high), (v_game_id, v_denom_usd_mid);
  
  -- Juego 7: Legacy of Egypt (inspirado en Play'n GO)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Legacy of Egypt', v_game_type_video_slot, '2023-10-10', '2023-11-01', 96.50, v_vol_medium, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_egyptian);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_free_spins), (v_game_id, v_mech_multipliers);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_low), (v_game_id, v_denom_usd_low);
  
  -- Juego 8: Raging Rhino Megaways
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Raging Rhino Megaways', v_game_type_megaways, '2024-02-20', '2024-03-05', 96.15, v_vol_high, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_animals);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_megaways), (v_game_id, v_mech_free_spins), (v_game_id, v_mech_cascading);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_mid), (v_game_id, v_denom_usd_mid), (v_game_id, v_denom_usd_high);
  
  -- Juego 9: Starburst (inspirado en NetEnt via Play'n GO)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Starburst', v_game_type_video_slot, '2023-09-15', '2023-10-01', 96.09, v_vol_low, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_space);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_expanding_wilds), (v_game_id, v_mech_respins);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_low), (v_game_id, v_denom_ars_mid), (v_game_id, v_denom_usd_low);
  
  -- Juego 10: Dead or Alive 2 (inspirado en Play'n GO)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Dead or Alive 2', v_game_type_video_slot, '2024-01-25', '2024-02-10', 96.80, v_vol_high, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_western);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_free_spins), (v_game_id, v_mech_multipliers);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_high), (v_game_id, v_denom_usd_high);
  
  -- Juego 11: Jammin' Jars (inspirado en Push Gaming)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Jammin'' Jars', v_game_type_cluster, '2023-11-05', '2023-11-20', 96.83, v_vol_high, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_fruits);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_cascading), (v_game_id, v_mech_multipliers);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_mid), (v_game_id, v_denom_usd_mid);
  
  -- Juego 12: Dragon's Luck (inspirado en RedTiger)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Dragon''s Luck', v_game_type_video_slot, '2024-02-05', '2024-02-20', 96.29, v_vol_medium, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_asian), (v_game_id, v_theme_mythology);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_respins), (v_game_id, v_mech_multipliers);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_low), (v_game_id, v_denom_ars_mid);
  
  -- Juego 13: Mysteries of the Phoenix (inspirado en RedTiger)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Mysteries of the Phoenix', v_game_type_hold_win, '2024-03-10', NULL, 95.20, v_vol_medium_high, v_status_inactive)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_mythology), (v_game_id, v_theme_fantasy);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_respins), (v_game_id, v_mech_bonus_game);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_usd_mid);
  
  -- Juego 14: Wild Sevens (inspirado en RedTiger)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Wild Sevens', v_game_type_slot, '2023-12-01', '2023-12-20', 96.50, v_vol_low, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_fruits);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_multipliers);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_low), (v_game_id, v_denom_usd_low);
  
  -- Juego 15: Moon Princess (inspirado en Play'n GO)
  INSERT INTO games (name, game_type_id, trailer_release_date, integration_date, rtp, volatility_id, status_id)
  VALUES ('Moon Princess', v_game_type_cluster, '2024-01-30', '2024-02-15', 96.50, v_vol_medium_high, v_status_active)
  RETURNING id INTO v_game_id;
  
  INSERT INTO games_themes (game_id, theme_id) VALUES (v_game_id, v_theme_fantasy), (v_game_id, v_theme_asian);
  INSERT INTO games_mechanics (game_id, mechanic_id) VALUES (v_game_id, v_mech_cascading), (v_game_id, v_mech_multipliers), (v_game_id, v_mech_free_spins);
  INSERT INTO game_denominations (game_id, denomination_id) VALUES (v_game_id, v_denom_ars_mid), (v_game_id, v_denom_usd_mid);
  
  RAISE NOTICE 'Se crearon 15 juegos de prueba con tipos, temáticas, mecánicas y denominaciones';
END $$;
