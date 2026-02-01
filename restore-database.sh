#!/bin/bash

# Script de Restauración de Base de Datos
# Uso: ./restore-database.sh <archivo-backup.sql.gz>

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Restauración de Base de Datos ===${NC}\n"

# Verificar argumento
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Backups disponibles:${NC}"
    ls -lh database-backups/*.sql.gz 2>/dev/null || echo "No hay backups disponibles"
    echo ""
    echo -e "${RED}Uso: ./restore-database.sh <archivo-backup>${NC}"
    echo "Ejemplo: ./restore-database.sh database-backups/full_backup_20260120_140530.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: El archivo $BACKUP_FILE no existe${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  ADVERTENCIA ⚠️${NC}"
echo "Este proceso va a:"
echo "1. Eliminar todas las tablas existentes"
echo "2. Restaurar el backup seleccionado"
echo ""
echo -e "${RED}Esto ELIMINARÁ todos los datos actuales de la base de datos${NC}"
echo ""
read -p "¿Estás seguro? Escribe 'SI' para continuar: " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    echo -e "${YELLOW}Operación cancelada${NC}"
    exit 0
fi

# Pedir URL de base de datos destino
echo ""
echo -e "${GREEN}Ingresa la información de la base de datos destino:${NC}"
echo ""
echo "Opciones:"
echo "1) Restaurar en Supabase (necesitas password)"
echo "2) Restaurar en PostgreSQL personalizado"
echo ""
read -p "Elige una opción (1-2): " DB_OPTION

if [ "$DB_OPTION" = "1" ]; then
    # Supabase
    source .env 2>/dev/null || true
    SUPABASE_HOST=$(echo $VITE_SUPABASE_URL | sed 's|https://||' | sed 's|http://||')
    SUPABASE_PROJECT_ID=$(echo $SUPABASE_HOST | cut -d'.' -f1)

    echo ""
    echo "Necesitas el password de Supabase Dashboard > Settings > Database"
    read -sp "Ingresa el password de PostgreSQL: " DB_PASSWORD
    echo ""

    DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres"

elif [ "$DB_OPTION" = "2" ]; then
    # PostgreSQL personalizado
    read -p "Host (ej: localhost): " DB_HOST
    read -p "Puerto (5432): " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    read -p "Usuario (postgres): " DB_USER
    DB_USER=${DB_USER:-postgres}
    read -sp "Password: " DB_PASSWORD
    echo ""
    read -p "Nombre de base de datos: " DB_NAME

    DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
else
    echo -e "${RED}Opción inválida${NC}"
    exit 1
fi

# Descomprimir si es necesario
if [[ $BACKUP_FILE == *.gz ]]; then
    echo -e "\n${GREEN}Descomprimiendo backup...${NC}"
    SQL_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$SQL_FILE"
    TEMP_FILE="$SQL_FILE"
else
    TEMP_FILE="$BACKUP_FILE"
fi

# Restaurar
echo -e "\n${GREEN}Restaurando base de datos...${NC}"
echo "Esto puede tomar varios minutos..."

if psql "$DB_URL" < "$TEMP_FILE" 2>&1 | grep -v "NOTICE"; then
    echo -e "\n${GREEN}✓ Base de datos restaurada exitosamente!${NC}"

    # Limpiar archivo temporal si se descomprimió
    if [[ $BACKUP_FILE == *.gz ]]; then
        rm "$TEMP_FILE"
    fi

    echo -e "\n${GREEN}Verificación:${NC}"
    echo "Conecta a tu base de datos y verifica que todo esté correcto."

else
    echo -e "\n${RED}Error durante la restauración${NC}"
    echo "Revisa los mensajes de error arriba"

    # Limpiar archivo temporal si se descomprimió
    if [[ $BACKUP_FILE == *.gz ]]; then
        rm "$TEMP_FILE"
    fi

    exit 1
fi

echo -e "\n${GREEN}=== Proceso completado ===${NC}"
