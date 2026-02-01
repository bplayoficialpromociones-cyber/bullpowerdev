# Bull Power Admin - Credenciales de Acceso

## Sistema Completado

Se ha completado exitosamente la implementación del sistema de autenticación y gestión de usuarios para Bull Power Admin.

---

## URL de Acceso

**Login:** http://localhost:5173/login (en desarrollo)

---

## Credenciales de Usuario

### 🔴 Super Admin (Acceso Total)

#### Usuario 1 - Administrador Principal
- **Email:** admin@bullpower.com
- **Contraseña:** BullPower2026!
- **Nombre:** Administrador Principal
- **Rol:** Super Admin
- **Permisos:** Acceso completo a todas las funcionalidades sin restricciones
- **2FA:** Deshabilitado (puede habilitarse desde el perfil)

#### Usuario 2 - Super Administrador
- **Email:** superadmin@bullpower.com
- **Contraseña:** SuperAdmin2026!
- **Nombre:** Super Administrador
- **Rol:** Super Admin
- **Permisos:** Acceso completo a todas las funcionalidades sin restricciones
- **2FA:** Deshabilitado (puede habilitarse desde el perfil)

---

### 💰 Facturación

#### Usuario 1 - María Fernández
- **Email:** facturacion1@bullpower.com
- **Contraseña:** Factura2026!
- **Nombre:** María Fernández
- **Rol:** Facturación
- **Permisos:**
  - Facturación (ver, crear, editar, eliminar, gestionar)
  - Gastos (ver, crear, editar, eliminar, gestionar)
  - Analytics (ver, exportar, gestionar)
  - CRM (solo ver)
  - Tráfico (solo ver)
- **2FA:** Deshabilitado

#### Usuario 2 - Carlos Rodríguez
- **Email:** facturacion2@bullpower.com
- **Contraseña:** Factura2026!
- **Nombre:** Carlos Rodríguez
- **Rol:** Facturación
- **Permisos:** Igual que Usuario 1
- **2FA:** Deshabilitado

---

### 🔌 Integrador

#### Usuario 1 - Juan López
- **Email:** integrador1@bullpower.com
- **Contraseña:** Integra2026!
- **Nombre:** Juan López
- **Rol:** Integrador
- **Permisos:**
  - Integraciones (ver, crear, editar, eliminar, gestionar)
  - CRM (ver, crear, editar, eliminar, gestionar)
  - Tráfico (solo ver)
  - Analytics (solo ver)
  - Soporte (solo ver)
- **2FA:** Deshabilitado

#### Usuario 2 - Ana Martínez
- **Email:** integrador2@bullpower.com
- **Contraseña:** Integra2026!
- **Nombre:** Ana Martínez
- **Rol:** Integrador
- **Permisos:** Igual que Usuario 1
- **2FA:** Deshabilitado

---

### 🎧 Soporte

#### Usuario 1 - Laura García
- **Email:** soporte1@bullpower.com
- **Contraseña:** Soporte2026!
- **Nombre:** Laura García
- **Rol:** Soporte
- **Permisos:**
  - Soporte (ver, crear, editar, eliminar, gestionar)
  - CRM (solo ver)
  - Integraciones (solo ver)
  - Analytics (solo ver)
- **2FA:** Deshabilitado

#### Usuario 2 - Diego Sánchez
- **Email:** soporte2@bullpower.com
- **Contraseña:** Soporte2026!
- **Nombre:** Diego Sánchez
- **Rol:** Soporte
- **Permisos:** Igual que Usuario 1
- **2FA:** Deshabilitado

---

## Funcionalidades Implementadas

### ✅ Sistema de Autenticación
- Login con email y contraseña
- CAPTCHA matemático para seguridad adicional
- Protección contra fuerza bruta (bloqueo después de 5 intentos fallidos)
- Soporte completo para 2FA con Google Authenticator
- Validación de sesiones y tokens

### ✅ Gestión de Usuarios (Solo Super Admin)
- Ver lista completa de usuarios
- Crear nuevos usuarios con cualquier rol
- Editar usuarios existentes (nombre, email, contraseña, rol, estado)
- Eliminar usuarios (soft delete)
- Búsqueda y filtrado de usuarios
- Gestión de estado activo/inactivo

### ✅ Sistema de Roles y Permisos
- 4 roles predefinidos con permisos granulares
- Control de acceso basado en roles (RBAC)
- Permisos organizados por módulos
- Validación de permisos en cada acción

### ✅ Interfaz de Usuario
- Tema Light/Dark con toggle en todas las pantallas
- Diseño responsive (móvil, tablet, desktop)
- Sidebar con menú de navegación según rol
- Dashboard con estadísticas básicas
- Tipografía Outfit y sistema de espaciado 8px
- Colores turquesa como primario (según documentación)

### ✅ Base de Datos
- PostgreSQL con Supabase
- Tablas: roles, permissions, role_permissions, admin_users, admin_audit_log
- Soft deletes obligatorios
- Auditoría completa de acciones
- Funciones para hash y verificación de contraseñas con bcrypt

### ✅ Edge Functions Desplegadas
- `auth-login` - Login de usuarios
- `auth-verify-2fa` - Verificación de código 2FA
- `admin-users` - Listar usuarios
- `admin-roles` - Listar roles
- `admin-users-create` - Crear usuarios
- `admin-users-update` - Actualizar usuarios
- `admin-users-delete` - Eliminar usuarios (soft delete)

---

## Cómo Iniciar Sesión

1. Ir a http://localhost:5173/login
2. Ingresar email y contraseña de cualquier usuario de la lista
3. Resolver el CAPTCHA matemático
4. Hacer clic en "Iniciar Sesión"
5. Si el usuario tiene 2FA habilitado, ingresar el código de 6 dígitos de Google Authenticator
6. Serás redirigido al Dashboard

---

## Pantallas Disponibles

### Para Todos los Roles:
- `/dashboard` - Dashboard principal
- `/dashboard/perfil` - Perfil de usuario (pendiente de implementación)

### Solo Super Admin:
- `/dashboard/usuarios` - Gestión completa de usuarios admin

### Según Rol:
- **Facturación:** Facturación, Gastos, Analytics, CRM (ver), Tráfico (ver)
- **Integrador:** Integraciones, CRM, Tráfico (ver), Analytics (ver)
- **Soporte:** Soporte, CRM (ver), Integraciones (ver), Analytics (ver)

---

## Próximos Pasos

### Tareas Pendientes (No Implementadas Aún):
1. Configuración de 2FA desde el perfil de usuario
2. Pantalla de perfil de usuario
3. Módulos de CRM, Facturación, Gastos, Integraciones, Soporte, Tráfico, Analytics
4. Recuperación de contraseña
5. Cambio de contraseña obligatorio en primer login
6. Exportación de reportes
7. Notificaciones y alertas

---

## Seguridad

### Medidas Implementadas:
- Contraseñas hasheadas con bcrypt (factor 10)
- Protección contra fuerza bruta con bloqueo temporal
- Soft deletes (los datos nunca se eliminan físicamente)
- Auditoría completa de todas las acciones
- Validación de inputs en frontend y backend
- CORS configurado correctamente
- JWT para manejo de sesiones
- 2FA opcional con TOTP (Google Authenticator)

### Importante:
- NUNCA compartir estas credenciales fuera del equipo
- Cambiar las contraseñas en producción
- Los usuarios con rol Super Admin tienen acceso total sin restricciones

---

## Soporte Técnico

Para cualquier problema o consulta sobre el sistema:
- Revisar logs en Supabase Dashboard
- Verificar que las Edge Functions estén desplegadas correctamente
- Comprobar que la base de datos tenga todos los datos iniciales
- Asegurarse de que las variables de entorno estén configuradas

---

## Stack Tecnológico

- **Frontend:** React 18.3.1 + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase + PostgreSQL + Edge Functions (Deno)
- **Autenticación:** Custom con JWT + bcrypt + TOTP
- **UI:** Lucide React icons + Outfit font + Responsive design
- **Tema:** Light/Dark mode con LocalStorage

---

**Fecha de Creación:** Enero 2026
**Versión del Sistema:** 1.0.0
**Estado:** Listo para uso en desarrollo
