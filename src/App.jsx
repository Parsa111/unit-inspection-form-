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
import Windows from './components/items/Windows'
import Pets from './components/items/Pets'
import EBikes from './components/items/EBikes'
import SignatureSection from './components/SignatureSection'
import SuccessCard from './components/SuccessCard'
import { submitUnitInspection, saveDraft, fetchInspection, listInspections, findExistingInspection, updateCompletedInspection } from './lib/supabase'
import { generateInspectionPdf, uploadPdf } from './lib/pdfReport'

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
  windows: { damage: '', comments: '', photos: [] },
  pets: { present: '', allowed: '', details: '', other: '', photos: [] },
  ebikes: { present: '', count: '', location: '', photos: [] },
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
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [draftId, setDraftId] = useState(null)
  const [draftMessage, setDraftMessage] = useState('')
  const [savingDraft, setSavingDraft] = useState(false)
  const signatureRef = useRef(null)
  const [drafts, setDrafts] = useState([])
  useEffect(() => {
    listInspections().then((rows) => {
      if (Array.isArray(rows)) setDrafts(rows.filter((r) => r.status !== 'completed'))
    }).catch(() => {})
  }, [])
  const [errors, setErrors] = useState({})
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ycc76_theme') === 'dark')
  // Restore draft from URL ?draft=<id>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('draft')
    if (!id) return
    fetchInspection(id).then((row) => {
      if (!row?.data) return
      const data = row.data || {}
      setForm((f) => ({ ...defaultForm, ...f, ...data }))
      setDraftId(row.id)
    }).catch(() => {})
  }, [])

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

  // Calculate completion count (12 total sections)
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
    Boolean(form.windows.damage),
    Boolean(form.pets.present || form.pets.allowed),
    Boolean(form.ebikes.present),
  ].filter(Boolean).length

  const validate = () => {
    const e = {}
    if (!form.suiteNumber.trim()) e.suiteNumber = 'Suite # is required'
    if (!form.inspectorName.trim()) e.inspectorName = 'Inspector name is required'
    if (!signatureRef.current?.hasSigned()) e.signature = 'Please draw your signature'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSaveDraft = async () => {
    setSavingDraft(true)
    setDraftMessage('')
    // Show confirmation instantly without waiting for upload / DB insert
    setDraftMessage('Draft saved successfully.')
    const sigData = signatureRef.current?.getDataUrl?.() || null
    try {
      const rows = await saveDraft(draftId, form, sigData, null, 'draft')
      const saved = Array.isArray(rows) && rows.length ? rows[0] : null
      if (saved?.id) setDraftId(saved.id)
      // Refresh drafts list so the saved draft appears without refreshing the page
      try {
        const all = await listInspections()
        if (Array.isArray(all)) setDrafts(all.filter((r) => r.status !== 'completed'))
      } catch {}
    } catch (err) {
      setDraftMessage('Saved locally; upload failed: ' + (err?.message || 'unknown error'))
    } finally {
      setSavingDraft(false)
    }
  }

  const handleContinueDraft = (row) => {
    const data = row?.data || {}
    setForm((f) => ({ ...defaultForm, ...f, ...data }))
    setDraftId(row.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
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

    const existing = await findExistingInspection(form.building, form.suiteNumber)
    if (existing && existing.id !== draftId) {
      if (existing.status !== 'completed') {
        const cont = window.confirm('A draft/in-progress inspection exists for this unit. Continue it instead of creating a new one?')
        if (cont) {
          handleContinueDraft(existing)
          return
        } else {
          return
        }
      } else {
        const upd = window.confirm('An inspection already exists for this unit. Update existing inspection?')
        if (!upd) return
        const reasonChoice = window.prompt('Select update reason: 1) Follow-up visit 2) Incomplete inspection 3) Second visit 4) Other')
        const reasons = { '1': 'Follow-up visit', '2': 'Incomplete inspection', '3': 'Second visit' }
        let reason = reasons[reasonChoice]
        if (reasonChoice === '4') {
          reason = window.prompt('Please provide explanation:')
        }
        if (!reason || !reason.trim()) {
          window.alert('Update reason is required.')
          return
        }
        // update path
        setSubmitting(true)
        try {
          const sigData = signatureRef.current?.getDataUrl()
          const pdfUrl = null
          await updateCompletedInspection(existing.id, form, sigData, pdfUrl, reason)
          setSubmitted(true)
        } catch (err) {
          setSubmitError(err?.message || 'Update failed')
        } finally {
          setSubmitting(false)
        }
        return
      }
    }

    const sigData = signatureRef.current?.getDataUrl?.() || null

    // If continuing an existing draft, update that same row instead of creating a new one.
    if (draftId) {
      setSubmitting(true)
      setSubmitError('')
      try {
        const submission = {
          ...form,
          signatureData: sigData,
          submittedAt: new Date().toISOString(),
        }
        // Generate PDF report and upload first, so pdf_url is stored with the row.
        let pdfUrl = null
        try {
          const blob = await generateInspectionPdf(submission)
          const fileName = `report-${Date.now()}.pdf`
          pdfUrl = await uploadPdf(blob, fileName)
        } catch (e) {
          console.error('PDF generation/upload failed:', e)
        }
        const result = await updateCompletedInspection(draftId, form, sigData, pdfUrl, 'Completed from draft')
        const rows = Array.isArray(result) ? result : [result]
        setSubmittedData({ ...submission, supabase: { rows, pdfUrl } })
        setSubmitted(true)
        localStorage.removeItem(STORAGE_KEY)
      } catch (err) {
        setSubmitError(err?.message || 'Update failed')
      } finally {
        setSubmitting(false)
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const submission = {
      ...form,
      signatureData: sigData,
      submittedAt: new Date().toISOString(),
    }

    // Persist submission history (always, as an offline fallback)
    try {
      const all = JSON.parse(localStorage.getItem('ycc76_submissions') || '[]')
      all.unshift(submission)
      localStorage.setItem('ycc76_submissions', JSON.stringify(all))
      localStorage.removeItem(STORAGE_KEY)
    } catch {}

    setSubmitting(true)
    setSubmitError('')

    try {
      // Generate PDF report and upload first, so pdf_url is stored with the row.
      let pdfUrl = null
      try {
        const blob = await generateInspectionPdf(submission)
        const fileName = `report-${Date.now()}.pdf`
        pdfUrl = await uploadPdf(blob, fileName)
      } catch (e) {
        console.error('PDF generation/upload failed:', e)
      }

      // Upload images to Supabase Storage (stores URLs, not blobs) and
      // insert the inspection row into the database.
      const result = await submitUnitInspection(form, sigData, pdfUrl)
      setSubmittedData({ ...submission, supabase: { ...result, pdfUrl } })
    } catch (err) {
      // Network/storage failure — keep the locally saved submission so the
      // data is not lost; surface the error to the inspector.
      console.error('Supabase submit failed:', err)
      setSubmitError(
        err?.message || 'Could not save to the database. Your report was kept locally.'
      )
      setSubmittedData({ ...submission, supabase: { pdfUrl } })
    } finally {
      setSubmitting(false)
    }

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
          completedCount={12}
          totalCount={12}
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
        totalCount={12}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28">
        {drafts.length > 0 && (
          <div className="mb-6 space-y-2">
            <h3 className="text-sm font-bold">Saved Drafts</h3>
            {drafts.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border">
                <div>
                  <div className="text-sm font-medium">{d.building} - {d.suite_number || 'No suite'}</div>
                  <div className="text-xs text-slate-500">{d.status} · {new Date(d.updated_at || d.submitted_at).toLocaleString()}</div>
                </div>
                <button type="button" onClick={() => handleContinueDraft(d)} className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg">Continue Inspection</button>
              </div>
            ))}
          </div>
        )}
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
              Physical In-Suite Scope Items (1–9)
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

          {/* 08 — Windows */}
          <Windows
            data={form.windows}
            onChange={(f, v) => update('windows', f, v)}
          />

          {/* 09 — Pets */}
          <Pets
            data={form.pets}
            onChange={(f, v) => update('pets', f, v)}
          />

          {/* 10 — E-Bikes */}
          <EBikes
            data={form.ebikes}
            onChange={(f, v) => update('ebikes', f, v)}
          />

          {/* Section Divider with label */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Inspector Sign-Off (Item 10)
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

          {/* Save Draft + Submit Action Bar */}
          <div className="pt-4 space-y-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft}
              className={`w-full py-3 px-6 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-base font-bold rounded-2xl transition-all ${savingDraft ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {savingDraft ? 'Saving Draft…' : 'Save Draft'}
            </button>
            {draftMessage && (
              <p className="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">{draftMessage}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className={`group relative w-full py-4 px-6 bg-gradient-to-r from-navy-700 via-navy-600 to-blue-600 hover:from-navy-800 hover:via-navy-700 hover:to-blue-700 text-white text-base sm:text-lg font-bold rounded-2xl shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-900/20 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer overflow-hidden ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform ${submitting ? 'animate-spin' : ''}`}>
                {submitting ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  '✓'
                )}
              </div>
              <span className="tracking-wide">
                {submitting ? 'Saving to Database…' : 'Submit Unit Inspection Report'}
              </span>
            </button>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
              Transmits recorded conditions to York Condominium Corporation No. 76 records
            </p>
            {submitError && (
              <p className="text-center text-xs font-bold text-red-600 dark:text-red-400 mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
                ⚠ {submitError}
              </p>
            )}
          </div>

        </form>
      </main>
    </div>
  )
}
