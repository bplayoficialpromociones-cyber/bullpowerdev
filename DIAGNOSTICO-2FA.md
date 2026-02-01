# Diagnóstico Completo del Problema 2FA

## Fecha: 17 de Enero 2026

## Problema Reportado

Usuario **maxinew2025@gmail.com** no puede iniciar sesión. El código de Google Authenticator es rechazado con error 401 "Código 2FA incorrecto".

## Investigación Realizada

### 1. Verificación de la Función Edge

Se confirmó que la función `auth-verify-2fa` funciona correctamente:
- ✓ Función deployada y ejecutándose
- ✓ TOTP correctamente implementado
- ✓ Logging detallado funcionando
- ✓ Test con otros usuarios: EXITOSO (facturacion1@bullpower.com)

### 2. Análisis del Secret en Base de Datos

```sql
SELECT email, two_factor_secret
FROM admin_users
WHERE email = 'maxinew2025@gmail.com';
```

**Resultado:**
- Email: maxinew2025@gmail.com
- Secret en DB: `Y62OQIXKFCN7JZ56M7XYMAUUGJ43K53C`
- Longitud: 32 caracteres (correcto)
- Formato: Base32 válido ✓

### 3. Generación de Código Correcto

Para el secret en la base de datos, el código correcto en el momento del test era:

```
Código ingresado por usuario: 315304
Código esperado según DB:     778043
¿Coinciden? NO ❌
```

### 4. Ventana de Tiempo Verificada

Códigos válidos en ventana de tiempo (±60 segundos):
- Offset -2 (-60s): 509258
- Offset -1 (-30s): 801182
- **Offset 0 (actual): 778043**
- Offset +1 (+30s): 651802
- Offset +2 (+60s): 980532

El código 315304 NO aparece en ninguna ventana de tiempo.

## Causa Raíz Identificada

**EL SECRET EN GOOGLE AUTHENTICATOR NO COINCIDE CON EL SECRET EN LA BASE DE DATOS**

Posibles razones:
1. Se regeneró el 2FA en algún momento y no se actualizó Google Authenticator
2. El usuario tiene múltiples cuentas y está viendo el código incorrecto
3. Se importó/exportó mal la configuración de Google Authenticator

## Solución Aplicada

Se regeneró completamente el 2FA para el usuario:

### Paso 1: Desactivar 2FA Anterior
```bash
node regenerate-2fa-maxinew.js
```
✓ 2FA desactivado correctamente

### Paso 2: Generar Nuevo Secret
**Nuevo Secret:** `J3E6OKGBESQ3JGFOU6HOPO57BEZOF4B6`

### Paso 3: Generar QR Code
**QR Code URL:**
```
https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=otpauth%3A%2F%2Ftotp%2FBull%2520Power%2520Admin%3Amaxinew2025%2540gmail.com%3Fsecret%3DJ3E6OKGBESQ3JGFOU6HOPO57BEZOF4B6%26issuer%3DBull%2520Power%2520Admin
```

## Instrucciones para el Usuario

### IMPORTANTE: Debes configurar Google Authenticator de nuevo

1. **Abre Google Authenticator** en tu teléfono

2. **Elimina la cuenta antigua:**
   - Busca "Bull Power Admin - maxinew2025@gmail.com"
   - Presiona y mantén presionado
   - Selecciona "Eliminar"

3. **Agregar nueva cuenta:**
   - Toca el botón "+" o "Agregar cuenta"
   - Selecciona "Escanear código QR"

4. **Escanea el nuevo QR:**
   - Abre esta URL en tu navegador:
   ```
   https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=otpauth%3A%2F%2Ftotp%2FBull%2520Power%2520Admin%3Amaxinew2025%2540gmail.com%3Fsecret%3DJ3E6OKGBESQ3JGFOU6HOPO57BEZOF4B6%26issuer%3DBull%2520Power%2520Admin
   ```
   - Escanea el QR que aparece en pantalla

5. **Probar el nuevo código:**
   - Ve a https://bullpowerdev.ar/login
   - Ingresa: maxinew2025@gmail.com
   - Ingresa tu contraseña
   - Usa el código de 6 dígitos del NUEVO Google Authenticator
   - Debe funcionar ahora ✓

## Script de Verificación

Para verificar que cualquier usuario tenga el código correcto, ejecuta:

```bash
node test-maxinew-2fa.js
```

Este script:
- Verifica el secret en la base de datos
- Genera el código correcto para el momento actual
- Muestra la ventana de tiempo de códigos válidos
- Compara con el código ingresado

## Prevención Futura

### Para Administradores:

Cuando un usuario reporte problemas con 2FA:

1. **NO asumas que la función está rota** - La función 2FA funciona correctamente
2. **Verifica primero el secret** usando el script de diagnóstico
3. **Regenera el 2FA** si el código no coincide
4. **Asegúrate que el usuario escanee el nuevo QR**

### Scripts Disponibles:

- `test-2fa-complete.js` - Test completo del sistema 2FA
- `test-2fa-real-user.js` - Test con usuario real específico
- `test-maxinew-2fa.js` - Diagnóstico específico para un usuario
- `regenerate-2fa-maxinew.js` - Regenerar 2FA para un usuario

## Funcionalidad Recomendada

Se recomienda agregar en el panel de Admin Users:
- ✓ Botón "Regenerar 2FA" para cada usuario
- ✓ Mostrar QR code al regenerar
- ✓ Opción para descargar QR como imagen
- ✓ Mostrar el secret manualmente (para ingreso manual)

## Conclusión

El problema NO era un bug en el código 2FA. El problema era que el usuario tenía configurado un secret diferente en Google Authenticator.

**Estado actual:**
- ✓ 2FA regenerado para maxinew2025@gmail.com
- ✓ Nuevo QR code generado
- ⏳ Usuario debe escanear el nuevo QR

Una vez que escanees el nuevo QR code, el login funcionará perfectamente.

## Estado de Todos los Usuarios

| Usuario | Email | 2FA Activo | Estado |
|---------|-------|------------|--------|
| 1 | 1rominera@gmail.com | ✓ | OK |
| 2 | facturacion1@bullpower.com | ✓ | OK (verificado) |
| 3 | facturacion2@bullpower.com | ✓ | OK |
| 4 | maxinew2025@gmail.com | ✓ | ⚠️ REGENERADO - escanear nuevo QR |
| 5 | integrador1@bullpower.com | - | N/A |
| 6 | integrador2@bullpower.com | - | N/A |
| 7 | soporte1@bullpower.com | - | N/A |
| 8 | soporte2@bullpower.com | - | N/A |
| 9 | superadmin@bullpower.com | - | N/A |
