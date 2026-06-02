# Punto Lavandería — Alcance del Sistema

## Descripción General

Punto Lavandería es una aplicación móvil de punto de venta (POS) diseñada para la gestión operativa de tintorerías y lavanderías. Permite a operadores registrar ventas por turno y a administradores revisar el historial y gestionar el catálogo de productos. Soporta múltiples sucursales con datos aislados por ubicación.

---

## Roles de Usuario

### Operador
- Abre y cierra su propio turno al inicio y fin de cada jornada.
- Registra ventas, gestiona notas (órdenes de cliente) y controla ingresos/gastos del turno.
- Puede gestionar productos.
- Solo ve datos de la sucursal activa.

### Administrador
- Se autentica con un nombre de usuario especial (configurable por variable de entorno).
- No abre turno propio.
- Accede al historial completo de turnos y notas.
- Puede cambiar de sucursal activa.
- Puede gestionar productos.

---

## Módulos y Funcionalidades

### 1. Autenticación y Apertura de Turno

- Pantalla de inicio de sesión con campo de nombre de usuario.
- Al iniciar sesión, el operador declara el efectivo inicial en caja:
  - Monto en billetes.
  - Monto en monedas.
- Se crea un registro de turno en la base de datos con fecha/hora de apertura.
- Si el usuario coincide con `ADMIN_USERNAME`, se autentica como administrador sin abrir turno.

### 2. Punto de Venta (POS)

Pantalla principal del operador. Organizada en tres pestañas:

#### Pestaña "Abiertas"
- Lista todas las notas (órdenes) abiertas del turno activo.
- Permite crear nuevas notas con el nombre del cliente (*mote*).
- Al seleccionar una nota, muestra los productos agregados con sus cantidades.
- Permite agregar o quitar unidades de productos.
- Acción de cobro: abre modal de pago donde se selecciona método (efectivo, tarjeta, transferencia), se captura el monto recibido y se calcula el cambio.
- Al cobrar, la nota se cierra, se imprime el ticket y la nota pasa a la pestaña "Cerradas".

#### Pestaña "Cerradas"
- Lista todas las notas cobradas del turno activo.
- Muestra: nombre del cliente, total, método de pago, fecha/hora de cierre.

#### Pestaña "Ingreso/Gasto"
- Permite registrar movimientos de caja adicionales durante el turno:
  - Ingresos (cantidad positiva).
  - Gastos (cantidad negativa).
  - Cada registro lleva un identificador descriptivo y monto.
- Lista todos los movimientos del turno activo.
- Permite editar o eliminar movimientos.

#### Cierre de Turno
- Accesible desde el menú lateral.
- Valida que no haya notas abiertas pendientes de cobro.
- El operador captura el efectivo final en caja:
  - Billetes finales.
  - Monedas finales.
- El sistema calcula y guarda: total vendido, total de caja, fecha/hora de cierre.

### 3. Gestión de Productos

Disponible para operadores y administradores.

- Lista todos los productos con nombre, precio y costo (opcional).
- Permite buscar productos por nombre.
- Alta de producto: nombre, precio, costo (campo opcional).
- Edición de producto existente.
- Eliminación de producto.
- Reordenamiento manual (botones arriba/abajo) para controlar el orden en que aparecen en el POS.

### 4. Historial de Turnos (solo administrador)

- Lista todos los turnos cerrados de la sucursal activa.
- Muestra por turno: operador, fechas de apertura/cierre, efectivo inicial/final, total vendido.
- Al seleccionar un turno, navega a la vista de detalle de notas.

### 5. Historial de Notas (solo administrador)

- Vista de detalle de un turno seleccionado.
- Muestra el resumen financiero del turno:
  - Total vendido.
  - Total de ingresos/gastos.
  - Desglose por método de pago.
- Lista todas las notas cerradas del turno con:
  - Nombre del cliente.
  - Productos comprados con cantidades.
  - Total cobrado, método de pago, cambio entregado.
  - Fecha/hora de cierre.
- Botón para reimprimir el ticket de cualquier nota.

### 6. Selección de Sucursal

- Al primer uso de la app se fuerza la selección de sucursal mediante un modal.
- La selección se persiste localmente (AsyncStorage).
- El administrador puede cambiar de sucursal desde el menú lateral en cualquier momento.
- Toda la información operativa (turnos, notas, movimientos de caja) se filtra por sucursal activa.
- El catálogo de productos es global (compartido entre sucursales).

### 7. Impresión de Tickets

- Al cobrar una nota se imprime automáticamente un ticket de venta.
- También es posible reimprimir desde el historial de notas.
- El ticket incluye: nombre del cliente, lista de productos, total, método de pago, cambio y un mensaje de pie personalizable.
- La impresión se realiza vía Bluetooth a impresoras térmicas usando el protocolo ESC/POS y la app RawBT.

---

## Casos de Uso Principales

| Actor | Acción |
|-------|--------|
| Operador | Abrir turno con efectivo inicial |
| Operador | Crear nota de cliente y agregar productos |
| Operador | Cobrar nota y emitir ticket impreso |
| Operador | Registrar ingresos y gastos del turno |
| Operador | Cerrar turno con recuento final de caja |
| Operador | Gestionar catálogo de productos |
| Administrador | Consultar historial de turnos por sucursal |
| Administrador | Ver detalle de ventas de un turno |
| Administrador | Reimprimir tickets de ventas pasadas |
| Administrador | Cambiar sucursal activa |
| Administrador | Gestionar catálogo de productos |

---

## Restricciones y Consideraciones

- Un operador solo puede tener un turno abierto a la vez; no puede abrir uno nuevo sin cerrar el anterior.
- No es posible cerrar un turno si quedan notas abiertas sin cobrar.
- El catálogo de productos es compartido por todas las sucursales.
- La autenticación del administrador se basa únicamente en el nombre de usuario (sin contraseña); el secreto se configura via variable de entorno.
- La app requiere dispositivo con Bluetooth y la app RawBT instalada para la impresión de tickets.
- No hay gestión de usuarios integrada; los nombres de los operadores se capturan libremente en el login.
