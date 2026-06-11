"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Package, TrendingUp, DollarSign } from 'lucide-react';

type Props = {
  totalActive: number;
  totalSoldToday: number;
  revenueToday: number;
  categoryData: { name: string; total: number }[];
};

export default function AdminDashboardClient({ totalActive, totalSoldToday, revenueToday, categoryData }: Props) {
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  }

  const statCards = [
    { title: "Item Aktif Tersedia", value: totalActive, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Terjual Hari Ini", value: totalSoldToday, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { title: "Pendapatan Hari Ini", value: formatIDR(revenueToday), icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 flex items-center gap-5 border border-slate-200 shadow-sm">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Distribusi Kategori Barang</h3>
        <div className="h-80 w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              Belum ada data kategori
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
