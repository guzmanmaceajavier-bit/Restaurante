import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { FaSave, FaClock, FaCopy, FaTimes, FaSun, FaMoon } from 'react-icons/fa'
import { SEO } from '../lib/seo'

interface DiaHorario {
  dia: string
  abierto: boolean
  horaApertura: string
  horaCierre: string
  descansoInicio?: string
  descansoFin?: string
}

interface HorariosConfig {
  horarios: DiaHorario[]
  notas: string
}

const diasSemana: DiaHorario[] = [
  { dia: 'Lunes', abierto: true, horaApertura: '10:00', horaCierre: '22:00' },
  { dia: 'Martes', abierto: true, horaApertura: '10:00', horaCierre: '22:00' },
  { dia: 'Miércoles', abierto: true, horaApertura: '10:00', horaCierre: '22:00' },
  { dia: 'Jueves', abierto: true, horaApertura: '10:00', horaCierre: '22:00' },
  { dia: 'Viernes', abierto: true, horaApertura: '10:00', horaCierre: '22:00' },
  { dia: 'Sábado', abierto: true, horaApertura: '10:00', horaCierre: '22:00' },
  { dia: 'Domingo', abierto: true, horaApertura: '10:00', horaCierre: '20:00' },
]

function formatTime(time: string): string {
  if (!time) return '--:--'
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`
}

function isOpenNow(horarios: DiaHorario[]): boolean {
  const now = new Date()
  const dayIndex = (now.getDay() + 6) % 7
  const dia = horarios[dayIndex]
  if (!dia || !dia.abierto) return false

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [oH, oM] = dia.horaApertura.split(':').map(Number)
  const [cH, cM] = dia.horaCierre.split(':').map(Number)
  const openMin = oH * 60 + oM
  const closeMin = cH * 60 + cM

  if (currentMinutes < openMin || currentMinutes >= closeMin) return false

  if (dia.descansoInicio && dia.descansoFin) {
    const [diH, diM] = dia.descansoInicio.split(':').map(Number)
    const [dfH, dfM] = dia.descansoFin.split(':').map(Number)
    const breakStart = diH * 60 + diM
    const breakEnd = dfH * 60 + dfM
    if (currentMinutes >= breakStart && currentMinutes < breakEnd) return false
  }

  return true
}

const defaultConfig: HorariosConfig = {
  horarios: diasSemana,
  notas: '',
}

export default function AdminHorarios() {
  const [config, setConfig] = useState<HorariosConfig>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('horarios_config') || 'null')
      if (stored && stored.horarios) return stored
    } catch {}
    return defaultConfig
  })

  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const updateDia = (index: number, field: keyof DiaHorario, value: any) => {
    setConfig(prev => ({
      ...prev,
      horarios: prev.horarios.map((d, i) => i === index ? { ...d, [field]: value } : d),
    }))
  }

  const toggleDescanso = (index: number) => {
    setConfig(prev => ({
      ...prev,
      horarios: prev.horarios.map((d, i) => {
        if (i !== index) return d
        if (d.descansoInicio) {
          const { descansoInicio, descansoFin, ...rest } = d
          return rest
        }
        return { ...d, descansoInicio: '12:00', descansoFin: '13:00' }
      }),
    }))
  }

  const copyFirstToAll = () => {
    const first = config.horarios[0]
    setConfig(prev => ({
      ...prev,
      horarios: prev.horarios.map(d => ({
        ...d,
        abierto: first.abierto,
        horaApertura: first.horaApertura,
        horaCierre: first.horaCierre,
        descansoInicio: first.descansoInicio,
        descansoFin: first.descansoFin,
      })),
    }))
    toast.success('Horarios copiados a todos los días')
  }

  const openAll = () => {
    setConfig(prev => ({
      ...prev,
      horarios: prev.horarios.map(d => ({ ...d, abierto: true })),
    }))
    toast.success('Todos los días abiertos')
  }

  const closeAll = () => {
    setConfig(prev => ({
      ...prev,
      horarios: prev.horarios.map(d => ({ ...d, abierto: false })),
    }))
    toast.success('Todos los días cerrados')
  }

  const save = () => {
    localStorage.setItem('horarios_config', JSON.stringify(config))
    toast.success('Horarios guardados correctamente')
  }

  const openNow = isOpenNow(config.horarios)

  return (
    <div>
      <SEO title="Horarios de Atención" description="Gestiona los horarios de atención del restaurante" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Horarios de Atención</h1>
          <div className="flex items-center gap-2 mt-1">
            {openNow ? (
              <>
                <FaSun className="text-green-500" size={14} />
                <span className="text-green-600 text-sm font-medium">Abierto ahora</span>
              </>
            ) : (
              <>
                <FaMoon className="text-red-400" size={14} />
                <span className="text-red-500 text-sm font-medium">Cerrado ahora</span>
              </>
            )}
            <span className="text-steel text-xs ml-2">({now.toLocaleDateString('es-CO', { weekday: 'long' })} {formatTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)})</span>
          </div>
        </div>
        <button onClick={save} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-olive-500/20">
          <FaSave size={14} /> Guardar horarios
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button onClick={copyFirstToAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-cream-200 text-espresso-600 hover:bg-cream-50 transition-all whitespace-nowrap">
          <FaCopy size={14} /> Copiar a todos los días
        </button>
        <button onClick={openAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-cream-200 text-green-600 hover:bg-green-50 transition-all whitespace-nowrap">
          <FaSun size={14} /> Abrir todos
        </button>
        <button onClick={closeAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-cream-200 text-red-500 hover:bg-red-50 transition-all whitespace-nowrap">
          <FaTimes size={14} /> Cerrar todos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {config.horarios.map((dia, index) => (
          <div key={dia.dia} className={`bg-white rounded-2xl border border-cream-200 p-5 transition-all ${dia.abierto ? 'border-l-4 border-l-sage-500' : 'border-l-4 border-l-red-400 opacity-60'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FaClock size={16} className={dia.abierto ? 'text-sage-500' : 'text-steel/40'} />
                <h3 className="font-display font-bold text-espresso-800 text-lg">{dia.dia}</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dia.abierto}
                  onChange={(e) => updateDia(index, 'abierto', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-steel/20 rounded-full peer peer-checked:bg-sage-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>

            {dia.abierto && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-espresso-700 mb-1 block">Apertura</label>
                    <input
                      type="time"
                      value={dia.horaApertura}
                      onChange={(e) => updateDia(index, 'horaApertura', e.target.value)}
                      className="input-base text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-espresso-700 mb-1 block">Cierre</label>
                    <input
                      type="time"
                      value={dia.horaCierre}
                      onChange={(e) => updateDia(index, 'horaCierre', e.target.value)}
                      className="input-base text-sm py-2"
                    />
                  </div>
                </div>

                {dia.descansoInicio ? (
                  <div>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <label className="text-xs font-semibold text-espresso-700 mb-1 block">Descanso inicio</label>
                        <input
                          type="time"
                          value={dia.descansoInicio}
                          onChange={(e) => updateDia(index, 'descansoInicio', e.target.value)}
                          className="input-base text-sm py-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-espresso-700 mb-1 block">Descanso fin</label>
                        <input
                          type="time"
                          value={dia.descansoFin || ''}
                          onChange={(e) => updateDia(index, 'descansoFin', e.target.value)}
                          className="input-base text-sm py-2"
                        />
                      </div>
                    </div>
                    <button onClick={() => toggleDescanso(index)} className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
                      Quitar descanso
                    </button>
                  </div>
                ) : (
                  <button onClick={() => toggleDescanso(index)} className="text-xs text-olive-600 hover:text-olive-700 font-medium transition-colors">
                    + Agregar descanso
                  </button>
                )}

                <div className="text-xs text-steel bg-cream-50 rounded-lg px-3 py-2">
                  {formatTime(dia.horaApertura)} – {formatTime(dia.horaCierre)}
                  {dia.descansoInicio && dia.descansoFin && (
                    <span className="text-steel/60"> | Descanso: {formatTime(dia.descansoInicio)} – {formatTime(dia.descansoFin)}</span>
                  )}
                </div>
              </div>
            )}

            {!dia.abierto && (
              <div className="text-sm text-steel/60 italic">Cerrado</div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 p-6">
        <h3 className="font-display font-bold text-espresso-800 text-lg mb-3">Notas y Observaciones</h3>
        <p className="text-steel text-sm mb-3">Horarios especiales, días festivos, eventos, etc.</p>
        <textarea
          value={config.notas}
          onChange={(e) => setConfig(prev => ({ ...prev, notas: e.target.value }))}
          className="input-base resize-none"
          rows={4}
          placeholder="Ej: Cerrado los 25 de diciembre y 1 de enero. Horario especial de Navidad: 10:00 - 18:00..."
        />
      </div>
    </div>
  )
}
