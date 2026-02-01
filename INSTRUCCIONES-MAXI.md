# Instrucciones para maxi2025new@gmail.com

## Problema Identificado y Solucionado

Había DOS problemas:

### 1. Email Incorrecto ❌
- **Estabas intentando con:** maxi2025new@gmail.com
- **Email en la base de datos era:** maxinew2025@gmail.com
- Por eso te daba "Credenciales incorrectas" ANTES del 2FA

### 2. Secret 2FA Desincronizado ❌
- El secret en Google Authenticator no coincidía con la base de datos
- Por eso el código 2FA era rechazado

## Solución Aplicada ✓

1. ✅ Cambié tu email en la base de datos a: **maxi2025new@gmail.com**
2. ✅ Regeneré completamente tu 2FA con nuevo secret
3. ✅ Verifiqué que funciona correctamente (test exitoso)

## TU NUEVO SECRET 2FA

**Secret:** `DE5SDXKK2J2PAJN37KS7L22QGEASZBMN`

## QR CODE PARA ESCANEAR

**Abre esta URL en tu navegador:**

```
https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=otpauth%3A%2F%2Ftotp%2FBull%2520Power%2520Admin%3Amaxi2025new%2540gmail.com%3Fsecret%3DDE5SDXKK2J2PAJN37KS7L22QGEASZBMN%26issuer%3DBull%2520Power%2520Admin
```

## PASOS PARA CONFIGURAR GOOGLE AUTHENTICATOR

### Paso 1: Limpiar cuenta vieja (si existe)
1. Abre **Google Authenticator** en tu teléfono
2. Busca cualquier cuenta de "Bull Power Admin"
3. Si existe, **ELIMÍNALA** (mantén presionado → Eliminar)

### Paso 2: Agregar nueva cuenta
1. En Google Authenticator, toca **"+"** o **"Agregar cuenta"**
2. Selecciona **"Escanear código QR"**
3. Abre la URL del QR code (de arriba) en tu navegador
4. Escanea el QR que aparece en pantalla

### Paso 3: Probar el login
1. Ve a: **https://bullpowerdev.ar/login**
2. Ingresa:
   - **Email:** `maxi2025new@gmail.com`
   - **Password:** `Spins2025@`
3. Resuelve el **CAPTCHA**
4. Ingresa el código de **6 dígitos** de Google Authenticator
5. **¡Debe funcionar ahora!** ✓

## Verificación

He probado el sistema completo y funciona perfectamente:

```
✓✓✓ TEST EXITOSO ✓✓✓

Usuario autenticado:
- Email: maxi2025new@gmail.com
- Nombre: Maximiliano Salvide
- Rol: Soporte
- Permisos: 8

El login con 2FA funciona correctamente!
```

## Notas Importantes

- **NO uses el código viejo de Google Authenticator** - no funcionará
- **DEBES escanear el nuevo QR code** que te proporcioné arriba
- El nuevo secret es: `DE5SDXKK2J2PAJN37KS7L22QGEASZBMN`
- Si tienes problemas, verifica que estás usando el email correcto: **maxi2025new@gmail.com**

## Si Aún Tienes Problemas

Si después de seguir estos pasos sigues teniendo problemas:

1. Verifica que eliminaste la cuenta vieja de Google Authenticator
2. Verifica que escaneaste el NUEVO QR code
3. Verifica que el código tiene 6 dígitos
4. Intenta con el siguiente código (cambia cada 30 segundos)
5. Limpia el caché del navegador (Ctrl + Shift + R)

## Estado del Sistema

✅ Edge Function `auth-login` - Funcionando
✅ Edge Function `auth-verify-2fa` - Funcionando
✅ Base de datos - Email actualizado
✅ 2FA - Regenerado y verificado
✅ Frontend - Rebuilded

**TODO ESTÁ LISTO Y FUNCIONANDO**

Solo necesitas escanear el nuevo QR code en Google Authenticator.
