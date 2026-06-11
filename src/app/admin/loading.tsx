export default function AdminGlobalLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-slate-200 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-brand-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">Memuat data...</p>
    </div>
  );
}
