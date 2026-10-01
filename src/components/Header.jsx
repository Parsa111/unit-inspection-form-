export default function Header({ darkMode, setDarkMode, onReset, completedCount, totalCount }) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 shadow-inner flex items-center justify-center flex-shrink-0 border border-white/20">
            <img src="/image.png" alt="YCC No. 76 logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[0.68rem] font-extrabold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                YCC No. 76
              </span>
              <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-1.5 py-0.2 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Draft Saved
              </span>
            </div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              Unit Inspection Audit
            </h1>
          </div>
        </div>

        {/* Progress & Quick Actions */}
        <div className="flex items-center gap-2.5">
          {/* Progress pill on desktop */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Progress</span>
            <span className="font-mono font-bold text-navy-600 dark:text-blue-400">
              {completedCount}/{totalCount}
            </span>
          </div>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Reset inspection fields"
            >
              Reset
            </button>
          )}

          {/* Dark mode button */}
          <button
            type="button"
            onClick={() => setDarkMode(d => !d)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center justify-center text-base hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm transition-all active:scale-95"
            aria-label="Toggle theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </header>
  )
}
