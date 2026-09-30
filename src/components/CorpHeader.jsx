import { useState, useRef, useEffect, useMemo } from 'react'

// Generate standard Crescent Town high-rise suite list grouped by floor
const SUITE_GROUPS = (() => {
  const groups = []

  // Quick picks
  groups.push({
    label: '⭐ Quick Select / Common',
    suites: ['1408', '101', '205', '510', '1012', '2104', '3008', 'PH-01'],
  })

  // Floors 1 to 35
  for (let floor = 1; floor <= 35; floor++) {
    const suites = []
    for (let u = 1; u <= 14; u++) {
      if (u === 13) continue // 13 is commonly excluded in Canadian high rises
      const unitStr = u < 10 ? `0${u}` : `${u}`
      suites.push(`${floor}${unitStr}`)
    }
    groups.push({
      label: `Floor ${floor}`,
      suites,
    })
  }

  // Penthouses & Townhouses
  groups.push({
    label: 'Penthouses (PH)',
    suites: ['PH-01', 'PH-02', 'PH-03', 'PH-04', 'PH-05', 'PH-06', 'PH-07', 'PH-08'],
  })

  groups.push({
    label: 'Townhouses & Common',
    suites: ['TH-01', 'TH-02', 'TH-03', 'TH-04', 'Office', 'Superintendent', 'Rec Centre'],
  })

  return groups
})()

// Flattened list for search
const ALL_SUITES = SUITE_GROUPS.flatMap((g) => g.suites)

function SuiteDropdown({ value, onChange, error }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customMode, setCustomMode] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Filtered suites
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return SUITE_GROUPS
    const query = search.trim().toLowerCase()
    return SUITE_GROUPS.map((group) => ({
      ...group,
      suites: group.suites.filter((s) => s.toLowerCase().includes(query)),
    })).filter((group) => group.suites.length > 0)
  }, [search])

  const selectSuite = (suite) => {
    onChange(suite)
    setCustomMode(false)
    setIsOpen(false)
    setSearch('')
  }

  const handleCustomSubmit = (e) => {
    e?.preventDefault()
    if (customValue.trim()) {
      onChange(customValue.trim())
      setCustomMode(false)
      setIsOpen(false)
      setCustomValue('')
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - styled to match Building select */}
      <button
        type="button"
        id="suiteNumber"
        onClick={() => setIsOpen((prev) => !prev)}
        data-error={!!error}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 transition-all flex items-center justify-between text-left cursor-pointer ${
          error
            ? 'border-red-500 focus:ring-red-400/30'
            : isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/30 bg-white dark:bg-slate-900'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <span className={value ? 'font-semibold' : 'text-slate-400'}>
          {value ? `Suite #${value}` : '— Select Unit / Suite # —'}
        </span>

        <div className="flex items-center gap-1.5 text-slate-400">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              title="Clear suite selection"
              className="hover:text-red-500 p-0.5 rounded text-xs"
            >
              ✕
            </span>
          )}
          <svg
            className={`w-4 h-4 fill-current transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </button>

      {/* Downward Dropdown Menu - physically anchored top-full to ALWAYS open down */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          
          {/* Search bar inside dropdown */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search suite # (e.g. 1408, 205)..."
                className="w-full min-h-[36px] pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <svg
                className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Scrollable Suites List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div key={group.label} className="py-1">
                  <div className="px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/40 rounded-md my-0.5">
                    {group.label}
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-1 py-1">
                    {group.suites.map((s) => {
                      const isSelected = value === s
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => selectSuite(s)}
                          className={`px-2 py-1.5 text-xs font-semibold rounded-lg text-center transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold shadow-sm'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                          }`}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  No predefined suite matching "{search}"
                </p>
                <button
                  type="button"
                  onClick={() => selectSuite(search.trim())}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                >
                  Use "{search.trim()}" as Suite #
                </button>
              </div>
            )}
          </div>

          {/* Custom Suite Input Toggle at bottom */}
          <div className="p-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
            {customMode ? (
              <form onSubmit={handleCustomSubmit} className="flex gap-1.5">
                <input
                  type="text"
                  autoFocus
                  placeholder="Enter custom suite..."
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="flex-1 min-h-[34px] px-2.5 py-1 text-xs rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="w-full py-1.5 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                ✎ Enter Other / Custom Unit #...
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

export default function CorpHeader({ form, setForm, setToday, errors, setErrors }) {
  const clearErr = (key) =>
    setErrors((e) => {
      const n = { ...e }
      delete n[key]
      return n
    })

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-visible transition-all">
      {/* Top Corporate Masthead with subtle dark-blue gradient accent */}
      <div className="p-6 sm:p-7 bg-gradient-to-r from-slate-900 via-navy-800 to-navy-900 text-white relative overflow-hidden rounded-t-2xl">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* High-res YCC Crescent Town Tree Seal */}
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-2 flex items-center justify-center border border-white/20 shadow-md flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <rect
                  x="2"
                  y="2"
                  width="96"
                  height="96"
                  rx="10"
                  fill="none"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="3"
                />
                <path
                  d="M50 18C35 18 24 28 24 42C24 50 28 57 34 62C34 66 35 70 36 74L44 74L44 86L56 86L56 74L64 74C65 70 66 66 66 62C72 57 76 50 76 42C76 28 65 18 50 18Z"
                  fill="#ffffff"
                />
                <path d="M46 72L54 72L54 86L46 86Z" fill="#b45309" />
                <circle cx="42" cy="38" r="8" fill="#15803d" />
                <circle cx="58" cy="38" r="8" fill="#15803d" />
                <circle cx="50" cy="30" r="9" fill="#22c55e" />
                <circle cx="36" cy="50" r="7" fill="#15803d" />
                <circle cx="64" cy="50" r="7" fill="#15803d" />
                <circle cx="50" cy="48" r="9" fill="#4ade80" />
                <text
                  x="50"
                  y="94"
                  fontFamily="sans-serif"
                  fontSize="7.5"
                  fontWeight="800"
                  textAnchor="middle"
                  fill="#ffffff"
                  letterSpacing="1"
                >
                  CRESCENT TOWN
                </text>
              </svg>
            </div>

            <div>
              <span className="inline-block text-[0.65rem] font-bold tracking-widest uppercase text-blue-300">
                Official Condominium Corporation
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight">
                YORK CONDOMINIUM CORPORATION NO. 76
              </h2>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-medium">
                <span>📍 5 Massey Square, Toronto, ON M4C 5L6</span>
                <span>📞 (416) 690-8881</span>
                <span>✉️ management@ycc76.com</span>
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
              Form Rev. 2026
            </span>
          </div>
        </div>
      </div>

      {/* Document Title Banner */}
      <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            Unit Inspection Audit Form
          </h3>
          <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
            Physical in-suite check & compliance verification
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
          SEC. 00-META
        </span>
      </div>

      {/* Meta Grid: Date, Building, Suite # */}
      <div className="p-6 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-b-2xl">
        {/* Date Input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="inspectionDate"
            className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Inspection Date
          </label>
          <div className="flex gap-2">
            <input
              id="inspectionDate"
              type="date"
              value={form.inspectionDate}
              onChange={(e) => setForm((f) => ({ ...f, inspectionDate: e.target.value }))}
              className="flex-1 min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={setToday}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors whitespace-nowrap active:scale-95 cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>

        {/* Building Select Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="building"
            className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Building Address
          </label>
          <div className="relative">
            <select
              id="building"
              value={form.building}
              onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))}
              className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option>5 Massey Square</option>
              <option>3 Massey Square</option>
              <option>1 Massey Square</option>
              <option>Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Unit / Suite Number - Guaranteed Downward Dropdown */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="suiteNumber"
              className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Unit / Suite # <span className="text-red-500">*</span>
            </label>
            {errors.suiteNumber && (
              <span className="text-[0.7rem] text-red-500 font-bold">Required</span>
            )}
          </div>

          <SuiteDropdown
            value={form.suiteNumber}
            onChange={(val) => {
              setForm((f) => ({ ...f, suiteNumber: val }))
              clearErr('suiteNumber')
            }}
            error={errors.suiteNumber}
          />
        </div>
      </div>
    </div>
  )
}
