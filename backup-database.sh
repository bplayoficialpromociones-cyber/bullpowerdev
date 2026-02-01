#!/bin/bash

# Script de Backup de Base de Datos Supabase
# Uso: ./backup-database.sh

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Backup de Base de Datos Supabase ===${NC}\n"

# Crear directorio de backups
BACKUP_DIR="./database-backups"
mkdir -p "$BACKUP_DIR"

# Fecha actual
DATE=$(date +%Y%m%d_%H%M%S)

# Leer variables de entorno
source .env

# Construir URL de conexión
# Nota: Necesitas obtener el password de tu Supabase Dashboard
# Settings > Database > Database Settings > Connection string
SUPABASE_HOST=$(echo $VITE_SUPABASE_URL | sed 's|https://||' | sed 's|http://||')
SUPABASE_PROJECT_ID=$(echo $SUPABASE_HOST | cut -d'.' -f1)

echo -e "${YELLOW}Nota: Necesitas el password de la base de datos de Supabase${NC}"
echo "Encuéntralo en: Supabase Dashboard > Settings > Database > Connection string"
echo ""
read -sp "Ingresa el password de PostgreSQL: " DB_PASSWORD
echo ""

# URL de conexión directa
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres"

echo -e "\n${GREEN}Opciones de backup:${NC}"
echo "1) Solo schema (estructura de tablas, sin datos)"
echo "2) Solo datos (sin estructura)"
echo "3) Completo (schema + datos)"
echo "4) Todas las migraciones concatenadas"
echo ""
read -p "Elige una opción (1-4): " OPTION

case $OPTION in
  1)
    echo -e "\n${GREEN}Exportando solo schema...${NC}"
    pg_dump "$DB_URL" \
      --schema-only \
      --no-owner \
      --no-privileges \
      --clean \
      --if-exists \
      -f "$BACKUP_DIR/schema_${DATE}.sql"

    BACKUP_FILE="$BACKUP_DIR/schema_${DATE}.sql"
    ;;

  2)
    echo -e "\n${GREEN}Exportando solo datos...${NC}"
    pg_dump "$DB_URL" \
      --data-only \
      --no-owner \
      --no-privileges \
      -f "$BACKUP_DIR/data_${DATE}.sql"

    BACKUP_FILE="$BACKUP_DIR/data_${DATE}.sql"
    ;;

  3)
    echo -e "\n${GREEN}Exportando schema + datos...${NC}"
    pg_dump "$DB_URL" \
      --no-owner \
      --no-privileges \
      --clean \
      --if-exists \
      -f "$BACKUP_DIR/full_backup_${DATE}.sql"

    BACKUP_FILE="$BACKUP_DIR/full_backup_${DATE}.sql"
    ;;

  4)
    echo -e "\n${GREEN}Concatenando todas las migraciones...${NC}"
    cat supabase/migrations/*.sql > "$BACKUP_DIR/migrations_${DATE}.sql"
    BACKUP_FILE="$BACKUP_DIR/migrations_${DATE}.sql"
    ;;

  *)
    echo -e "${RED}Opción inválida${NC}"
    exit 1
    ;;
esac

# Comprimir backup
if [ -f "$BACKUP_FILE" ]; then
  echo -e "\n${GREEN}Comprimiendo backup...${NC}"
  gzip "$BACKUP_FILE"
  BACKUP_FILE="${BACKUP_FILE}.gz"

  # Tamaño del archivo
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

  echo -e "\n${GREEN}✓ Backup completado exitosamente!${NC}"
  echo -e "Archivo: ${YELLOW}$BACKUP_FILE${NC}"
  echo -e "Tamaño: ${YELLOW}$SIZE${NC}"

  # Instrucciones de restauración
  echo -e "\n${GREEN}Para restaurar este backup:${NC}"
  echo "1. Descomprimir: gunzip $BACKUP_FILE"
  echo "2. Restaurar: psql [URL_NUEVA_DB] < ${BACKUP_FILE%.gz}"
else
  echo -e "${RED}Error: No se pudo crear el backup${NC}"
  exit 1
fi

# Limpiar backups antiguos (opcional)
read -p $'\n¿Eliminar backups antiguos (más de 30 días)? (s/n): ' CLEAN
if [ "$CLEAN" = "s" ] || [ "$CLEAN" = "S" ]; then
  find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
  echo -e "${GREEN}Backups antiguos eliminados${NC}"
fi

echo -e "\n${GREEN}=== Proceso completado ===${NC}"
