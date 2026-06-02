# Mem0 en lavaclean

Mem0 queda inicializado como memoria persistente para decisiones estables del proyecto.

## Variables esperadas

- `MEM0_MODE=managed`
- `MEM0_API_KEY=...`
- `MEM0_HOST=https://api.mem0.ai`
- `MEM0_USER_ID=lavaclean-project`

## Comandos

- `yarn mem0:ping` -> verifica conexión.
- `yarn mem0:seed` -> carga memoria base del proyecto.
- `yarn mem0:search -- "tu consulta"` -> busca recuerdos guardados.
- `yarn mem0:remember -- "nota nueva"` -> guarda una nueva decisión o nota estable.

## Qué se guarda

- Contexto del proyecto.
- Flujo Git y reglas de ramas.
- Convenciones de trabajo con Codex y Claude.
- Decisiones estables que vale la pena recuperar en sesiones futuras.

## Convención

- Usar `userId = lavaclean-project` para todo el contexto del repo.
- Registrar solo hechos estables o decisiones ya confirmadas.
- No guardar secretos, tokens ni datos sensibles en el texto de memoria.

