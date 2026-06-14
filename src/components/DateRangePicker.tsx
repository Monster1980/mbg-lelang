"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
};

export default function DateRangePicker({ value, onChange, placeholder = "Pilih rentang tanggal" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const [currentMonth, setCurrentMonth] = useState(value.from || new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  // Selection state (temp state during dual clicking)
  const [selectingFrom, setSelectingFrom] = useState<Date | null>(value.from);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Update internal selectingFrom state when value prop changes
  useEffect(() => {
    setSelectingFrom(value.from);
  }, [value]);

  const handleSelectDate = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (!selectingFrom || (selectingFrom && value.to)) {
      // First click: set start date, clear end date
      setSelectingFrom(clickedDate);
      onChange({ from: clickedDate, to: clickedDate });
    } else {
      // Second click: set end date
      let from = selectingFrom;
      let to = clickedDate;
      if (clickedDate < selectingFrom) {
        // Swap if backward selection
        from = clickedDate;
        to = selectingFrom;
      }
      setSelectingFrom(from);
      onChange({ from, to });
      setIsOpen(false); // Auto close on complete selection
    }
  };

  const handleMouseEnterDate = (day: number) => {
    if (selectingFrom && !value.to) {
      setHoverDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }
  };

  // Quick Presets
  const applyPreset = (presetName: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let from = new Date(today);
    let to = new Date(today);

    switch (presetName) {
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
        onChange({ from: null, to: null });
        setSelectingFrom(null);
        setIsOpen(false);
        return;
      default:
        break;
    }

    // Ensure times are clean
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    onChange({ from, to });
    setSelectingFrom(from);
    setCurrentMonth(from);
    setIsOpen(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Check ranges
  const isDateSelected = (day: number) => {
    if (!value.from || !value.to) return false;
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    d.setHours(0, 0, 0, 0);
    const fromClean = new Date(value.from);
    fromClean.setHours(0, 0, 0, 0);
    const toClean = new Date(value.to);
    toClean.setHours(0, 0, 0, 0);

    return d.getTime() === fromClean.getTime() || d.getTime() === toClean.getTime();
  };

  const isDateInRange = (day: number) => {
    if (!value.from) return false;
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    d.setHours(0, 0, 0, 0);
    const fromClean = new Date(value.from);
    fromClean.setHours(0, 0, 0, 0);

    if (value.from && value.to && value.from.getTime() !== value.to.getTime()) {
      const toClean = new Date(value.to);
      toClean.setHours(0, 0, 0, 0);
      return d > fromClean && d < toClean;
    }

    if (selectingFrom && !value.to && hoverDate) {
      const selectClean = new Date(selectingFrom);
      selectClean.setHours(0, 0, 0, 0);
      const hoverClean = new Date(hoverDate);
      hoverClean.setHours(0, 0, 0, 0);

      if (selectClean < hoverClean) {
        return d > selectClean && d < hoverClean;
      } else {
        return d > hoverClean && d < selectClean;
      }
    }

    return false;
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        id="date-range-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm transition-all hover:bg-slate-50 border-slate-200"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span>
            {value.from && value.to
              ? `${formatDate(value.from)} - ${formatDate(value.to)}`
              : placeholder}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 sm:right-0 sm:left-auto lg:left-0 lg:right-auto mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 animate-in fade-in zoom-in-95 duration-200 min-w-max">
          {/* Quick Presets Panel */}
          <div className="w-full md:w-40 bg-slate-50/50 p-3 flex flex-col gap-1.5 justify-start shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Presets</p>
            <button type="button" onClick={() => applyPreset("today")} className="text-left w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">Hari Ini</button>
            <button type="button" onClick={() => applyPreset("last7")} className="text-left w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">7 Hari Terakhir</button>
            <button type="button" onClick={() => applyPreset("thisMonth")} className="text-left w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">Bulan Ini</button>
            <button type="button" onClick={() => applyPreset("thisYear")} className="text-left w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">Tahun Ini</button>
            <button type="button" onClick={() => applyPreset("all")} className="text-left w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">Semua Waktu</button>
          </div>

          {/* Dual Calendar Picker Panel */}
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[0, 1].map((offset) => {
              const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
              const daysInMonthCount = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
              const firstDayOfMonthIndex = monthDate.getDay();

              return (
                <div key={offset} className={`p-4 w-64 ${offset === 1 ? 'hidden md:block' : ''}`}>
                  <div className="flex items-center justify-between mb-4 h-8">
                    {offset === 0 ? (
                      <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="w-6" /> // spacer
                    )}
                    
                    <div className="text-xs font-bold text-slate-800">
                      {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
                    </div>
                    
                    {(offset === 1 || (offset === 0 && typeof window !== 'undefined' && window.innerWidth < 768)) ? (
                      <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="w-6" /> // spacer
                    )}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                    <div>Mg</div><div>Sn</div><div>Sl</div><div>Rb</div><div>Km</div><div>Jm</div><div>Sb</div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayOfMonthIndex }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonthCount }).map((_, i) => {
                      const day = i + 1;
                      
                      // Check selections
                      const isSelectedDate = () => {
                        if (!value.from || !value.to) return false;
                        const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
                        d.setHours(0, 0, 0, 0);
                        const fromClean = new Date(value.from);
                        fromClean.setHours(0, 0, 0, 0);
                        const toClean = new Date(value.to);
                        toClean.setHours(0, 0, 0, 0);
                        return d.getTime() === fromClean.getTime() || d.getTime() === toClean.getTime();
                      };

                      const isInRangeDate = () => {
                        if (!value.from) return false;
                        const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
                        d.setHours(0, 0, 0, 0);
                        const fromClean = new Date(value.from);
                        fromClean.setHours(0, 0, 0, 0);

                        if (value.from && value.to && value.from.getTime() !== value.to.getTime()) {
                          const toClean = new Date(value.to);
                          toClean.setHours(0, 0, 0, 0);
                          return d > fromClean && d < toClean;
                        }

                        if (selectingFrom && !value.to && hoverDate) {
                          const selectClean = new Date(selectingFrom);
                          selectClean.setHours(0, 0, 0, 0);
                          const hoverClean = new Date(hoverDate);
                          hoverClean.setHours(0, 0, 0, 0);

                          if (selectClean < hoverClean) {
                            return d > selectClean && d < hoverClean;
                          } else {
                            return d > hoverClean && d < selectClean;
                          }
                        }
                        return false;
                      };

                      const isSelected = isSelectedDate();
                      const isInRange = isInRangeDate();
                      
                      let dayStyles = "text-slate-700 hover:bg-slate-100";
                      if (isSelected) {
                        dayStyles = "bg-slate-950 text-white font-bold shadow-sm";
                      } else if (isInRange) {
                        dayStyles = "bg-slate-100 text-slate-900 rounded-none";
                      }
                      
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
                            
                            if (!selectingFrom || (selectingFrom && value.to)) {
                              setSelectingFrom(d);
                              onChange({ from: d, to: d });
                            } else {
                              let from = selectingFrom;
                              let to = d;
                              if (d < selectingFrom) {
                                from = d;
                                to = selectingFrom;
                              }
                              setSelectingFrom(from);
                              onChange({ from, to });
                              setIsOpen(false);
                            }
                          }}
                          onMouseEnter={() => {
                            if (selectingFrom && !value.to) {
                              setHoverDate(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
                            }
                          }}
                          className={`w-7 h-7 mx-auto rounded-lg text-xs flex items-center justify-center transition-colors ${dayStyles}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
