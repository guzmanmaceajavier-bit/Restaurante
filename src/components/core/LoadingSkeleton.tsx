export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-orange-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-orange-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-orange-200 rounded w-3/4" />
        <div className="h-4 bg-orange-200 rounded w-1/2" />
        <div className="h-8 bg-orange-200 rounded w-1/3" />
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[85vh] bg-orange-200 animate-pulse" />
  )
}

export function SectionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-8">
      <div className="h-8 bg-orange-200 rounded w-1/3 mx-auto" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-orange-100 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse p-8">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="h-48 bg-orange-200 rounded-xl" />
      ))}
    </div>
  )
}
