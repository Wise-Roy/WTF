export default function ProductSkeleton() {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-[4/5] bg-gray-200" />
      {/* Bottom zone */}
      <div className="p-5 max-sm:p-4 flex items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
