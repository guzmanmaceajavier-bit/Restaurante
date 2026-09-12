---
name: animate-restaurante
description: Use when adding modern motion to Sabor y Origen restaurant portal — framer-motion stagger, hover lift, AnimatePresence modals, prefers-reduced-motion. Triggers on "animaciones", "moderno", "no parezca ia", "framer-motion", "motion".
---

# Animate Restaurante

Motion system for Sabor y Origen — moderno, físico (spring), no genérico IA fade.

## Stack
`framer-motion 13.2` + Tailwind `espresso #1C2A0F / gold #F59E0B`.

## Tokens
- spring: `damping 24, stiffness 260, mass 0.8`
- stagger: `40ms` en grids `Pedidos/Favoritos/Direcciones`
- hover: `whileHover y:-2 shadow-md` + `whileTap scale:0.98`
- modal: `AnimatePresence` `backdrop blur` `initial opacity:0 scale:0.98 → animate opacity:1 scale:1` spring
- reduce: `prefers-reduced-motion` → `duration 0`

## Aplicación
- `ClientPanel` grids: `motion.div staggerChildren`
- `cards` `motion` lift
- `bottom nav` `layout` spring
- `Resumen hero` `parallax` sutil `useScroll` `y`
- No `ease` genérico, usar `spring` físico.

Tras crear/editar, reinicia opencode (skills no hot-reload).
