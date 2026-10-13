import React, { useRef, useState } from 'react'

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

// Photo capture/upload component with camera support
export function PhotoUpload({ photos = [], onAdd, onRemove }) {
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const [expandedPhoto, setExpandedPhoto] = useState(null)

  const formatTimestamp = (date = new Date()) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const handleFileSelect = (e, targetRef) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        onAdd({ src: ev.target.result, timestamp: formatTimestamp() })
      }
      reader.readAsDataURL(file)
    })
    if (targetRef.current) targetRef.current.value = ''
  }

  const getPhotoSrc = (photo) => (typeof photo === 'string' ? photo : photo?.src)
  const getPhotoTimestamp = (photo) => (typeof photo === 'string' ? null : photo?.timestamp)

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Problem Photos
          </span>
          <span className="text-[0.65rem] font-mono text-slate-400 dark:text-slate-500">
            {photos.length} captured
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, idx) => {
            const src = getPhotoSrc(photo)
            const timestamp = getPhotoTimestamp(photo)
            return (
              <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 cursor-zoom-in">
                <img
                  src={src}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  onClick={() => setExpandedPhoto(src)}
                />
                {timestamp && (
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[0.55rem] font-mono rounded select-none whitespace-nowrap">
                    {timestamp}
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(idx)
                  }}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="text-[0.6rem] font-bold uppercase tracking-wider">Add</span>
          </button>
        </div>

        {/* Camera input - opens device camera on mobile/tablet */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e, cameraInputRef)}
          className="hidden"
        />

        {/* Gallery input - picks from photo library / file explorer */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e, galleryInputRef)}
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 min-h-[40px] px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-bold transition-colors active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h2.5a1 1 0 00.9-.5l.7-1a1 1 0 01.9-.5h4a1 1 0 01.9.5l.7 1a1 1 0 00.9.5H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <circle cx="12" cy="13" r="3" fill="none" />
            </svg>
            Take Photo
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-center gap-2 min-h-[40px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-4 4 4 4-4 4 4M4 6h16" />
            </svg>
            From Gallery
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {expandedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setExpandedPhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded photo view"
        >
          <button
            type="button"
            onClick={() => setExpandedPhoto(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl font-bold flex items-center justify-center transition-colors"
            aria-label="Close expanded photo"
          >
            ✕
          </button>
          <img
            src={expandedPhoto}
            alt="Expanded photo"
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
