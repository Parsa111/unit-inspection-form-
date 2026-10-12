import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import CorpHeader from './components/CorpHeader'
import ExteriorSuiteDoor from './components/items/ExteriorSuiteDoor'
import PartitionWalls from './components/items/PartitionWalls'
import Washer from './components/items/Washer'
import Dryer from './components/items/Dryer'
import AirConditioners from './components/items/AirConditioners'
import KitchenTaps from './components/items/KitchenTaps'
import Washroom from './components/items/Washroom'
import Balcony from './components/items/Balcony'
import Pets from './components/items/Pets'
import SignatureSection from './components/SignatureSection'
import SuccessCard from './components/SuccessCard'

const STORAGE_KEY = 'ycc76_inspection_draft'

function getLocalDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const defaultForm = {
  inspectionDate: '',
  building: '5 Massey',
  suiteNumber: '',
  exteriorSuiteDoor: { altered: '', alterations: {}, comments: '', photos: [] },
  partitionWalls: { status: '', details: '', other: '', photos: [] },
  washer: { present: '', portable: false, direct: false, kitchen: false, checkValves: false, notes: '', other: '', photos: [] },
  dryer: { present: '', kitchen: false, other: '', photos: [] },
  ac: { present: '', fixed: false, portable: false, qty: 1, safety: '', other: '', photos: [] },
  kitchenTaps: { status: '', pipesNote: '', other: '', photos: [] },
  washroom: { toiletCondition: '', toiletComment: '', tapsLeaking: '', tapsComment: '', vanityLeaking: '', vanityComment: '', fanPresent: '', photos: [] },
  balcony: { damage: '', comment: '', photos: [] },
  pets: { present: '', allowed: '', details: '', other: '', photos: [] },
  inspectorName: '',
  inspectorDate: '',
}

export default function App() {
  const [form, setForm] = useState(() => {
    const today = getLocalDateString()
    return { ...defaultForm, inspectionDate: today, inspectorDate: today }
  })
  const [submitted, setSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)
  const [errors, setErrors] = useState({})
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ycc76_theme') === 'dark')
  const signatureRef = useRef(null)

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch {}
  }, [form])

  // Sync dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('ycc76_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const update = (section, field, value) => {
    setForm((f) => ({
      ...f,
      [section]:
        typeof field === 'string'
          ? { ...f[section], [field]: value }
          : value,
    }))
    // Clear error on change
    if (errors[section] || errors[field]) {
      setErrors((e) => {
        const n = { ...e }
        delete n[section]
        delete n[field]
        return n
      })
    }
  }

  // Calculate completion count (10 total sections)
  const completedSections = [
    Boolean(form.suiteNumber.trim()),
    Boolean(form.exteriorSuiteDoor.altered),
    Boolean(form.partitionWalls.status),
    Boolean(form.washer.present),
    Boolean(form.dryer.present),
    Boolean(form.ac.present || form.ac.safety),
    Boolean(form.kitchenTaps.status),
    Boolean(form.washroom.toiletCondition || form.washroom.tapsLeaking || form.washroom.vanityLeaking || form.washroom.fanPresent),
    Boolean(form.balcony.damage),
    Boolean(form.pets.present || form.pets.allowed),
  ].filter(Boolean).length

  const validate = () => {
    const e = {}
    if (!form.suiteNumber.trim()) e.suiteNumber = 'Suite # is required'
    if (!form.inspectorName.trim()) e.inspectorName = 'Inspector name is required'
    if (!signatureRef.current?.hasSigned()) e.signature = 'Please draw your signature'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      // Smooth scroll to the first element with error
      setTimeout(() => {
        const firstErr = document.querySelector('[data-error="true"]')
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 50)
      return
    }

    const sigData = signatureRef.current?.getDataUrl()
    const submission = {
      ...form,
      signatureData: sigData,
      submittedAt: new Date().toISOString(),
    }

    // Persist submission history
    try {
      const all = JSON.parse(localStorage.getItem('ycc76_submissions') || '[]')
      all.unshift(submission)
      localStorage.setItem('ycc76_submissions', JSON.stringify(all))
      localStorage.removeItem(STORAGE_KEY)
    } catch {}

    setSubmittedData(submission)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    if (window.confirm('Reset all fields and start a fresh inspection draft?')) {
      localStorage.removeItem(STORAGE_KEY)
      setForm({ ...defaultForm })
      signatureRef.current?.clear()
      setErrors({})
      const today = getLocalDateString()
      setForm((f) => ({ ...f, inspectionDate: today, inspectorDate: today }))
    }
  }

  const handleNewInspection = () => {
    localStorage.removeItem(STORAGE_KEY)
    setForm({ ...defaultForm })
    signatureRef.current?.clear()
    setErrors({})
    setSubmitted(false)
    setSubmittedData(null)
    const today = getLocalDateString()
    setForm((f) => ({ ...f, inspectionDate: today, inspectorDate: today }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (submitted && submittedData) {
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 bg-ambient-mesh transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onReset={null}
          completedCount={10}
          totalCount={10}
        />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <SuccessCard data={submittedData} onNewInspection={handleNewInspection} />
        </main>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 bg-ambient-mesh transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onReset={handleReset}
        completedCount={completedSections}
        totalCount={10}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          
          {/* Corp Header & Meta Information */}
<CorpHeader
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
          />

          {/* 00 — Exterior Suite Door (can be done anytime, no entry permission needed) */}
          <ExteriorSuiteDoor
            data={form.exteriorSuiteDoor}
            onChange={(f, v) => update('exteriorSuiteDoor', f, v)}
          />

          {/* Section Divider with label */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Physical In-Suite Scope Items (1–8)
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* 01 — Partition Walls */}
          <PartitionWalls
            data={form.partitionWalls}
            onChange={(f, v) => update('partitionWalls', f, v)}
          />

          {/* 02 — Washer */}
          <Washer
            data={form.washer}
            onChange={(f, v) => update('washer', f, v)}
          />

          {/* 03 — Dryer */}
          <Dryer
            data={form.dryer}
            onChange={(f, v) => update('dryer', f, v)}
          />

          {/* 04 — Air Conditioners */}
          <AirConditioners
            data={form.ac}
            onChange={(f, v) => update('ac', f, v)}
          />

          {/* 05 — Kitchen Taps */}
          <KitchenTaps
            data={form.kitchenTaps}
            onChange={(f, v) => update('kitchenTaps', f, v)}
          />

          {/* 06 — Washroom */}
          <Washroom
            data={form.washroom}
            onChange={(f, v) => update('washroom', f, v)}
          />

          {/* 07 — Balcony */}
          <Balcony
            data={form.balcony}
            onChange={(f, v) => update('balcony', f, v)}
          />

          {/* 08 — Pets */}
          <Pets
            data={form.pets}
            onChange={(f, v) => update('pets', f, v)}
          />

          {/* Section Divider with label */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Inspector Sign-Off (Item 9)
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* 09 — Signature */}
          <SignatureSection
            ref={signatureRef}
            inspectorName={form.inspectorName}
            inspectorDate={form.inspectorDate}
            onNameChange={(v) => update('inspectorName', null, v)}
            onDateChange={(v) => update('inspectorDate', null, v)}
            errors={errors}
          />

          {/* Submit Action Bar */}
          <div className="pt-4">
            <button
              type="submit"
              className="group relative w-full py-4 px-6 bg-gradient-to-r from-navy-700 via-navy-600 to-blue-600 hover:from-navy-800 hover:via-navy-700 hover:to-blue-700 text-white text-base sm:text-lg font-bold rounded-2xl shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-900/20 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer overflow-hidden"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">
                ✓
              </div>
              <span className="tracking-wide">Submit Unit Inspection Report</span>
            </button>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
              Transmits recorded conditions to York Condominium Corporation No. 76 records
            </p>
          </div>

        </form>
      </main>
    </div>
  )
}
