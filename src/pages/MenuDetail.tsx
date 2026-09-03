import { DetailView } from '../components/menuDetail/DetailView'
import { SEO } from '../lib/seo'

export default function MenuDetail() {
  return (
    <>
      <SEO title="Detalle del plato" description="Información detallada de nuestros platos colombianos" />
      <DetailView />
    </>
  )
}
