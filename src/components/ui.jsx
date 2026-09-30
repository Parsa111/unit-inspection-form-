import React from 'react'

// Segmented radio toggle with modern tactile feel
export function SegmentedControl({ name, options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
      {options.map((opt) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative flex items-center justify-center min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 select-none ${
              isSelected
                ? opt.activeClass || 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-950/5 dark:ring-white/10'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// Modern Checkbox Pill
export function CheckPill({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 select-none min-h-[44px] ${
        checked
          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-sm shadow-blue-500/10 ring-1 ring-blue-500/20'
          : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300'
      }`}
    >
      <span
        className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
          checked
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current stroke-current" strokeWidth="1">
            <path d="M13.485 3.515a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06L6 10.05l6.424-6.535a.75.75 0 0 1 1.061 0z" />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </button>
  )
}

// Text Input with clean focus ring
export function TextInput({ id, label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
      />
    </div>
  )
}

// Card wrapper for each inspection item
export function ItemCard({ num, title, pink, hint, handwritten, isCompleted, children }) {
  return (
    <div className="group relative bg-white dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Active colored status indicator bar on left border */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-1.5 transition-colors duration-300 ${
          isCompleted
            ? 'bg-blue-600 dark:bg-blue-500'
            : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300'
        }`}
      />

      <div className="p-5 pl-6 sm:p-6 sm:pl-7 space-y-4">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-navy-600 dark:text-blue-400 bg-navy-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-md border border-navy-100 dark:border-blue-900/50 flex-shrink-0">
              {String(num).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
              {pink && (
                <span className="inline-flex items-center gap-1 text-[0.68rem] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Priority Item
                </span>
              )}
            </div>
          </div>

          {/* Completion state chip */}
          <div className="self-start sm:self-auto">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 16 16">
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                </svg>
                Checked
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Required
              </span>
            )}
          </div>
        </div>

        {/* Hints and Handwritten annotations */}
        {(hint || handwritten) && (
          <div className="space-y-1.5">
            {hint && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {hint}
              </p>
            )}
            {handwritten && (
              <div className="flex items-start gap-2 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 rounded-xl px-3 py-2 text-xs text-amber-900 dark:text-amber-300 font-medium">
                <span className="text-amber-500 text-sm flex-shrink-0">📝</span>
                <span className="italic">{handwritten}</span>
              </div>
            )}
          </div>
        )}

        {/* Card Body */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {children}
        </div>
      </div>
    </div>
  )
}

export function FullWidth({ children }) {
  return <div className="sm:col-span-2">{children}</div>
}

export function FieldLabel({ children }) {
  return (
    <p className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
      {children}
    </p>
  )
}
