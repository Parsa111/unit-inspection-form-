/**
 * Supabase client wrapper for the Unit Inspection Form.
 *
 * Responsibilities:
 *   - Upload inspection photos & signature to a public Storage bucket as
 *     image files (so the database only stores the returned URL, not the
 *     raw binary blob).
 *   - Insert a single row into the `unit_inspections` table containing the
 *     full form data + the generated image URLs.
 */

import { createClient } from '@supabase/supabase-js'
import { generateInspectionPdf, uploadPdf } from './pdfReport'

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://oeretbscjmphptlytbhw.supabase.co'

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmV0YnNjam1waHB0bHl0Ymh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNTU2MDksImV4cCI6MjEwNjczMTYwOX0.xozfH5GPqsSZtMSQQqKivtm0RFXkT9zmrOCXZzlXuuM'

export const BUCKET = 'inspection-images'

export function getPublicUrl(relativePath) {
  if (!relativePath) return null
  if (typeof relativePath === 'string' && (relativePath.startsWith('http') || relativePath.startsWith('data:'))) return relativePath
  // Paths are generated internally (photos/<stamp>.jpg, reports/<stamp>.pdf,
  // signatures/<stamp>.jpg) so they contain only URL-safe characters; do not
  // percent-encode the whole path, or the '/' folder separators become %2F and
  // the public URL 404s.
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${relativePath}`
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const restHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

const storageHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
}

/**
 * Convert a base64 data URL (e.g. from canvas.toDataURL or a file reader)
 * into a Blob so it can be uploaded via the Storage API.
 */
function dataURLtoBlob(dataURL) {
  if (!dataURL) return null
  const [header, base64] = dataURL.split(',')
  const mimeMatch = header.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const byteString = atob(base64)
  const ab = new ArrayBuffer(byteString.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) view[i] = byteString.charCodeAt(i)
  return new Blob([ab], { type: mime })
}

/**
 * Upload a single image to the public Storage bucket and return its public URL.
 * Falls back to the original data URL if upload fails (so the form still works
 * offline / when storage is unavailable).
 */
export async function uploadImage(dataURL, folder = 'photos') {
  if (!dataURL) return null

  // If it is already a URL, return as-is.
  if (typeof dataURL === 'string' && dataURL.startsWith('http')) return dataURL

  const blob = dataURLtoBlob(dataURL)
  if (!blob) return dataURL

  const ext = blob.type.includes('jpeg') ? 'jpg' : blob.type.includes('webp') ? 'webp' : 'png'
  const stamp = Date.now() + '-' + Math.random().toString(36).slice(2, 8)
  const path = `${folder}/${stamp}.${ext}`

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(path)}`,
    {
      method: 'POST',
      headers: storageHeaders,
      body: blob,
    }
  )

  if (!res.ok) {
    // Upload failed — fall back to the data URL so the form still functions.
    return dataURL
  }

  return getPublicUrl(path)
}

/**
 * Build a flat list of all photo data URLs across every inspection section,
 * plus the signature, and upload each one to storage.
 *
 * Returns an object mapping a section key -> array of public URLs, plus the
 * signature URL. Sections with no photos are omitted.
 */
export async function uploadAllImages(form, signatureDataUrl) {
  const sections = [
    'exteriorSuiteDoor',
    'partitionWalls',
    'washer',
    'dryer',
    'ac',
    'kitchenTaps',
    'washroom',
    'balcony',
    'windows',
    'pets',
    'ebikes',
  ]

  const photoUrls = {}

  for (const key of sections) {
    const photos = form[key]?.photos || []
    if (photos.length === 0) continue
    const urls = []
    for (const photo of photos) {
      const src = typeof photo === 'string' ? photo : photo?.src
      if (src) {
        const url = await uploadImage(src, 'photos')
        if (url) urls.push(url)
      }
    }
    if (urls.length) photoUrls[key] = urls
  }

  const signatureUrl = signatureDataUrl
    ? await uploadImage(signatureDataUrl, 'signatures')
    : null

  return { photoUrls, signatureUrl }
}

/**
 * Insert a single inspection row into `unit_inspections`.
 * Only the public image URLs are stored in the database — the raw image bytes
 * live in Supabase Storage, keeping the DB row small.
 */
export async function submitInspection(payload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/unit_inspections`, {
    method: 'POST',
    headers: { ...restHeaders, Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  })

  const text = await res.text()

  if (!res.ok) {
    let errorMessage = text
    try {
      const errorJson = JSON.parse(text)
      if (errorJson.code === '42P01' || errorJson.message.includes('relation "unit_inspections" does not exist')) {
        errorMessage = 'Database table "unit_inspections" does not exist. Please run the SQL setup in your Supabase project (see supabase-setup.sql).'
      }
    } catch {
      errorMessage = text
    }
    throw new Error(`Supabase insert failed (${res.status}): ${errorMessage}`)
  }

  try {
    return JSON.parse(text)
  } catch {
    return { success: true }
  }
}

/**
 * Convenience helper: upload images + insert row in one call.
 */
export async function submitUnitInspection(form, signatureDataUrl, pdfUrl = null) {
  if (!pdfUrl) throw new Error('PDF upload did not return a URL; inspection was not submitted.')
  // Upload photos + signature to storage. Upload failures must not block
  // saving the inspection to the database.
  let photoUrls = {}
  let signatureUrl = null
  try {
    const uploaded = await uploadAllImages(form, signatureDataUrl)
    photoUrls = uploaded.photoUrls
    signatureUrl = uploaded.signatureUrl
  } catch (e) {
    console.error('Submit image upload failed:', e)
  }

  // Create a sanitized form for storage: replace photo arrays with public URLs
  const sanitizedForm = { ...form }
  for (const key in sanitizedForm) {
    if (
      sanitizedForm[key] &&
      typeof sanitizedForm[key] === 'object' &&
      Array.isArray(sanitizedForm[key].photos)
    ) {
      // Replace the photos array with the uploaded URLs (if any) or empty array
      sanitizedForm[key].photos = photoUrls[key] || []
    }
  }

   const payload = {
     inspection_date: form.inspectionDate || null,
     building: form.building || null,
     suite_number: form.suiteNumber || null,
     inspector_name: form.inspectorName || null,
     inspector_date: form.inspectorDate || null,
     signature_url: signatureUrl,
     pdf_url: pdfUrl ? getPublicUrl(pdfUrl) : null,
     status: 'completed',
     data: {
       ...sanitizedForm,
     pdf_url: pdfUrl ? getPublicUrl(pdfUrl) : null,
       submittedAt: new Date().toISOString(),
     },
     submitted_at: new Date().toISOString(),
   }

  const rows = await submitInspection(payload)
  return { rows, photoUrls, signatureUrl }
}

/**
 * Subscribe to real-time changes on the `unit_inspections` table.
 *
 * @param {object} opts
 * @param {function} opts.onInsert - called with the new row on INSERT
 * @param {function} opts.onUpdate - called with the updated row on UPDATE
 * @param {function} opts.onDelete - called with the deleted row on DELETE
 * @returns {function} unsubscribe
 *
 * Requires Realtime to be enabled for `unit_inspections` in the Supabase
 * Dashboard (Database → Replication → Realtime) and a SELECT policy for
 * the anon role (already present in supabase-setup.sql).
 */
export function subscribeToInspections({ onInsert, onUpdate, onDelete } = {}) {
  const channel = supabase
    .channel('unit_inspections_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'unit_inspections' },
      (payload) => onInsert && onInsert(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'unit_inspections' },
      (payload) => onUpdate && onUpdate(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'unit_inspections' },
      (payload) => onDelete && onDelete(payload.old)
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Build a draft-safe payload (photos/signature kept as data URLs so no
 * Storage round-trip is needed on every auto-save).
 */
function buildDraftPayload(form, signatureDataUrl, pdfUrl, status = 'draft') {
  return {
    inspection_date: form.inspectionDate || null,
    building: form.building || null,
    suite_number: form.suiteNumber || null,
    inspector_name: form.inspectorName || null,
    inspector_date: form.inspectorDate || null,
    signature_url: signatureDataUrl || null,
    pdf_url: pdfUrl ? getPublicUrl(pdfUrl) : null,
    status,
    updated_by: form.inspectorName || null,
    data: {
      ...form,
      signatureData: signatureDataUrl || null,
      pdf_url: pdfUrl ? getPublicUrl(pdfUrl) : null,
      savedAt: new Date().toISOString(),
    },
  }
}

async function rest(path, { method = 'GET', body, query = '' } = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}${query ? '?' + query : ''}`
  const res = await fetch(url, {
    method,
    headers: {
      ...restHeaders,
      ...(body ? { 'Content-Type': 'application/json', Prefer: 'return=representation' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    Prefer: 'return=representation',
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Supabase ${method} ${path} failed (${res.status}): ${text}`)
  try { return JSON.parse(text) } catch { return { success: true, text } }
}

/**
 * Save (insert or update) an inspection draft row. Returns the saved row(s).
 */
export async function saveDraft(draftId, form, signatureDataUrl, pdfUrl = null, status = 'draft') {
  // If no draftId is tracked (e.g. after a page refresh), look for an existing
  // draft for the same building + suite so we update it instead of creating a duplicate row.
  if (!draftId && form.building && form.suiteNumber) {
    try {
      const existing = await findExistingInspection(form.building, form.suiteNumber)
      if (existing && existing.status === 'draft') {
        draftId = existing.id
      }
    } catch {
      // Ignore lookup failures and proceed to insert a new draft row.
    }
  }

  // Generate and upload a PDF for drafts too, so the stored pdf_url is a
  // complete public URL that opens the report when copied.
  // PDF failures must not block saving the draft itself.
  if (!pdfUrl) {
    const blob = await generateInspectionPdf({
      ...form,
      signatureData: signatureDataUrl,
      submittedAt: new Date().toISOString(),
    })
    const fileName = `draft-${Date.now()}.pdf`
    pdfUrl = await uploadPdf(blob, fileName)
  }
  if (!pdfUrl) throw new Error('PDF upload did not return a URL; draft was not saved.')

  // Upload photos + signature to storage so the database stores short public URLs
  // instead of giant base64 data URLs (same as submit).
  // Upload failures must not block saving the draft itself.
  let photoUrls = {}
  let signatureUrl = null
  try {
    const uploaded = await uploadAllImages(form, signatureDataUrl)
    photoUrls = uploaded.photoUrls
    signatureUrl = uploaded.signatureUrl
  } catch (e) {
    console.error('Draft image upload failed:', e)
  }

  // Merge uploaded photo URLs into the form data (replacing base64 data URLs)
  const sanitizedForm = { ...form }
  for (const key in sanitizedForm) {
    if (
      sanitizedForm[key] &&
      typeof sanitizedForm[key] === 'object' &&
      Array.isArray(sanitizedForm[key].photos)
    ) {
      sanitizedForm[key].photos = photoUrls[key] || []
    }
  }

   const payload = buildDraftPayload(sanitizedForm, signatureUrl, pdfUrl, status)
   if (draftId) {
      const updated = await rest(`unit_inspections?id=eq.${encodeURIComponent(draftId)}`, {
        method: 'PATCH',
        body: payload,
      })
      if (Array.isArray(updated) && updated.length > 0) return updated
   }
   return await rest('unit_inspections', { method: 'POST', body: payload })
 }

/**
 * List all inspections ordered by most recently updated (drafts first).
 * Falls back to client-side sorting if the server cannot order by updated_at.
 */
export async function listInspections() {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const rows = await rest('unit_inspections', {
    query: `select=*&status=eq.draft&submitted_at=gte.${encodeURIComponent(startOfToday)}&submitted_at=lt.${encodeURIComponent(endOfToday)}&order=submitted_at.desc`,
  });
  const arr = Array.isArray(rows) ? rows : [];
  arr.sort((a, b) => {
    const aTime = a.updated_at || a.submitted_at || 0;
    const bTime = b.updated_at || b.submitted_at || 0;
    return new Date(bTime) - new Date(aTime);
  });
  return arr;
}

/**
 * Find the most recent inspection/draft for a given building + suite number.
 */
export async function fetchInspection(id) {
  const rows = await rest(`unit_inspections?id=eq.${encodeURIComponent(id)}`)
  return Array.isArray(rows) && rows.length ? rows[0] : null
}

/**
 * Find the most recent inspection/draft for a given building + suite number.
 */
export async function findExistingInspection(building, suiteNumber) {
  if (!building || !suiteNumber) return null
  const rows = await rest('unit_inspections', {
    query: `select=*&building=eq.${encodeURIComponent(building)}&suite_number=eq.${encodeURIComponent(suiteNumber)}&order=submitted_at.desc&limit=1`,
  })
  return Array.isArray(rows) && rows.length ? rows[0] : null
}

/**
 * Update an existing completed inspection (new submission for same unit).
 * Appends an update-history entry preserving the previous data.
 */
export async function updateCompletedInspection(id, form, signatureDataUrl, pdfUrl, reason) {
  if (!pdfUrl) throw new Error('PDF upload did not return a URL; inspection was not completed.')
  const rows = await rest(`unit_inspections?id=eq.${encodeURIComponent(id)}`)
  const row = Array.isArray(rows) && rows.length ? rows[0] : null
  const history = Array.isArray(row?.update_history) ? [...row.update_history] : []
  history.push({
    updated_by: form.inspectorName || null,
    updated_at: new Date().toISOString(),
    update_reason: reason || null,
    previous_data: row?.data || null,
    previous_status: row?.status || null,
  })

  // Upload signature to storage so the database stores a short relative path
  // instead of a giant base64 data URL.
  let sigPath = null
  if (signatureDataUrl && signatureDataUrl.startsWith('data:')) {
    try {
      sigPath = await uploadImage(signatureDataUrl, 'signatures')
    } catch (err) {
      console.error('Signature upload failed; continuing with database update:', err)
      sigPath = row?.signature_url || null
    }
  } else {
    sigPath = signatureDataUrl || row?.signature_url || null
  }

  const payload = {
    inspector_name: form.inspectorName || null,
    inspector_date: form.inspectorDate || null,
    signature_url: sigPath,
    pdf_url: pdfUrl ? getPublicUrl(pdfUrl) : row?.pdf_url || null,
    status: 'completed',
    updated_by: form.inspectorName || null,
    update_reason: reason || null,
    updated_at: new Date().toISOString(),
    update_history: history,
    data: {
      ...form,
      signatureData: sigPath || null,
      pdf_url: pdfUrl ? getPublicUrl(pdfUrl) : row?.pdf_url || null,
      submittedAt: new Date().toISOString(),
    },
  }
  return await rest(`unit_inspections?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: payload,
  })
}