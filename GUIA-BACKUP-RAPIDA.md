# Guía Rápida de Backup y Restauración

## Hacer un Backup (2 minutos)

### Opción A: Backup Rápido con Script

```bash
./backup-database.sh
```

Te preguntará:
1. Password de Supabase (lo sacas del Dashboard)
2. Qué tipo de backup quieres

**Resultado:** Archivo comprimido en `database-backups/`

### Opción B: Backup Manual Rápido

```bash
# Solo concatenar tus migraciones (sin datos)
cat supabase/migrations/*.sql > mi-schema.sql
```

---

## Restaurar un Backup

```bash
./restore-database.sh database-backups/full_backup_20260120_140530.sql.gz
```

---

## Obtener Password de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Settings > Database
3. Scroll hasta "Connection string"
4. Click en "Direct connection"
5. El password está en la URL después de `postgres:`

Formato:
```
postgresql://postgres:[TU-PASSWORD-AQUI]@db.xxx.supabase.co:5432/postgres
```

---

## Casos de Uso Comunes

### Caso 1: Backup antes de cambios importantes

```bash
./backup-database.sh
# Elige opción 3 (Completo)
```

### Caso 2: Migrar a nuevo servidor

```bash
# 1. Hacer backup completo
./backup-database.sh

# 2. En el nuevo servidor, restaurar
./restore-database.sh database-backups/full_backup_FECHA.sql.gz
```

### Caso 3: Replicar en ambiente de desarrollo local

```bash
# 1. Exportar de producción
./backup-database.sh

# 2. Instalar PostgreSQL localmente
# 3. Restaurar
./restore-database.sh database-backups/backup.sql.gz
# Elige opción 2 (PostgreSQL personalizado)
# Host: localhost
```

### Caso 4: Backup automático diario

Agregar a crontab:

```bash
# Editar crontab
crontab -e

# Agregar línea (ejecutar diario a las 2 AM)
0 2 * * * cd /ruta/a/tu/proyecto && ./backup-database.sh <<< $'[PASSWORD]\n3\nn'
```

---

## Herramientas Necesarias

Para usar los scripts necesitas tener instalado:

```bash
# En Ubuntu/Debian
sudo apt install postgresql-client

# En macOS
brew install postgresql

# En Windows
# Descargar PostgreSQL desde postgresql.org
# O usar WSL
```

---

## Portabilidad

Tus backups son compatibles con:
- ✅ Cualquier PostgreSQL (versión 12+)
- ✅ Otro proyecto de Supabase
- ✅ AWS RDS PostgreSQL
- ✅ Google Cloud SQL
- ✅ Azure Database for PostgreSQL
- ✅ DigitalOcean Managed Databases
- ✅ PostgreSQL en servidor propio

---

## Verificar que el Backup Funcionó

```bash
# Descomprimir y ver contenido
gunzip -c database-backups/backup.sql.gz | head -50

# Debería mostrar tus tablas y datos
```

---

## Problemas Comunes

### "pg_dump: command not found"
**Solución:** Instala postgresql-client (ver sección Herramientas Necesarias)

### "password authentication failed"
**Solución:** Verifica que el password sea correcto. Cópialo directamente del Dashboard de Supabase.

### "role does not exist"
**Solución:** Los scripts ya incluyen `--no-owner` para evitar este problema. Si persiste, edita manualmente el SQL y elimina líneas con `OWNER TO`.

### El backup es muy grande
**Solución:**
- Haz backup solo del schema (opción 1)
- Excluye tablas grandes con: `pg_dump --exclude-table=tabla_grande`

---

## Seguridad

- ⚠️ Los backups contienen TODOS tus datos
- 🔒 NO los subas a Git (ya están en .gitignore)
- 🔐 Encrípta backups con datos sensibles:
  ```bash
  # Encriptar
  gpg -c backup.sql.gz

  # Desencriptar
  gpg backup.sql.gz.gpg
  ```

---

## Para más opciones avanzadas

Lee el archivo `REPLICACION-BASE-DATOS.md` con todas las opciones detalladas.
