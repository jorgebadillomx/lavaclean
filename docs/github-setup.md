# Configuracion GitHub

Este repositorio usa `main` como rama de produccion y `develop` como rama de integracion.

## Recomendacion de rama por defecto

- Recomendado: poner `develop` como rama por defecto en GitHub para que los nuevos branches y PRs nazcan en la rama de integracion.
- `main` debe quedarse como rama protegida de salida a produccion.

## Proteccion de `main`

Configura estas reglas en GitHub:

- Require a pull request before merging.
- Require at least 1 approval.
- Require status checks to pass before merging.
- Require conversation resolution before merging.
- Dismiss stale pull request approvals when new commits are pushed.
- Block force pushes.
- Block branch deletion.
- Restrict who can push to matching branches.

## Proteccion de `develop`

Configura estas reglas en GitHub:

- Require a pull request before merging.
- Require at least 1 approval.
- Require status checks to pass before merging.
- Dismiss stale pull request approvals when new commits are pushed.
- Block force pushes.
- Block branch deletion.

## Check requerido

El workflow que debes exigir en branch protection es `repo-sanity`.

## Orden de activacion

1. Subir el repositorio a GitHub.
2. Crear `develop` en remoto si todavia no existe.
3. Activar la proteccion de `main`.
4. Activar la proteccion de `develop`.
5. Marcar `repo-sanity` como status check requerido.
6. Si el equipo trabaja principalmente en integracion, cambiar la rama por defecto a `develop`.

