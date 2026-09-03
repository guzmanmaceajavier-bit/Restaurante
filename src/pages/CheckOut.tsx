import { CheckOutView } from '../components/checkout/CheckOutView'
import { SEO } from '../lib/seo'

export default function CheckOut() {
  return (
    <>
      <SEO title="Carrito" description="Revisa tu pedido y confírmalo por WhatsApp" />
      <CheckOutView />
    </>
  )
}
