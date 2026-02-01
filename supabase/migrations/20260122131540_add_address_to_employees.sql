/*
  # Agregar columna de dirección a empleados

  1. Cambios
    - Se agrega columna `address_id` (UUID, opcional) a la tabla `crm_employees`
    - La columna tiene una referencia de clave foránea a `crm_addresses(id)` con DELETE RESTRICT
    - Permite mantener una dirección asociada a cada empleado

  2. Notas
    - La columna es opcional (NULL) para mantener compatibilidad con empleados existentes
    - RESTRICT evita eliminar direcciones que estén en uso por empleados
*/

-- Agregar columna address_id a crm_employees
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crm_employees' AND column_name = 'address_id'
  ) THEN
    ALTER TABLE crm_employees
    ADD COLUMN address_id uuid REFERENCES crm_addresses(id) ON DELETE RESTRICT;
  END IF;
END $$;