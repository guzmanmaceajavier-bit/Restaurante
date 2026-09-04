import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { CartModal } from '../components/cart/CartModal'
import { useState } from 'react'
import WhatsAppButton from '../components/core/WhatsAppButton'
import BackToTop from '../components/core/BackToTop'

export default function AppLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return (
      <>
        <Outlet />
        <CartModal open={cartOpen} setOpen={setCartOpen} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <Header onCartClick={() => setCartOpen(true)} />
      <main className="flex-1 pt-14 lg:pt-16">
        <Outlet />
      </main>
      <Footer />
      <CartModal open={cartOpen} setOpen={setCartOpen} />
      <WhatsAppButton />
      <BackToTop />
    </div>
  )
}
