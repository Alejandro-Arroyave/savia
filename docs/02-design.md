# 02 · Diseño UX/UI

> El mockup navegable de alta fidelidad está en [`../design/savia-mockup.html`](../design/savia-mockup.html).
> Ábrelo en un navegador: incluye las 7 pantallas, tema claro/oscuro (botón arriba a la derecha)
> y el calendario interactivo. **El usuario aprobó esta dirección con entusiasmo.**

## Dirección estética

**Natural y orgánico.** Verde botánico profundo como identidad; neutros con sesgo verde
(nada de gris plano). Se evitó **a propósito** el cliché de diseño generado por IA
(crema + terracota + serif).

- **Display / identidad:** serif humanista (stack tipo Iowan/Palatino).
- **UI de la app:** `system-ui` (se siente como app nativa).
- **Datos (cuentas regresivas, horas):** `tabular-nums`.
- **Temas:** claro y oscuro, ambos diseñados con el mismo cuidado.

## Paleta

| Rol | Nombre | Hex |
|---|---|---|
| Identidad | Verde botánico | `#2E5D39` |
| Acento vivo | Brote | `#6FA84E` |
| **Riego (agua)** | Azul agua | `#2F86A0` |
| **Abono (tierra)** | Ocre tierra | `#B57A34` |
| Atrasado | Óxido apagado | `#B4553F` |
| Fondo (claro) | Neutro verde | sesgo cálido, p. ej. `#E9EEE1` |

## Sistema de "dos ritmos" (el corazón de la UX)

Cada tipo de evento tiene **color e ícono fijos en toda la app**:

- **Riego = azul agua + gota** 💧
- **Abono = ocre tierra + brote** 🌱

Así el usuario reconoce de un vistazo qué es qué sin leer. Los estados se codifican por color:
"Hoy" resalta en el color del evento, "Atrasado" en óxido, el resto neutro. Nada grita de más.

## Detalle clave: tarjeta de planta (tras iterar)

La tarjeta de "Mis plantas" terminó así (después de 2 iteraciones):

- **Banda superior:** foto a la izquierda + nombre y especie, **centrados verticalmente**.
- **Banda inferior:** los dos avisos (riego / abono) **a todo el ancho de la tarjeta**,
  cada uno en su propia fila inline (ícono + etiqueta a la izquierda, valor a la derecha).

**Por qué:** la versión inicial ponía los dos avisos en **dos columnas** al lado de la foto,
y se **desbordaban** de la tarjeta. Pasar a una sola columna a ancho completo lo resolvió.
👉 No volver a la versión de dos columnas estrechas.

## Vista de Calendario global (diseño)

- Resumen del mes arriba (total de riegos y abonos).
- Calendario mensual con **puntos por día**: azul = hay riego, ocre = hay abono (agregando
  todas las plantas). Hoy resaltado en verde.
- **Agenda continua** debajo: lista los próximos días encadenados (no un solo día), indicando
  qué planta y qué tarea, con estado (Hecho / Hoy / Programado). Es interactivo en el mockup.
- Decisión de diseño: los puntos son **por tipo de evento**, no por planta (más claro).

## Decisiones de diseño (cerradas 2026-07-14)

Estas decisiones, antes abiertas, quedaron resueltas (ver [`../README.md`](../README.md)):

- Foto de la planta: **opcional** en el MVP.
- Se **mantiene** la pestaña "Calendario" global además del calendario por planta.
- Puntos del calendario **por tipo de evento** (no por planta).
- **Agenda continua** de próximos días (no agenda de un solo día).
