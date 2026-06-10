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
    { title: "Item Aktif Tersedia", value: totalActive, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Terjual Hari Ini", value: totalSoldToday, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
    { title: "Pendapatan Hari Ini", value: formatIDR(revenueToday), icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard Analytics</h1>
        <p className="text-text-secondary mt-1">Ringkasan performa katalog dan penjualan.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-6 flex items-center gap-5 border border-white/5 shadow-lg">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-text-primary">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass rounded-2xl p-6 border border-white/5 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Distribusi Kategori Barang</h3>
        <div className="h-80 w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1a2035', border: '1px solid #ffffff15', borderRadius: '8px' }}
                  itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              Belum ada data kategori
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
