/*
  # Seed de Catálogos de Juegos

  ## Descripción
  Carga los valores iniciales para los catálogos de volatilidades y estados de juegos.

  ## 1. Volatilidades
  - Alta
  - Baja
  - Media
  - Media/Alta
  - Media/Baja

  ## 2. Estados de Juegos
  - activo
  - inactivo
  - con bugs
*/

-- =====================================================
-- VOLATILIDADES DE JUEGOS
-- =====================================================

INSERT INTO game_volatilities (name) VALUES
  ('Alta'),
  ('Baja'),
  ('Media'),
  ('Media/Alta'),
  ('Media/Baja')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ESTADOS DE JUEGOS
-- =====================================================

INSERT INTO game_statuses (name) VALUES
  ('activo'),
  ('inactivo'),
  ('con bugs')
ON CONFLICT (name) DO NOTHING;
