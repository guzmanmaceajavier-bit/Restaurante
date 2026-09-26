export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-3xl shadow-card border border-cream-200 overflow-hidden">
        <div className="h-48 bg-cream-100" />
        <div className="p-5">
          <div className="h-5 bg-cream-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-cream-100 rounded w-1/2 mb-4" />
          <div className="h-8 bg-cream-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  )
}

export function MenuSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[50vh] bg-cream-200" />
      <div className="py-12 px-6 max-w-content mx-auto">
        <div className="text-center mb-10">
          <div className="h-4 bg-cream-200 rounded w-24 mx-auto mb-3" />
          <div className="h-8 bg-cream-200 rounded w-64 mx-auto mb-2" />
          <div className="h-4 bg-cream-100 rounded w-80 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-cream-200 overflow-hidden">
              <div className="h-48 bg-cream-100" />
              <div className="p-5">
                <div className="h-5 bg-cream-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-cream-100 rounded w-full mb-3" />
                <div className="h-7 bg-cream-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function GallerySkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-square bg-cream-100 rounded-xl" />
      ))}
    </div>
  )
}

export function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-cream-50 p-6 animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 bg-cream-200 rounded w-48 mb-6" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-cream-200">
              <div className="h-10 w-10 bg-cream-100 rounded-xl mb-3" />
              <div className="h-8 bg-cream-200 rounded w-20 mb-1" />
              <div className="h-4 bg-cream-100 rounded w-24" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-cream-200 p-6 h-64" />
          <div className="bg-white rounded-2xl border border-cream-200 p-6 h-64" />
        </div>
      </div>
    </div>
  )
}
