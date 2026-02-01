# Instrucciones para Subir Código a GitHub

## Estado Actual
✅ Código completo commiteado localmente (219 archivos, 38,492 líneas)
✅ Repositorio remoto configurado
⏳ Pendiente: Hacer push a GitHub

## Opción 1: Token de Acceso Personal (RECOMENDADO)

### Paso 1: Crear Token en GitHub
1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token" → "Generate new token (classic)"
3. Dale un nombre: `Bull Power Deploy`
4. Marca estos permisos:
   - ✅ repo (todos los sub-permisos)
   - ✅ workflow
5. Click en "Generate token"
6. **COPIA EL TOKEN** (solo se muestra una vez)

### Paso 2: Configurar el Push con Token
Ejecuta estos comandos en la terminal de Bolt:

```bash
# Configurar la URL remota con tu token
git remote set-url origin https://TU_TOKEN_AQUI@github.com/bplayoficialpromociones-cyber/bullpowerdev.git

# Hacer push
git push origin main --force-with-lease
```

Reemplaza `TU_TOKEN_AQUI` con el token que copiaste.

---

## Opción 2: SSH (Si ya tienes SSH configurado)

```bash
# Cambiar a SSH
git remote set-url origin git@github.com:bplayoficialpromociones-cyber/bullpowerdev.git

# Hacer push
git push origin main --force-with-lease
```

---

## Después del Push Exitoso

Una vez que hagas push, conecta Netlify:

1. Ve a: https://app.netlify.com/start
2. Click en "Import an existing project"
3. Selecciona GitHub
4. Busca: `bullpowerdev`
5. Configura:
   - **Branch to deploy:** main
   - **Build command:** npm run build
   - **Publish directory:** dist
6. Click "Deploy site"

### Variables de Entorno en Netlify
Después del deploy, configura las variables de entorno:

1. Ve a: Site settings → Environment variables
2. Agrega:
   - `VITE_SUPABASE_URL`: (tu URL de Supabase)
   - `VITE_SUPABASE_ANON_KEY`: (tu key anónima de Supabase)

---

## Verificación Final

Después del deploy:
- ✅ GitHub actualizado con todo el código
- ✅ Netlify desplegando automáticamente
- ✅ Variables de entorno configuradas
- ✅ Sitio funcionando en producción

## URL del Repositorio
https://github.com/bplayoficialpromociones-cyber/bullpowerdev

## Resumen del Commit
- **219 archivos**
- **38,492 líneas de código**
- Sistema completo: Auth, CRM, Gastos, Facturación, Juegos, Jugadores
- Base de datos con migraciones y Edge Functions
- UI responsive con tema claro/oscuro
