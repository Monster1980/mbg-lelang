"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from "lucide-react";

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
};

type PresetKey = "today" | "last7" | "thisMonth" | "thisYear" | "all" | null;

export default function DateRangePicker({ value, onChange, placeholder = "Semua Waktu" }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Internal draft state — only committed on "Terapkan Filter"
  const [draftRange, setDraftRange] = useState<DateRange>({ from: value.from, to: value.to });
  const [currentMonth, setCurrentMonth] = useState(value.from || new Date());
  const [selectingFrom, setSelectingFrom] = useState<Date | null>(value.from);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState<PresetKey>(null);

  // Sync draft when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftRange({ from: value.from, to: value.to });
      setSelectingFrom(value.from);
      setCurrentMonth(value.from || new Date());
      setActivePreset(null);
    }
  }, [isOpen]);

  const handlePrevYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const handleNextYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleSelectDate = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setActivePreset(null);

    if (!selectingFrom || (selectingFrom && draftRange.to)) {
      // First click: set start, clear end
      setSelectingFrom(clickedDate);
      setDraftRange({ from: clickedDate, to: null });
    } else {
      // Second click: set end
      let from = selectingFrom;
      let to = clickedDate;
      if (clickedDate < selectingFrom) {
        from = clickedDate;
        to = selectingFrom;
      }
      setSelectingFrom(from);
      setDraftRange({ from, to });
    }
  };

  const applyPreset = (key: PresetKey) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let from = new Date(today);
    let to = new Date(today);

    switch (key) {
      case "today":
        break;
      case "last7":
        from.setDate(today.getDate() - 6);
        break;
      case "thisMonth":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "thisYear":
        from = new Date(today.getFullYear(), 0, 1);
        break;
      case "all":
        setDraftRange({ from: null, to: null });
        setSelectingFrom(null);
        setActivePreset("all");
        return;
      default:
        break;
    }

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    setDraftRange({ from, to });
    setSelectingFrom(from);
    setCurrentMonth(from);
    setActivePreset(key);
  };

  const handleApply = () => {
    onChange(draftRange);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const daysInMonthCount = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonthIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const presets: { key: PresetKey; label: string }[] = [
    { key: "today", label: "Hari Ini" },
    { key: "last7", label: "7 Hari Terakhir" },
    { key: "thisMonth", label: "Bulan Ini" },
    { key: "thisYear", label: "Tahun Ini" },
    { key: "all", label: "Semua Waktu" },
  ];

  // Day styling helpers
  const isSelectedEndpoint = (day: number) => {
    if (!draftRange.from && !draftRange.to) return false;
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    d.setHours(0, 0, 0, 0);
    if (draftRange.from) {
      const fc = new Date(draftRange.from); fc.setHours(0, 0, 0, 0);
      if (d.getTime() === fc.getTime()) return true;
    }
    if (draftRange.to) {
      const tc = new Date(draftRange.to); tc.setHours(0, 0, 0, 0);
      if (d.getTime() === tc.getTime()) return true;
    }
    return false;
  };

  const isInRange = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    d.setHours(0, 0, 0, 0);

    if (draftRange.from && draftRange.to && draftRange.from.getTime() !== draftRange.to.getTime()) {
      const fc = new Date(draftRange.from); fc.setHours(0, 0, 0, 0);
      const tc = new Date(draftRange.to); tc.setHours(0, 0, 0, 0);
      return d > fc && d < tc;
    }

    if (selectingFrom && !draftRange.to && hoverDate) {
      const sc = new Date(selectingFrom); sc.setHours(0, 0, 0, 0);
      const hc = new Date(hoverDate); hc.setHours(0, 0, 0, 0);
      return sc < hc ? (d > sc && d < hc) : (d > hc && d < sc);
    }
    return false;
  };

  const isToday = (day: number) => {
    const now = new Date();
    return now.getDate() === day && now.getMonth() === currentMonth.getMonth() && now.getFullYear() === currentMonth.getFullYear();
  };

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-900 cursor-pointer shadow-sm transition-all hover:border-blue-400 hover:shadow min-w-[260px]"
      >
        <span className={value.from && value.to ? "font-medium" : "text-slate-400"}>
          {value.from && value.to
            ? `${formatDate(value.from)} — ${formatDate(value.to)}`
            : placeholder}
        </span>
        <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
          <CalendarIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Centered Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] md:max-h-[90vh] animate-in fade-in-50 zoom-in-95 duration-150 flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pilih Rentang Tanggal</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {draftRange.from && draftRange.to
                    ? `${formatDate(draftRange.from)} — ${formatDate(draftRange.to)}`
                    : draftRange.from
                      ? `Dari ${formatDate(draftRange.from)} — pilih tanggal akhir`
                      : "Klik tanggal awal, lalu tanggal akhir"}
                </p>
              </div>
              <button type="button" onClick={handleCancel} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2-Column Layout */}
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 flex-1 overflow-y-auto px-1">

              {/* Left Column: Filter Cepat Pills */}
              <div className="sm:w-1/3 p-4 sm:p-5 bg-slate-50/40 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 sm:mb-3 px-1">Filter Cepat</p>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => applyPreset(preset.key)}
                      className={`w-full text-center sm:text-left px-3 py-1.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-100 active:scale-[0.98] ${
                        activePreset === preset.key
                          ? "bg-blue-600 text-white shadow-sm font-semibold border border-blue-600"
                          : "text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-150 bg-slate-50/50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Single Month Calendar */}
              <div className="sm:w-2/3 p-4 sm:p-5">
                {/* Month/Year Navigation */}
                <div className="flex items-center justify-between mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex gap-1">
                    <button type="button" onClick={handlePrevYear} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white bg-slate-100 rounded-md transition-all shadow-sm">
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={handlePrevMonth} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white bg-slate-100 rounded-md transition-all shadow-sm">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={handleNextMonth} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white bg-slate-100 rounded-md transition-all shadow-sm">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={handleNextYear} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white bg-slate-100 rounded-md transition-all shadow-sm">
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day-of-Week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  <div>Mg</div><div>Sn</div><div>Sl</div><div>Rb</div><div>Km</div><div>Jm</div><div>Sb</div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                  {Array.from({ length: firstDayOfMonthIndex }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonthCount }).map((_, i) => {
                    const day = i + 1;
                    const selected = isSelectedEndpoint(day);
                    const inRange = isInRange(day);
                    const today = isToday(day);

                    let dayStyles = "w-8 h-8 sm:w-11 sm:h-11 mx-auto rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center transition-all duration-200 cursor-pointer ";

                    if (selected) {
                      dayStyles += "bg-blue-600 text-white font-semibold shadow-sm";
                    } else if (inRange) {
                      dayStyles += "bg-blue-50 text-blue-700 rounded-none";
                    } else if (today) {
                      dayStyles += "bg-white text-blue-600 font-bold ring-2 ring-cyan-400 border border-blue-200 hover:bg-blue-50";
                    } else {
                      dayStyles += "text-slate-700 hover:bg-blue-50 hover:text-blue-600";
                    }

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectDate(day)}
                        onMouseEnter={() => {
                          if (selectingFrom && !draftRange.to) {
                            setHoverDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                          }
                        }}
                        className={dayStyles}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-3 pb-3 mt-auto z-10 flex items-center justify-end gap-3 px-6 flex-shrink-0">
              <button type="button" onClick={handleCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                Batal
              </button>
              <button type="button" onClick={handleApply} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
