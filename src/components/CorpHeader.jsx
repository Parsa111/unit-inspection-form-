import { useState, useRef, useEffect, useMemo } from 'react'
import { fetchBuildingUnits, groupUnitsByBuilding, formatUnitCode, parseUnitCode } from '../lib/buildingUnits'

function SuiteDropdown({ value, onChange, error }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customMode, setCustomMode] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    let active = true

    fetchBuildingUnits()
      .then((list) => {
        if (!active) return
        setUnits(list)
        setLoadError('')
      })
      .catch((err) => {
        if (!active) return
        setLoadError(err.message || 'Unable to load units')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

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

  // Grouped units from the database, split by building
  const groupedUnits = useMemo(() => groupUnitsByBuilding(units), [units])

  // Filtered units
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedUnits
    const query = search.trim().toLowerCase()
    return groupedUnits
      .map((group) => ({
        ...group,
        floors: group.floors
          .map((f) => ({ ...f, units: f.units.filter((u) => u.toLowerCase().includes(query)) }))
          .filter((f) => f.units.length > 0),
      }))
      .filter((group) => group.floors.length > 0)
  }, [groupedUnits, search])

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
          {value ? formatUnitCode(value) : '— Select Unit / Suite # —'}
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
                placeholder="Search unit or building (e.g. 1001, 701)..."
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

          {/* Scrollable Unit List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
            {loading ? (
              <div className="p-6 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Loading units…</p>
              </div>
            ) : loadError ? (
              <div className="p-6 text-center">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
                  Could not load unit list
                </p>
                <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">{loadError}</p>
              </div>
            ) : units.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  No units available
                </p>
                <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                  No unit numbers found in Building_unit.
                </p>
              </div>
            ) : filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div key={group.label} className="py-1">
                  <div className="px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/60 rounded-md my-0.5">
                    {group.label}
                  </div>
                  {group.floors.map((floor) => (
                    <div key={floor.label} className="py-0.5">
                      {floor.label !== 'Other' && (
                        <div className="px-3 pt-1 text-[0.6rem] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {floor.label}
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-1 px-1 py-1">
                        {floor.units.map((s) => {
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
                              {parseUnitCode(s).unit}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  No unit matching "{search}"
                </p>
                <button
                  type="button"
                  onClick={() => selectSuite(search.trim())}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                >
                  Use "{search.trim()}" as Unit #
                </button>
              </div>
            )}
          </div>

          {/* Custom Unit Input Toggle at bottom */}
          <div className="p-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
            {customMode ? (
              <form onSubmit={handleCustomSubmit} className="flex gap-1.5">
                <input
                  type="text"
                  autoFocus
                  placeholder="Enter custom unit..."
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

export default function CorpHeader({ form, setForm, errors, setErrors }) {
  const inspectionDate = form.inspectionDate
    ? new Date(`${form.inspectionDate}T00:00:00`).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

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
              <img src="/image.png" alt="YCC No. 76 logo" className="w-full h-full object-contain" />
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
        {/* Inspection Date */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Inspection Date
          </span>
          <div
            id="inspectionDate"
            aria-readonly="true"
            className="flex min-h-[44px] items-center px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200"
          >
            {inspectionDate}
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
              <span className="block normal-case font-medium text-[0.65rem] text-slate-400 dark:text-slate-500">
                Format: 701-1001
              </span>
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
