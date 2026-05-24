export default function Loading() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="border-b bg-white px-8 py-4">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-72 bg-gray-100 rounded mt-2" />
      </div>

      {/* KPI grid skeleton */}
      <div className="px-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6">
            <div className="h-4 w-24 bg-gray-100 rounded mb-3" />
            <div className="h-8 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="px-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6">
            <div className="h-4 w-32 bg-gray-100 rounded mb-4" />
            <div className="h-[280px] bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
