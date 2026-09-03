import { BannerSection } from '../components/menu/BannerSection'
import { ProductsSection } from '../components/menu/ProductsSection'
import { SEO } from '../lib/seo'

export default function Menu() {
  return (
    <>
      <SEO title="Menú" description="Explora nuestro menú de comida colombiana: platos fuertes, entradas, postres y bebidas tradicionales" />
      <BannerSection />
      <ProductsSection />
    </>
  )
}
