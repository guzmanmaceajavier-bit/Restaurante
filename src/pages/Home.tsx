import Hero from './home/Hero'
import Categories from './home/Categories'
import FeaturedItems from './home/FeaturedItems'
import Experience from './home/Experience'
import HowItWorks from './home/HowItWorks'
import Promos from './home/Promos'
import ReservationCTA from './home/ReservationCTA'
import Testimonials from './home/Testimonials'
import FAQ from './home/FAQ'
import FinalCTA from './home/FinalCTA'
import { SEO } from '../lib/seo'

export default function Home() {
  return (
    <>
      <SEO title="Inicio" description="Sabor y Origen - Comida colombiana tradicional en Sahagún, Córdoba" />
      <Hero />
      <Categories />
      <FeaturedItems />
      <Experience />
      <HowItWorks />
      <Promos />
      <ReservationCTA />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  )
}
