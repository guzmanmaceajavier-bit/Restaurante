import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { CartModal } from '../components/cart/CartModal'
import { useCartStore } from '../store/useCartStore'
import { useState } from 'react'
import WhatsAppButton from '../components/core/WhatsAppButton'
import { BackToTop } from '../components/core/BackToTop'

export default function AppLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const count = useCartStore((s) => s.count)

  return (
    <>
      <Header cartCount={count} onCartClick={() => setCartOpen(true)} />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <CartModal open={cartOpen} setOpen={setCartOpen} />
      <WhatsAppButton />
      <BackToTop />
    </>
  )
}
