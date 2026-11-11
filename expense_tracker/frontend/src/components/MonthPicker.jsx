import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MonthPicker = ({ selectedDate, onChange }) => {
  const [open, setOpen] = useState(false);
  const date = selectedDate || new Date();
  const [viewYear, setViewYear] = useState(date.getFullYear());
  const ref = useRef(null);

  useEffect(() => {
    setViewYear(date.getFullYear());
  }, [date]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (monthIndex) => {
    const newDate = new Date(viewYear, monthIndex, 1);
    if (onChange) onChange(newDate);
    setOpen(false);
  };

  const handleThisMonth = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    if (onChange) onChange(new Date(now.getFullYear(), now.getMonth(), 1));
    setOpen(false);
  };

  const label = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-4 py-2 border border-white/60 rounded-xl text-sm font-medium text-gray-800 bg-white/75 backdrop-blur-xl hover:bg-white/90 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.06)]"
      >
        <span>{label}</span>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/70 p-4 z-50 animate-slide-down">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setViewYear(viewYear - 1)}
              className="p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-gray-900">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear(viewYear + 1)}
              className="p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {SHORT_MONTHS.map((m, idx) => {
              const isSelected = date.getMonth() === idx && date.getFullYear() === viewYear;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  className={`py-2 text-xs font-medium rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-gray-900 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleThisMonth}
            className="w-full py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 text-center border-t border-gray-100 pt-2 transition-colors"
          >
            Reset to This Month
          </button>
        </div>
      )}
    </div>
  );
};

export default MonthPicker;

