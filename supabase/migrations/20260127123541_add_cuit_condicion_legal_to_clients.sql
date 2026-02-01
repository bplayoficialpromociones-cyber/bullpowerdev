/*
  # Agregar campo CUIT - Condición Legal a Clientes

  1. Cambios
    - Se agrega el campo `cuit_condicion_legal` a la tabla `crm_clients`
    - Campo tipo TEXT para almacenar el CUIT y condición legal del cliente
    - Campo opcional (nullable)
  
  2. Notas
    - Este campo permitirá identificar la situación tributaria del cliente
    - Se puede utilizar para filtrar y buscar clientes por su CUIT
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crm_clients' AND column_name = 'cuit_condicion_legal'
  ) THEN
    ALTER TABLE crm_clients ADD COLUMN cuit_condicion_legal TEXT;
  END IF;
END $$;
