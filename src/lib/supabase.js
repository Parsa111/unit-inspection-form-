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

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://oeretbscjmphptlytbhw.supabase.co'

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmV0YnNjam1waHB0bHl0Ymh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNTU2MDksImV4cCI6MjEwNjczMTYwOX0.xozfH5GPqsSZtMSQQqKivtm0RFXkT9zmrOCXZzlXuuM'

export const BUCKET = 'inspection-images'

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

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
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
    headers: restHeaders,
    body: JSON.stringify(payload),
    Prefer: 'return=representation',
  })

  const text = await res.text()

  if (!res.ok) {
    // Try to parse the error response as JSON to get more details
    let errorMessage = text
    try {
      const errorJson = JSON.parse(text)
      if (errorJson.code === '42P01' || errorJson.message.includes('relation "unit_inspections" does not exist')) {
        errorMessage = 'Database table "unit_inspections" does not exist. Please run the SQL setup in your Supabase project (see supabase-setup.sql).'
      }
    } catch {
      // If we can't parse the JSON, use the text as is
    }
    throw new Error(`Supabase insert failed (${res.status}): ${errorMessage}`)
  }

  // Handle successful response
  if (text === '') {
    throw new Error('Empty response from Supabase')
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Failed to parse JSON response from Supabase: ${text}`)
  }
}

/**
 * Convenience helper: upload images + insert row in one call.
 */
export async function submitUnitInspection(form, signatureDataUrl) {
  const { photoUrls, signatureUrl } = await uploadAllImages(form, signatureDataUrl)

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
    data: {
      ...sanitizedForm,
      submittedAt: new Date().toISOString(),
    },
    submitted_at: new Date().toISOString(),
  }

  const rows = await submitInspection(payload)
  return { rows, photoUrls, signatureUrl }
}