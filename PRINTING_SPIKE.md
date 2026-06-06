# Spike de Impresión RawBT - LavaClean

**Fecha:** 2026-06-05  
**Autor:** Jorge Badillo  
**Story:** 1.9

## Dispositivo de Prueba

| Campo | Valor |
| --- | --- |
| Modelo | RMX3921 / realme 13 Pro+ 5G |
| API Level | API 36 - Android 16 |
| RawBT versión | 7.1.2 (ru.a402d.rawbtprinter) |
| Impresora | Impresora térmica Bluetooth (emparejada y activa durante la prueba) |

## Intent Probado

**Mecanismo REAL que funcionó:** `expo-intent-launcher` (`startActivityAsync`)  
**Action:** `android.intent.action.SEND`  
**MIME type:** `text/plain`  
**Package:** `ru.a402d.rawbtprinter`  
**Class:** `ru.a402d.rawbtprinter.activity.PrintExtraActivity`  
**Extra key:** `android.intent.extra.TEXT`  
**Extra value:** `--- SPIKE LAVACLEAN ---\nTest de impresión\n\n\n`

### Por qué el API documentada NO funcionó

El API original documentada en RawBT (`rawbt.api.ACTION_PRINT_TEXT` via `Linking.sendIntent()`) **no está disponible en esta versión**.

| Mecanismo probado | Resultado | Razón |
| --- | --- | --- |
| `Linking.sendIntent('rawbt.api.ACTION_PRINT_TEXT', [...])` | ❌ `ActivityNotFoundException` | Esta versión de RawBT (7.1.2) no expone esta acción como Activity |
| `Linking.openURL('intent:#Intent;action=rawbt.api...')` | ❌ Error — React Native trata como ACTION_VIEW | React Native no soporta URIs `intent://` de esta forma |
| `expo-intent-launcher` con `android.intent.action.SEND` → `PrintExtraActivity` | ✅ **FUNCIONA** | Es el mecanismo real que usa RawBT 7.1.2 |

El mecanismo real fue descubierto inspeccionando el package con:

```sh
adb shell dumpsys package ru.a402d.rawbtprinter
```

Que reveló que `PrintExtraActivity` maneja `android.intent.action.SEND` con MIME `text/plain`.

## Resultado: RawBT Instalado (AC-SPIKE-01)

**Estado:** ✅ EXITOSO  
**Observación:** La impresora imprimió el ticket de prueba correctamente. El texto `--- SPIKE LAVACLEAN ---\nTest de impresión` apareció en papel. La respuesta es prácticamente instantánea (~1 segundo desde presionar el botón hasta que sale el papel).

**Implementación final en `RawBTPrinterAdapter.ts`:**

```typescript
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

const RAWBT_PACKAGE = 'ru.a402d.rawbtprinter';

export async function fireRawBTTestIntent(testText: string): Promise<'success' | 'not_installed' | 'error'> {
  if (Platform.OS !== 'android') return 'error';
  try {
    await IntentLauncher.startActivityAsync('android.intent.action.SEND', {
      type: 'text/plain',
      packageName: RAWBT_PACKAGE,
      className: `${RAWBT_PACKAGE}.activity.PrintExtraActivity`,
      extra: { 'android.intent.extra.TEXT': testText },
    });
    return 'success';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('ActivityNotFoundException') || message.includes('No Activity found') ||
        message.includes('Could not launch Intent') || message.includes('not found')) {
      return 'not_installed';
    }
    return 'error';
  }
}
```

## Resultado: RawBT NO Disponible (AC-SPIKE-02)

**Estado:** ✅ Validado — fallo controlado, sin crash

### Escenarios que producen fallback

| Escenario | Error observado | Clasificación |
| --- | --- | --- |
| RawBT no instalado | `Could not launch Intent with action rawbt.api.ACTION_PRINT_TEXT` | `not_installed` |
| RawBT no instalado (expo-intent-launcher) | `ActivityNotFoundException` / `Could not launch Intent` | `not_installed` |

**La app no crasheó en ningún caso.** El error es capturado en el bloque `catch` y retorna `not_installed`.

**Tipo de error para PrintingErrorClassifier (Epic 5):** `RAWBT_NOT_INSTALLED` (abarca tanto "no instalado" como "sin impresora conectada")

## Problemas Encontrados

1. **`Linking.sendIntent()` no funciona con RawBT 7.1.2** — La acción `rawbt.api.ACTION_PRINT_TEXT` no está registrada en esta versión. Requirió instalar `expo-intent-launcher` y usar el mecanismo real descubierto vía `adb dumpsys`.

2. **`Linking.openURL('intent://...')` tampoco funciona** — React Native trata el esquema `intent://` como `ACTION_VIEW` sobre el string URI, no como un intent Android real.

3. **Supabase tablas no existían** — Las migraciones de Story 1.6 nunca se habían aplicado en el dashboard de Supabase, lo que causaba que la app se quedara cargando indefinidamente. Fue necesario ejecutar las migraciones `000_initial_schema.sql`, `002_rls_policies.sql`, `003_public_catalog_access.sql` y `004_seed_data.sql`.

4. **SplashScreen no se ocultaba** — `SplashScreen.hideAsync()` nunca se llamaba en SDK 56. Se agregó en `InitializationGate.tsx` y `App.tsx`.

## Recomendaciones para Epic 5

- **Usar `expo-intent-launcher` directamente** — NO intentar `Linking.sendIntent()`. El adaptador de producción debe usar `startActivityAsync` con `android.intent.action.SEND` → `PrintExtraActivity`.
- **Declarar el package en `AndroidManifest.xml`** bajo `<queries>` para cumplir API 30+ (ya está en la versión actual).
- **Clasificar `ActivityNotFoundException` y `Could not launch Intent` como `RAWBT_NOT_INSTALLED`** en el `PrintingErrorClassifier`.
- **Validar antes de Epic 5** si `startActivityAsync` permite saber si la impresión fue exitosa o si se necesita un mecanismo de callback distinto — actualmente es fire-and-forget.
- **Registrar el modelo exacto de impresora Bluetooth** antes de Epic 5 para tener el protocolo ESC/POS correcto.

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
