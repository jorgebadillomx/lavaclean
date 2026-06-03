# Checklist GitHub

Aplica esto en el repositorio remoto para que `main` y `develop` queden protegidas.

## 1. Rama por defecto

- [ ] Verificar si el equipo quiere que la rama por defecto sea `develop`.
- [ ] Si el trabajo diario arranca en integracion, cambiar la rama por defecto a `develop`.
- [ ] Mantener `main` como rama de produccion.

## 2. Proteccion de `main`

- [ ] Activar `Require a pull request before merging`.
- [ ] Activar `Require at least 1 approval`.
- [ ] Activar `Require status checks to pass before merging`.
- [ ] Activar `Require conversation resolution before merging`.
- [ ] Activar `Dismiss stale pull request approvals when new commits are pushed`.
- [ ] Bloquear `force pushes`.
- [ ] Bloquear `branch deletion`.
- [ ] Activar `Include administrators` para impedir bypass del owner/admin.
- [ ] Restringir quien puede pushar.
- [ ] Marcar `repo-sanity` como status check requerido.

## 3. Proteccion de `develop`

- [ ] Activar `Require a pull request before merging`.
- [ ] Activar `Require at least 1 approval`.
- [ ] Activar `Require status checks to pass before merging`.
- [ ] Activar `Dismiss stale pull request approvals when new commits are pushed`.
- [ ] Bloquear `force pushes`.
- [ ] Bloquear `branch deletion`.
- [ ] Activar `Include administrators` para impedir bypass del owner/admin.
- [ ] Marcar `repo-sanity` como status check requerido.

## 4. Verificacion final

- [ ] Abrir una PR de prueba hacia `develop`.
- [ ] Confirmar que el check `repo-sanity` corre en GitHub Actions.
- [ ] Confirmar que no se puede mergear sin aprobacion.
- [ ] Confirmar que no se puede pushar directo a `main`.
- [ ] Confirmar que el owner/admin tampoco puede bypassar la proteccion.
