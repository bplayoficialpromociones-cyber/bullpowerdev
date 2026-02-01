# Bull Power Dev - Internal Game Manufacturer Admin

Sistema de administración interna para fabricantes de juegos con autenticación segura, gestión de usuarios y control de roles.

## Características

- **Autenticación segura** con Supabase
- **Control de acceso basado en roles** (Super Admin, Admin, Usuario)
- **Autenticación de dos factores** (2FA)
- **Gestión de usuarios administrativos**
- **Tema claro/oscuro**
- **Panel de control responsivo**
- **Funciones Edge** para operaciones backend seguras

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Sistema personalizado con Supabase
- **Backend**: Supabase Edge Functions
- **Iconos**: Lucide React
- **Routing**: React Router v7

## Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Supabase
- Cuenta de Netlify (para deploy)

## Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/bplayoficialpromociones-cyber/bullpowerdev.git
cd bullpowerdev

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con:
# VITE_SUPABASE_URL=tu_url_de_supabase
# VITE_SUPABASE_ANON_KEY=tu_clave_anonima

# Ejecutar en desarrollo
npm run dev
```

## Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta las migraciones en `supabase/migrations/` en orden
3. Despliega las Edge Functions en `supabase/functions/`

## Deploy en Netlify

1. Conecta tu cuenta de GitHub con Netlify
2. Importa el repositorio `bullpowerdev`
3. Configura:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Añade las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Estructura del Proyecto

```
bullpowerdev/
├── src/
│   ├── components/     # Componentes React
│   ├── contexts/       # Contextos de React
│   ├── hooks/          # Custom hooks
│   ├── layouts/        # Layouts de la aplicación
│   ├── pages/          # Páginas principales
│   ├── styles/         # Estilos CSS
│   └── types/          # Tipos TypeScript
├── supabase/
│   ├── functions/      # Edge Functions
│   └── migrations/     # Migraciones de base de datos
└── public/             # Archivos estáticos

```

## Usuarios de Prueba

Después de ejecutar las migraciones, tendrás estos usuarios:

- **Super Admin**: superadmin@bullpowerdev.ar / SuperAdmin2024!
- **Admin**: admin@bullpowerdev.ar / Admin2024!
- **Usuario**: user@bullpowerdev.ar / User2024!

## Seguridad

- Todas las tablas tienen RLS (Row Level Security) habilitado
- Contraseñas hasheadas con bcrypt
- Tokens JWT para sesiones
- Validación en frontend y backend

## Licencia

Propietario - Bull Power Dev © 2026
