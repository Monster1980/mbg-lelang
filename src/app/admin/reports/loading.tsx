export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="h-8 w-64 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-slate-100 rounded"></div>
        </div>
        <div className="h-10 w-40 bg-slate-200 rounded-xl"></div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-32 flex flex-col justify-center">
        <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
        <div className="flex gap-4">
          <div className="h-10 w-48 bg-slate-100 rounded-md"></div>
          <div className="h-10 w-48 bg-slate-100 rounded-md"></div>
          <div className="h-10 w-24 bg-slate-200 rounded-md"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="h-4 w-32 bg-slate-100 rounded mb-2"></div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-100"></div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="h-4 w-48 bg-slate-100 rounded mb-2"></div>
            <div className="h-8 w-32 bg-slate-200 rounded"></div>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-100"></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded"></div></th>
                <th className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded"></div></th>
                <th className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded"></div></th>
                <th className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded ml-auto"></div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-slate-100 rounded mb-1"></div>
                    <div className="h-3 w-16 bg-slate-50 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 bg-slate-100 rounded mb-1"></div>
                    <div className="h-3 w-32 bg-slate-50 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-slate-100 rounded mb-1"></div>
                    <div className="h-3 w-24 bg-slate-50 rounded"></div>
                  </td>
                  <td className="px-6 py-4 flex justify-end">
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
