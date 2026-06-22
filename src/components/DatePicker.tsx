"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type Props = {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function DatePicker({ value, onChange, placeholder = "Pilih tanggal", disabled = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const dateValue = value ? new Date(value) : null;
  const [currentMonth, setCurrentMonth] = useState(dateValue || new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const handleNextYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleSelectDate = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const year = selected.getFullYear();
    const month = String(selected.getMonth() + 1).padStart(2, '0');
    const d = String(selected.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    setIsOpen(false);
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
        className={`flex items-center justify-between w-full p-3.5 border border-slate-200 rounded-lg transition-all ${
          disabled
            ? "bg-slate-100 text-slate-500 cursor-not-allowed"
            : "bg-white text-slate-900 hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-pointer shadow-sm hover:shadow"
        }`}
      >
        <span className={dateValue ? "font-medium" : "text-slate-400"}>
          {dateValue ? dateValue.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : placeholder}
        </span>
        <div className={`p-1.5 rounded-md ${disabled ? "bg-slate-200 text-slate-400" : "bg-blue-50 text-blue-600"}`}>
          <CalendarIcon className="w-5 h-5" />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-80 sm:w-[340px] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
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
          
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
            <div>Mg</div><div>Sn</div><div>Sl</div><div>Rb</div><div>Km</div><div>Jm</div><div>Sb</div>
          </div>
          
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = dateValue?.getDate() === day && dateValue?.getMonth() === currentMonth.getMonth() && dateValue?.getFullYear() === currentMonth.getFullYear();
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
              
              let dayStyles = "w-10 h-10 mx-auto rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-200 cursor-pointer ";
              
              if (isSelected) {
                dayStyles += "bg-blue-600 text-white shadow-sm font-semibold";
              } else if (isToday) {
                dayStyles += "bg-white text-blue-600 font-bold ring-2 ring-cyan-400 border border-blue-200 hover:bg-blue-50";
              } else {
                dayStyles += "text-slate-700 hover:bg-blue-50 hover:text-blue-600";
              }

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleSelectDate(day)}
                  className={dayStyles}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
