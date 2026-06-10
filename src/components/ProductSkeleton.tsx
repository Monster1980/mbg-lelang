export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-sm animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] w-full bg-slate-200">
        {/* Grade Badge Skeleton */}
        <div className="absolute top-3 right-3 z-10 w-16 h-5 rounded-lg bg-slate-300"></div>
      </div>

      <div className="p-4 flex flex-col flex-grow bg-white">
        {/* Category Skeleton */}
        <div className="w-16 h-3 bg-slate-200 rounded mb-2"></div>
        
        {/* Title Skeleton */}
        <div className="w-full h-4 bg-slate-200 rounded mb-1.5"></div>
        <div className="w-2/3 h-4 bg-slate-200 rounded mb-4"></div>
        
        <div className="mt-auto pt-3">
          {/* Price Skeleton */}
          <div className="w-32 h-6 bg-slate-200 rounded mb-3"></div>
          
          {/* Branch Skeleton */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 flex-shrink-0"></div>
            <div className="w-24 h-3 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
