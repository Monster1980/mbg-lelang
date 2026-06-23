import { PackageSearch } from "lucide-react";

export default function ItemsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-10 w-40 bg-slate-200 rounded-lg"></div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4"><div className="h-4 w-12 bg-slate-200 rounded"></div></th>
                <th className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded"></div></th>
                <th className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded"></div></th>
                <th className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded"></div></th>
                <th className="px-6 py-4 text-right"><div className="h-4 w-12 bg-slate-200 rounded ml-auto"></div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded"></div></td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-48 bg-slate-100 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-slate-50 rounded"></div>
                  </td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-md"></div></td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-4">
                      <div className="h-5 w-5 bg-slate-200 rounded-full"></div>
                      <div className="h-5 w-5 bg-slate-200 rounded-full"></div>
                    </div>
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
