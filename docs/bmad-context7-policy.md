# Política Context7 para BMad

Cuando este repositorio use `bmad-quick-dev` o `bmad-dev-story`, cualquier paso que escriba o modifique código debe consultar Context7 antes de implementar.

## Regla

- Leer Mem0 primero para recuperar decisiones estables.
- Activar el flujo BMad correspondiente.
- Consultar Context7 antes de escribir código.
- Usar Context7 para documentación actualizada de cualquier librería, framework, SDK, API o CLI involucrado.
- Si el cambio toca una dependencia externa y Context7 no tiene cobertura suficiente, preferir la fuente oficial primaria antes de continuar.

## Alcance

- Aplica a código nuevo.
- Aplica a refactors.
- Aplica a tests cuando dependan de frameworks, APIs o SDKs externos.
- Aplica tanto para Codex como para Claude cuando el flujo implique implementación o revisión técnica.

## No sustituye

- No sustituye el PRD, la arquitectura ni las historias BMad.
- No sustituye `_bmad-output` como fuente de verdad del trabajo.
- No sustituye Mem0; solo añade una capa de documentación actualizada para lo que se va a escribir.

