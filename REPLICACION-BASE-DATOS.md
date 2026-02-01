# Opciones para Replicar Base de Datos de Supabase

## Opción 1: Exportar Schema Completo (Recomendado para Backup)

### Ventajas:
- Simple y directo
- Portátil a cualquier PostgreSQL
- Versionable en Git

### Cómo hacerlo:

Ya tienes todas tus migraciones en la carpeta `supabase/migrations/`. Para replicar en otro servidor:

1. **Concatenar todas las migraciones:**
```bash
cat supabase/migrations/*.sql > schema-completo.sql
```

2. **Aplicar en otro PostgreSQL:**
```bash
psql -h nuevo-servidor -U usuario -d database < schema-completo.sql
```

---

## Opción 2: Exportar Datos + Schema con pg_dump

### Para exportar TODO (schema + datos):

```bash
# Obtén la URL de conexión de Supabase:
# Settings > Database > Connection string (Direct connection)

# Exportar schema + datos
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  -f backup-completo.sql

# Solo schema (sin datos)
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --schema-only \
  --no-owner \
  --no-privileges \
  -f schema-only.sql

# Solo datos (sin schema)
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --data-only \
  --no-owner \
  --no-privileges \
  -f data-only.sql
```

### Para importar en otro servidor:

```bash
psql -h nuevo-host -U usuario -d database < backup-completo.sql
```

---

## Opción 3: Replicación Continua (Avanzado)

### Supabase a PostgreSQL Externo:

Supabase permite replicación en tiempo real usando **Logical Replication**:

1. En Supabase Dashboard:
   - Database > Replication
   - Habilitar logical replication

2. En tu servidor PostgreSQL:
```sql
-- Crear subscription
CREATE SUBSCRIPTION mi_sub
CONNECTION 'postgresql://postgres:[PASSWORD]@[SUPABASE_HOST]:5432/postgres'
PUBLICATION supabase_realtime;
```

---

## Opción 4: Migrar a Otro Supabase Project

Si quieres moverte a otra instancia de Supabase:

1. **Crear nuevo proyecto en Supabase**

2. **Aplicar migraciones:**
```bash
# En el nuevo proyecto, aplicar todas tus migraciones
# Ya tienes todas en supabase/migrations/
```

3. **Copiar datos:**
```bash
# Exportar de proyecto viejo
pg_dump "OLD_SUPABASE_URL" --data-only -f data.sql

# Importar a proyecto nuevo
psql "NEW_SUPABASE_URL" < data.sql
```

---

## Opción 5: Usar Herramientas de Terceros

### A) **Supabase CLI** (Oficial)
```bash
# Instalar
npm install -g supabase

# Exportar schema
supabase db dump -f schema.sql

# Exportar datos
supabase db dump --data-only -f data.sql
```

### B) **pgAdmin** (GUI)
- Conectar a Supabase
- Click derecho en database > Backup
- Restaurar en otro servidor

### C) **DBeaver** (GUI multiplataforma)
- Soporta exportación/importación
- Interfaz visual amigable

---

## Opción 6: Backup Automático con Scripts

Puedes crear un script que se ejecute periódicamente:

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
SUPABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

mkdir -p $BACKUP_DIR

# Backup completo
pg_dump "$SUPABASE_URL" \
  --no-owner \
  --no-privileges \
  --clean \
  -f "$BACKUP_DIR/backup_$DATE.sql"

# Comprimir
gzip "$BACKUP_DIR/backup_$DATE.sql"

echo "Backup creado: backup_$DATE.sql.gz"

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

---

## Recomendaciones por Caso de Uso:

### Para Desarrollo/Testing:
✅ **Opción 1** - Usar migraciones existentes

### Para Backup Regular:
✅ **Opción 2** - pg_dump automático
✅ **Opción 6** - Script de backup programado

### Para Migración a Producción:
✅ **Opción 2** o **Opción 4** - Migración completa

### Para Alta Disponibilidad:
✅ **Opción 3** - Replicación continua

---

## Datos de Conexión de Supabase

Puedes encontrar tu URL de conexión en:
1. Supabase Dashboard
2. Settings > Database
3. Connection string (Direct connection)

Formato:
```
postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres
```

---

## Importante:

⚠️ **Seguridad:**
- NUNCA subas archivos SQL con datos sensibles a Git
- Usa variables de entorno para passwords
- Encripta los backups si contienen datos sensibles

⚠️ **Extensiones:**
Supabase usa extensiones de PostgreSQL. Asegúrate que tu servidor destino las tenga:
- `pgcrypto` (para encriptación)
- `uuid-ossp` (para UUIDs)
- `pg_trgm` (para búsquedas)

---

## Siguiente Paso:

¿Qué tipo de replicación necesitas?
- Backup ocasional
- Migración a otro servidor
- Replicación continua
- Múltiples entornos (dev/staging/prod)

Según tu necesidad, puedo crear los scripts específicos.
