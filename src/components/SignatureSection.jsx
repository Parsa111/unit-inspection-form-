import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react'

const SignatureSection = forwardRef(function SignatureSection(
  { inspectorName, inspectorDate, onNameChange, onDateChange, errors },
  ref
) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signed, setSigned] = useState(false)

  useImperativeHandle(ref, () => ({
    hasSigned: () => signed,
    getDataUrl: () => canvasRef.current?.toDataURL('image/png'),
    clear: () => {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      setSigned(false)
    },
  }))

  // Resize canvas to match CSS pixel size with high DPR
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#0f172a'
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const getXY = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  const startDraw = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    setSigned(true)
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getXY(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getXY(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDraw = () => setIsDrawing(false)

  const clearSig = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    setSigned(false)
  }

  return (
    <div
      data-error={!!errors.signature || !!errors.inspectorName}
      className={`relative bg-white dark:bg-slate-900/95 rounded-2xl border shadow-sm transition-all duration-200 overflow-hidden ${
        errors.signature || errors.inspectorName
          ? 'border-red-400 ring-2 ring-red-400/20'
          : 'border-slate-200/80 dark:border-slate-800 hover:shadow-md'
      }`}
    >
      {/* Active colored status indicator bar on left border */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-1.5 transition-colors duration-300 ${
          signed && inspectorName
            ? 'bg-emerald-600 dark:bg-emerald-500'
            : 'bg-slate-200 dark:bg-slate-800'
        }`}
      />

      <div className="p-5 pl-6 sm:p-6 sm:pl-7 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-navy-600 dark:text-blue-400 bg-navy-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-md border border-navy-100 dark:border-blue-900/50 flex-shrink-0">
              07
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Inspector Sign-Off & Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official inspector affirmation and digital signature
              </p>
            </div>
          </div>

          <div>
            {signed && inspectorName ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                ✓ Signed
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Required
              </span>
            )}
          </div>
        </div>

        {/* Name & Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="inspectorName"
                className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Inspected By <span className="text-red-500">*</span>
              </label>
              {errors.inspectorName && (
                <span className="text-[0.7rem] text-red-500 font-bold">
                  {errors.inspectorName}
                </span>
              )}
            </div>
            <select
              id="inspectorName"
              value={inspectorName}
              onChange={(e) => onNameChange(e.target.value)}
              className={`min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 transition-all ${
                errors.inspectorName
                  ? 'border-red-500 focus:ring-red-400/30'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
              }`}
            >
              <option value="">Select inspector</option>
              <option value="Anatoliy Dovgan">Anatoliy Dovgan</option>
              <option value="Bojan Stojanovski">Bojan Stojanovski</option>
              <option value="Dejan Drapik">Dejan Drapik</option>
              <option value="Hari Spirkoski">Hari Spirkoski</option>
              <option value="Nikola Trajkov">Nikola Trajkov</option>
              <option value="Oleksi Kovalov">Oleksi Kovalov</option>
              <option value="Reg Persaud">Reg Persaud</option>
              <option value="Volodymyr Prishliak">Volodymyr Prishliak</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="inspectorDate"
              className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Sign-Off Date
            </label>
            <input
              id="inspectorDate"
              type="date"
              value={inspectorDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Signature Drawing Canvas */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span
              className={`text-[0.7rem] font-bold uppercase tracking-wider ${
                errors.signature ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Digital Signature {errors.signature ? '— Signature Required' : ''}
            </span>
            <button
              type="button"
              onClick={clearSig}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                <path
                  fillRule="evenodd"
                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                />
              </svg>
              Clear Signature
            </button>
          </div>

          <div
            className={`relative rounded-xl border-2 border-dashed overflow-hidden bg-white shadow-inner transition-all ${
              errors.signature
                ? 'border-red-400 bg-red-50/20'
                : 'border-slate-300 dark:border-slate-600'
            }`}
            style={{ height: '140px' }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                touchAction: 'none',
                cursor: 'crosshair',
              }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />

            {!signed && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-slate-400 dark:text-slate-500 gap-1">
                <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <p className="text-xs font-semibold">
                  Draw inspector signature using finger, stylus, or mouse
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default SignatureSection
