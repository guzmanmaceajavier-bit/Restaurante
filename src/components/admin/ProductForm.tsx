import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import type { IProduct, Adicional } from '../../types/product'
import { useState } from 'react'

interface IProps {
  initialData?: IProduct
  categorias: string[]
  onSubmit: (data: Omit<IProduct, 'id'>) => void
  onCancel: () => void
}

const validationSchema = Yup.object({
  nombre: Yup.string().min(2, 'Mínimo 2 caracteres').required('El nombre es obligatorio'),
  descripcion: Yup.string().min(5, 'Mínimo 5 caracteres').required('La descripción es obligatoria'),
  precio: Yup.number().min(0, 'Debe ser positivo').required('El precio es obligatorio'),
  categoría: Yup.string().required('La categoría es obligatoria'),
  imagen: Yup.string().url('Debe ser una URL válida').required('La imagen es obligatoria'),
  stock: Yup.number().min(0, 'Debe ser positivo').required('El stock es obligatorio'),
})

export function ProductForm({ initialData, categorias, onSubmit, onCancel }: IProps) {
  const [adicionales, setAdicionales] = useState<Adicional[]>(initialData?.adicionales || [])
  const [nuevoAdicionalNombre, setNuevoAdicionalNombre] = useState('')
  const [nuevoAdicionalPrecio, setNuevoAdicionalPrecio] = useState('')

  const agregarAdicional = () => {
    if (!nuevoAdicionalNombre.trim() || !nuevoAdicionalPrecio) return
    setAdicionales([...adicionales, { id: `adj-${Date.now().toString(36)}`, nombre: nuevoAdicionalNombre.trim(), precio: Number(nuevoAdicionalPrecio), disponible: true }])
    setNuevoAdicionalNombre(''); setNuevoAdicionalPrecio('')
  }

  return (
    <Formik
      initialValues={{
        nombre: initialData?.nombre || '', descripcion: initialData?.descripcion || '', precio: initialData?.precio || 0,
        categoría: initialData?.categoría || '', imagen: initialData?.imagen || '', stock: initialData?.stock || 0,
        ingredientes: initialData?.ingredientes?.join(', ') || '', picante: initialData?.picante || 0,
        tiempoPreparacion: initialData?.tiempoPreparacion || 15, calorias: initialData?.calorias || 0,
        alergenos: initialData?.alergenos?.join(', ') || '', destacado: initialData?.destacado || false,
        masVendido: initialData?.masVendido || false, recomendado: initialData?.recomendado || false,
        nuevo: initialData?.nuevo || false, descuento: initialData?.descuento || 0,
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        onSubmit({ ...values, picante: values.picante as 0 | 1 | 2 | 3, ingredientes: values.ingredientes ? values.ingredientes.split(',').map((s) => s.trim()) : [], alergenos: values.alergenos ? values.alergenos.split(',').map((s) => s.trim()) : [], adicionales })
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-espresso-800 mb-1">Nombre *</label>
              <Field name="nombre" className="input-base" />
              <ErrorMessage name="nombre" component="p" className="text-red-500 text-xs mt-1" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-espresso-800 mb-1">Categoría *</label>
              <Field as="select" name="categoría" className="input-base">
                <option value="">Seleccionar</option>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </Field>
              <ErrorMessage name="categoría" component="p" className="text-red-500 text-xs mt-1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-espresso-800 mb-1">Descripción *</label>
            <Field as="textarea" name="descripcion" rows={2} className="input-base resize-none" />
            <ErrorMessage name="descripcion" component="p" className="text-red-500 text-xs mt-1" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-sm font-semibold text-espresso-800 mb-1">Precio *</label><Field type="number" name="precio" className="input-base" /><ErrorMessage name="precio" component="p" className="text-red-500 text-xs mt-1" /></div>
            <div><label className="block text-sm font-semibold text-espresso-800 mb-1">Stock *</label><Field type="number" name="stock" className="input-base" /></div>
            <div><label className="block text-sm font-semibold text-espresso-800 mb-1">Descuento %</label><Field type="number" name="descuento" className="input-base" /></div>
            <div><label className="block text-sm font-semibold text-espresso-800 mb-1">Picante</label><Field as="select" name="picante" className="input-base"><option value={0}>Sin picante</option><option value={1}>Suave</option><option value={2}>Medio</option><option value={3}>Fuerte</option></Field></div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-espresso-800 mb-1">URL de imagen *</label>
            <Field name="imagen" className="input-base" placeholder="/platos/nombre.webp" />
            <ErrorMessage name="imagen" component="p" className="text-red-500 text-xs mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-espresso-800 mb-1">Ingredientes (separados por coma)</label><Field name="ingredientes" className="input-base" placeholder="Carne, arroz, frijoles" /></div>
            <div><label className="block text-sm font-semibold text-espresso-800 mb-1">Alérgenos (separados por coma)</label><Field name="alergenos" className="input-base" placeholder="Gluten, lactosa" /></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-sm font-semibold text-espresso-800 mb-1">Tiempo prep (min)</label><Field type="number" name="tiempoPreparacion" className="input-base" /></div>
            <div><label className="block text-sm font-semibold text-espresso-800 mb-1">Calorías</label><Field type="number" name="calorias" className="input-base" /></div>
          </div>
          <div className="flex flex-wrap gap-4">
            {['destacado', 'masVendido', 'recomendado', 'nuevo'].map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm text-espresso-800">
                <Field type="checkbox" name={f} className="w-4 h-4 rounded border-cream-300 text-olive-500 focus:ring-olive-500/30" />
                {f === 'destacado' ? 'Destacado' : f === 'masVendido' ? 'Más vendido' : f === 'recomendado' ? 'Recomendado' : 'Nuevo'}
              </label>
            ))}
          </div>
          <div className="border border-cream-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-espresso-800 mb-3">Adicionales</h4>
            {adicionales.length > 0 && (
              <div className="space-y-2 mb-3">
                {adicionales.map((a) => (
                  <div key={a.id} className="flex items-center justify-between bg-cream-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-espresso-800">{a.nombre}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-olive-500">${a.precio.toLocaleString('es-CO')}</span>
                      <button type="button" onClick={() => setAdicionales(adicionales.filter((x) => x.id !== a.id))} className="text-red-500 hover:text-red-600 text-xs">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={nuevoAdicionalNombre} onChange={(e) => setNuevoAdicionalNombre(e.target.value)} placeholder="Nombre" className="flex-1 input-base text-sm" />
              <input type="number" value={nuevoAdicionalPrecio} onChange={(e) => setNuevoAdicionalPrecio(e.target.value)} placeholder="Precio" className="w-24 input-base text-sm" />
              <button type="button" onClick={agregarAdicional} className="bg-olive-500 hover:bg-olive-600 text-white px-3 py-2 rounded-xl text-sm font-medium transition-all">Agregar</button>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-50">{initialData ? 'Guardar cambios' : 'Crear producto'}</button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
