# Spike de Impresión RawBT - LavaClean

**Fecha:** 2026-06-04  
**Autor:** Jorge Badillo  
**Story:** 1.9

## Dispositivo de Prueba

| Campo | Valor |
| --- | --- |
| Modelo | RMX3921 / realme 13 Pro+ 5G |
| API Level | API 36 - Android 16 |
| RAM | Pendiente de revalidación en hardware |
| RawBT versión | 7.1.2 |
| Impresora | Pendiente de registrar el modelo exacto; ADB se desconectó antes de completar la captura |

## Intent Probado

**Action:** `rawbt.api.ACTION_PRINT_TEXT`  
**Extra key:** `rawbt.api.EXTRA_PRINT_TEXT`  
**Extra value:** `--- SPIKE LAVACLEAN ---\nTest de impresión\n\n\n`  
**Mecanismo:** `Linking.sendIntent()`

## Resultado: RawBT Instalado (AC-SPIKE-01)

**Estado:** Validación de hardware pendiente

### Lo que sí quedó verificado

- El adaptador `fireRawBTTestIntent()` compila y pasa pruebas unitarias.
- La ruta de error para `ActivityNotFoundException` / `No Activity found` quedó cubierta en tests.
- El guard `Platform.OS === 'android'` evita ejecutar el Intent fuera de Android.

### Lo que quedó pendiente

- El dispositivo físico se desconectó de ADB antes de poder reabrir la app y presionar el botón `__DEV__`.
- No pude confirmar visualmente la impresión del ticket en papel desde esta sesión.

## Resultado: RawBT NO Disponible (AC-SPIKE-02)

**Estado:** ✅ Validado en dispositivo físico (realme 13 Pro+ 5G, API 36)

### Escenarios que producen fallback

| Escenario | Error observado | Clasificación |
| --- | --- | --- |
| RawBT no instalado | `No Activity found to handle Intent { act=rawbt.api.ACTION_PRINT_TEXT }` | `not_installed` |
| RawBT instalado, sin impresora conectada | `Could not launch Intent with action rawbt.api.ACTION_PRINT_TEXT.` | `not_installed` |

**Hallazgo clave:** RawBT no registra su Intent receiver cuando no hay una impresora Bluetooth activa — Android no encuentra Activity que maneje el Intent. Ambos escenarios producen `not_installed`, lo cual es correcto: sin impresora disponible = servicio no disponible.

**La app no crasheó en ningún caso** — el error es capturado y logueado con `console.error`.

**Tipo de error para PrintingErrorClassifier (Epic 5):** `RAWBT_NOT_INSTALLED` (abarca tanto "no instalado" como "sin impresora conectada")

## Problemas Encontrados

- `adb` perdió la conexión con el dispositivo durante la validación de hardware, así que no pude completar el flujo interactivo en la `LoginScreen`.
- El binario instalado en el dispositivo no es debuggable, por lo que no pude inyectar la versión actual del bundle sin generar un APK nuevo.

## Recomendaciones para Epic 5

- Mantener `Linking.sendIntent()` como primer intento y clasificar `ActivityNotFoundException` y `Could not launch Intent` como `RAWBT_NOT_INSTALLED`.
- Loguear el mensaje de error exacto para facilitar soporte y diagnósticos.
- Antes de Epic 5, repetir la validación con un APK staging nuevo y registrar el modelo exacto de la impresora Bluetooth junto con una foto del ticket.

## Monitoreo de Storage Supabase

**Umbral de alerta:** 400 MB (80% del límite de 500 MB del Free Tier)  
**Alerta automática:** No disponible en Free Tier — monitoreo manual requerido  
**Clave local registrada:** `storage_alert_threshold_mb = 400` en tabla `_meta` de SQLite

### Verificación de consumo actual

Para verificar el consumo actual en cualquier momento:

1. Ir al [Dashboard de Supabase](https://supabase.com/dashboard) → seleccionar el proyecto `lavaclean`
2. Navegar a **Settings → Billing → Usage** (muestra storage en la sección "Database")
3. También disponible en **Storage → Settings** para el bucket de archivos (si se usa)

**Consumo esperado en Sprint 0:** ≤ 10 MB (solo el schema + datos RLS iniciales, sin uploads de imágenes)

### Procedimiento de alerta manual

Dado que el Free Tier no incluye alertas automáticas de storage:

1. **Frecuencia:** Revisar el dashboard de Supabase **una vez al mes** al inicio del Sprint
2. **Acción si supera 400 MB:** Notificar al Administrador para evaluar limpiar storage o escalar el plan
3. **Para automatización futura (Epic posterior):** Usar la Supabase Management API (`/v1/projects/{ref}/usage`) para consultar storage y comparar contra el valor en `_meta.storage_alert_threshold_mb`
