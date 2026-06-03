# Arranque BMad desde `develop`

Este es el flujo por defecto para cualquier trabajo nuevo en `lavaclean`.

## Regla base

- Todo trabajo nuevo arranca desde `develop`.
- `main` solo recibe cambios ya validados y listos para produccion.
- Cada rama debe cubrir un solo objetivo.

## Secuencia recomendada

1. Hacer `git checkout develop` y `git pull`.
2. Identificar si el cambio ya existe como story o spec BMad.
3. Crear una rama corta: `feature/<id>-<tema>` o `bugfix/<tema>`.
4. Elegir el flujo BMad correcto.
5. Implementar, validar y pedir revision.
6. Abrir PR contra `develop`.
7. Promover a `main` solo cuando el bloque de cambios ya esta estable.

## Que flujo usar

- Si ya existe una story lista: usar `bmad-dev-story`.
- Si el cambio es chico y se puede ejecutar de punta a punta: usar `bmad-quick-dev`.
- Si el alcance no esta claro: usar primero `bmad-create-story` o el paso de planeacion que corresponda.
- Si el cambio necesita revision de calidad antes de mezclarlo: usar `bmad-code-review`.

## Regla para Codex y Claude

- Codex hace el cambio.
- Claude revisa el diff y busca riesgos.
- Si la revision pide cambios, se corrige en la misma rama.
- No se abren dos ramas para resolver el mismo objetivo.

## Criterio de salida

El trabajo puede subir a `develop` solo si:

- La rama representa un unico objetivo.
- Las pruebas locales pasaron.
- La revision de Claude no detecto bloqueos.
- La PR apunta a `develop`.

