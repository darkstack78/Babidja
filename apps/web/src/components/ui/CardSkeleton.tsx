/** Skeleton de carte (chambre / voiture) pendant le chargement */
export default function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/4 mt-2" />
      </div>
    </div>
  )
}
