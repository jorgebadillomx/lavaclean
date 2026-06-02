# Rutina Codex + Claude

Este proyecto usa BMad como contrato de trabajo y dos asistentes con roles distintos:

- Codex: implementacion.
- Claude: revision, refactor, validacion de riesgos y segunda opinion.

## Ciclo diario

1. Elegir una sola story o cambio acotado de BMad.
2. Crear una rama desde `develop`.
3. Codex implementa el cambio en esa rama.
4. Ejecutar `yarn ci` en local.
5. Claude revisa el diff y busca riesgos, bordes y regresiones.
6. Si hay observaciones, corregir en la misma rama.
7. Abrir PR contra `develop`.
8. Mergear solo con aprobacion y checks verdes.
9. Cuando haya un bloque estable de cambios, hacer PR de `develop` a `main`.

## Reglas de colaboracion

- Una rama = un objetivo.
- No mezclar varias stories en una sola PR.
- Si Claude pide cambios grandes, seguir en la misma rama o crear una rama derivada desde `develop`.
- No trabajar directo en `main`.
- `main` solo recibe cambios ya validados.
- Cuando una decision quede estable, registrar un resumen en Mem0 para recuperarla en sesiones futuras.

## Uso sugerido de herramientas

- Codex CLI: escribir, ajustar y probar codigo.
- Claude: revisar el resultado, detectar edge cases y proponer mejoras.
- BMad: definir alcance, story y criterios antes de tocar codigo.

## Definicion practica

- `feature/*`: trabajo normal.
- `bugfix/*`: correccion no urgente.
- `hotfix/*`: correccion urgente desde produccion.
- `Mem0`: memoria persistente para hechos estables del proyecto.
