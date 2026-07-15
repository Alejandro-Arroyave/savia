# 01 · Producto

## Qué es

App móvil para el cuidado de plantas del hogar. Público: personas que quieren llevar un
registro más juicioso del cuidado de sus plantas. El usuario registra sus plantas y la app
le ayuda a no olvidar cuándo regar y cuándo abonar.

## Funcionalidades del MVP

El MVP tiene **dos funcionalidades núcleo**:

1. **Monitoreo de riego**
   - Al registrar la planta, el usuario ingresa la **última fecha de riego** y **cada cuántos días** se debe regar.
   - La app calcula el próximo riego y avisa.

2. **Monitoreo de abono**
   - Igual que riego: **última fecha de aplicación de abono** y **cada cuántos días** se debe abonar.
   - La app calcula el próximo abono y avisa.

> El diseño está preparado para agregar más tipos de cuidado en el futuro (poda, fumigación,
> etc.) sin rehacer el modelo — ver [`04-data-model.md`](04-data-model.md).

## Notificaciones (requisito central)

La app envía **notificaciones push** al dispositivo:

- **El día antes** de cada evento (riego y abono).
- **El mismo día** del evento.
- A la **hora que el usuario elija** en Ajustes.

Esto es lo que más condiciona la arquitectura (requiere un proceso que corra 24/7 para
calcular y disparar avisos). Detalles en [`03-tech-stack.md`](03-tech-stack.md).

## Reglas de negocio / supuestos acordados

- La frecuencia ("cada cuánto") se ingresa en **días**.
- El estado se calcula: `próxima fecha = última fecha + frecuencia`.
- Estados que se muestran: **"Hoy"**, cuenta regresiva (**"en N días"**), y **"Atrasado N días"**.
- Cada planta tiene **nombre**, **especie** (opcional) y **foto** (**opcional** — decisión confirmada 2026-07-14).
- **Zonas horarias:** toda la lógica de "día antes / mismo día" debe calcularse en la
  **zona horaria del usuario** (IANA, p. ej. `America/Bogota`), NO en UTC del servidor.
  Es el error clásico en apps de recordatorios.

## Vistas de la aplicación (7 pantallas diseñadas)

1. **Login** — email + contraseña, y botón "Continuar con Google".
2. **Registro** — solo cuando el acceso es por email (nombre, email, contraseña).
3. **Lista de plantas ("Mis plantas")** — todas las plantas; por cada una se ve cuánto
   falta para el próximo riego y el próximo abono. Tira de "tareas de hoy" y botón (+) para agregar.
4. **Calendario (global)** — un mes con los eventos de **todas** las plantas (puntos por tipo)
   y una **agenda del día seleccionado**. *(Pantalla añadida durante el diseño.)*
5. **Detalle de planta** — estado, acciones rápidas ("Registrar riego/abono"), y un
   **calendario** que muestra qué días se regó y qué días se abonó, más las frecuencias.
6. **Ajustes** — dos secciones:
   - **Cuenta:** cambiar nombre de usuario, cambiar contraseña, idioma.
   - **Notificaciones:** hora del aviso, avisar el día antes (toggle), avisar el mismo día (toggle).
7. **Registrar planta** — formulario donde se capturan nombre, especie, última fecha y
   frecuencia de riego, y última fecha y frecuencia de abono. *(Pantalla necesaria que no
   estaba en la lista original pero alimenta todo lo demás.)*

## i18n

Requisito confirmado: la app debe soportar **internacionalización**. **Español** es el idioma
por defecto; todos los textos van externalizados (no incrustados). Hay una fila de "Idioma" en Ajustes.
