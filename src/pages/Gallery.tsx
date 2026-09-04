import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GallerySkeleton } from '../components/core/LoadingSkeleton'
import { SEO } from '../lib/seo'
import { dataService } from '../lib/dataService'
import { numberFormatter } from '../utils/numberFormatter'
import { FaTimes, FaShoppingBag } from 'react-icons/fa'

const galleryImages = [
  { src: '/platos/bandeja_paisa.webp', label: 'Bandeja Paisa' },
  { src: '/platos/ajiaco.webp', label: 'Ajiaco' },
  { src: '/platos/sancocho.webp', label: 'Sancocho' },
  { src: '/platos/lechona.webp', label: 'Lechona' },
  { src: '/platos/tamales.webp', label: 'Tamales' },
  { src: '/platos/arroz_pollo.webp', label: 'Arroz con Pollo' },
  { src: '/platos/Chuleta_valluna.webp', label: 'Chuleta Valluna' },
  { src: '/platos/pescado_frito.webp', label: 'Pescado Frito' },
  { src: '/platos/cazuela_mariscos.webp', label: 'Cazuela de Mariscos' },
  { src: '/platos/carne_llanera.webp', label: 'Carne a la Llanera' },
  { src: '/platos/arepas_rellenas.webp', label: 'Arepas Rellenas' },
  { src: '/platos/empanadas_rellenas.webp', label: 'Empanadas' },
  { src: '/platos/patacones.webp', label: 'Patacones' },
  { src: '/platos/pandebonos.webp', label: 'Pandebonos' },
  { src: '/platos/buñuelos.webp', label: 'Buñuelos' },
  { src: '/platos/arroz_con_leche.webp', label: 'Arroz con Leche' },
  { src: '/platos/natilla.webp', label: 'Natilla' },
  { src: '/platos/brevas_con_arequipe.webp', label: 'Brevas con Arequipe' },
  { src: '/platos/oblea.webp', label: 'Obleas' },
  { src: '/platos/torta_tres_leches.webp', label: 'Torta de Tres Leches' },
  { src: '/platos/jugo_lulo.webp', label: 'Jugo de Lulo' },
  { src: '/platos/jugo_maracuya.webp', label: 'Jugo de Maracuyá' },
  { src: '/platos/limonada_de_coco.webp', label: 'Limonada de Coco' },
  { src: '/platos/Jugo_De_Mora.webp', label: 'Refresco de Mora' },
  { src: '/platos/jugo_guayaba.webp', label: 'Jugo de Guayaba' },
]

export default function Gallery() {
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<typeof galleryImages[number] | null>(null)
  const allProducts = dataService.getProductos()

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const selectedProduct = selected ? allProducts.find((p) => p.nombre === selected.label) : null

  return (
    <>
      <SEO title="Galería" description="Galería de fotos de nuestros platos colombianos en Sabor y Origen" />
      <section className="min-h-screen bg-cream-50 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-display font-bold text-espresso-800 mb-4">Galería</h1>
            <div className="w-24 h-1 bg-olive-500 mx-auto rounded-full mb-6" />
            <p className="text-steel">Conoce nuestros platos y el ambiente de Sabor y Origen.</p>
          </div>

          {loading ? <GallerySkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((img) => (
                <div key={img.label} onClick={() => setSelected(img)} className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer">
                  <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{img.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="relative bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"><FaTimes size={16} /></button>
              <div className="aspect-video overflow-hidden">
                <img src={selected.src} alt={selected.label} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-display font-bold text-espresso-800 mb-2">{selected.label}</h2>
                {selectedProduct ? (
                  <div className="space-y-3">
                    <p className="text-steel leading-relaxed">{selectedProduct.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-olive-500">${numberFormatter(selectedProduct.precio ?? 0)}</span>
                      <div className="flex gap-2">
                        {selectedProduct.tiempoPreparacion && <span className="text-xs text-steel bg-cream-100 px-2 py-1 rounded-full">⏱ {selectedProduct.tiempoPreparacion} min</span>}
                        {selectedProduct.calorias && <span className="text-xs text-steel bg-cream-100 px-2 py-1 rounded-full">🔥 {selectedProduct.calorias} cal</span>}
                      </div>
                    </div>
                    <Link to={`/menu/${encodeURIComponent(selectedProduct.id)}`} className="btn-primary flex items-center justify-center gap-2 w-full py-3">
                      <FaShoppingBag size={14} /> Ver en menú y pedir
                    </Link>
                  </div>
                ) : <p className="text-steel">Plato del restaurante Sabor y Origen</p>}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
