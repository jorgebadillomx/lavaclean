# Rutina Codex + Claude

Este proyecto usa BMad como contrato de trabajo y dos asistentes con roles distintos:

- Codex: implementacion.
- Claude: revision, refactor, validacion de riesgos y segunda opinion.

## Orden De Trabajo

Cuando trabajes este repo con BMad, sigue siempre este orden:

1. Leer Mem0 para recuperar decisiones estables y contexto de sesiones anteriores.
2. Activar el flujo BMad que corresponda al trabajo.
3. Consultar Context7 antes de escribir o modificar codigo.
4. Ejecutar el trabajo con Codex o revisar con Claude segun el rol.
5. Registrar en Mem0 solo las decisiones estables que deban sobrevivir a la sesion.

Regla operativa para `lavaclean`:

- al arrancar una sesion con BMad,
- antes de escoger `bmad-quick-dev`, `bmad-dev-story` o `bmad-create-story`,
- y antes de implementar algo que dependa de decisiones previas.

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
- No guardar en Mem0 documentos completos, solo resúmenes estables y útiles.
- Si el trabajo requiere codigo, consultar Context7 antes de implementar para obtener documentacion actualizada.

## Uso sugerido de herramientas

- Codex CLI: escribir, ajustar y probar codigo.
- Claude: revisar el resultado, detectar edge cases y proponer mejoras.
- BMad: definir alcance, story y criterios antes de tocar codigo.
- Skills de Claude: cualquier skill que exista en `.claude/skills` debe tener su mirror en `.agents/skills` para que Codex CLI la use nativamente.
- Mem0: recuperar contexto estable antes de entrar a BMad.
- Context7: documentacion actualizada antes de escribir codigo.

## Definicion practica

- `feature/*`: trabajo normal.
- `bugfix/*`: correccion no urgente.
- `hotfix/*`: correccion urgente desde produccion.
- `Mem0`: memoria persistente para hechos estables del proyecto.
