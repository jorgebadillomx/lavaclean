# Keystore de LavaClean

## Respaldo desde EAS Cloud

1. Listar las credenciales de Android:

   ```bash
   eas credentials --platform android
   ```

2. Elegir la opción para descargar el keystore existente.
3. Guardar el archivo descargado en una ubicacion segura fuera del repositorio.
4. Mantener una copia cifrada en el respaldo offline del equipo.

## Datos que deben guardarse junto al `.keystore`

| Dato | Dónde obtenerlo |
| --- | --- |
| Alias del keystore | EAS Credentials o `keytool -list -v -keystore <archivo>` |
| Contraseña del keystore | Gestor de secretos del equipo |
| Contraseña de la llave | Gestor de secretos del equipo |

## Restauracion

1. Abrir las credenciales de Android:

   ```bash
   eas credentials --platform android
   ```

2. Elegir la opcion para configurar un keystore propio.
3. Subir el archivo `.keystore` respaldado.
4. Verificar que el alias y las contraseñas coincidan con el respaldo documentado.

## Notas operativas

- EAS Cloud conserva el keystore principal.
- Si el keystore se pierde y no hay respaldo, la app debe firmarse nuevamente y reinstalarse en los dispositivos.
- No almacenar secretos reales ni archivos de firma en el repositorio.
