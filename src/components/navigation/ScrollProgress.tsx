import { motion, useScroll } from 'framer-motion'

/** Barra fina de progreso de lectura. Sin animación propia: sigue el scroll. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[3px] z-[70] origin-left bg-gradient-to-r from-olive-500 via-olive-400 to-gold-400"
      style={{ scaleX: scrollYProgress }}
    />
  )
}
