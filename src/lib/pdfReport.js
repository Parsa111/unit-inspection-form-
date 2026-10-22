import { jsPDF } from 'jspdf'
import { SUPABASE_URL, SUPABASE_ANON_KEY, BUCKET } from './supabase'

export async function generateInspectionPdf(data) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  let y = 40

  doc.setFontSize(18)
  doc.text('Unit Inspection Report', margin, y)
  y += 26
  doc.setFontSize(10)
  doc.text(`Building: ${data.building || '—'}   Suite: ${data.suiteNumber || '—'}`, margin, y); y += 14
  doc.text(`Inspection Date: ${data.inspectionDate || '—'}   Inspector: ${data.inspectorName || '—'}`, margin, y); y += 14
  doc.text(`Inspector Date: ${data.inspectorDate || '—'}`, margin, y); y += 22

  const lines = [
    ['Exterior Suite Door', data.exteriorSuiteDoor?.altered, data.exteriorSuiteDoor?.comments],
    ['Partition Walls', data.partitionWalls?.status, data.partitionWalls?.details],
    ['Washer', data.washer?.present, data.washer?.notes],
    ['Dryer', data.dryer?.present, data.dryer?.other],
    ['AC(s)', data.ac?.present, `${data.ac?.fixed ? 'Fixed x' + data.ac?.fixedQty : ''} ${data.ac?.portable ? 'Portable x' + data.ac?.portableQty : ''} ${data.ac?.safety || ''}`.trim() || '—'],
    ['Kitchen Taps', data.kitchenTaps?.status, data.kitchenTaps?.pipesNote],
    ['Washroom', data.washroom?.toiletCondition, data.washroom?.tapsComment || data.washroom?.vanityComment],
    ['Balcony', data.balcony?.damage, data.balcony?.comment],
    ['Windows', data.windows?.damage, data.windows?.comments],
    ['Pets', data.pets?.present, data.pets?.petCount],
    ['E-Bikes', data.ebikes?.present, data.ebikes?.location],
    ['Other Devices', data.otherDevices?.speaker || data.otherDevices?.smokeAlarm || data.otherDevices?.dts, data.otherDevices?.speakerNote || data.otherDevices?.smokeStatus || data.otherDevices?.dts],
  ]

  for (const [label, status, comment] of lines) {
    if (y > 720) { doc.addPage(); y = 40 }
    doc.setFontSize(12)
    doc.text(label, margin, y); y += 14
    doc.setFontSize(10)
    doc.text(`Status: ${status || '—'}`, margin, y); y += 12
    doc.text(`Notes: ${comment || '—'}`, margin, y); y += 18
  }

  const toDataUrl = async (src) => {
    if (src.startsWith('data:')) return src
    const res = await fetch(src)
    if (!res.ok) throw new Error('fetch failed ' + res.status)
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result)
      fr.onerror = reject
      fr.readAsDataURL(blob)
    })
  }
  const addImage = async (src, x, startY) => {
    if (!src || typeof src !== 'string') {
      console.warn('Skipping empty image', src)
      return startY
    }
    try {
      src = await toDataUrl(src)
    } catch (e) {
      console.error('Image fetch failed', e?.message)
    }
    try {
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = src
      })
      const imageWidth = img.naturalWidth || img.width || 100
      const imageHeight = img.naturalHeight || img.height || 100
      const scale = Math.min(1, 1200 / Math.max(imageWidth, imageHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(imageWidth * scale))
      canvas.height = Math.max(1, Math.round(imageHeight * scale))
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.72)
      doc.addImage(dataUrl, 'JPEG', x, startY, 120, 90)
      return startY + 95
    } catch (e) {
      console.error('Image failed', e?.message)
      try {
        const mimeMatch = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/)
        const mime = mimeMatch ? mimeMatch[1].toLowerCase() : ''
        let format = 'PNG'
        if (mime.includes('jpeg') || mime.includes('jpg')) format = 'JPEG'
        else if (mime.includes('webp')) format = 'WEBP'
        else if (mime.includes('bmp')) format = 'BMP'
        doc.addImage(src, format, x, startY, 120, 90)
        return startY + 95
      } catch (e2) {
        console.error('Direct addImage failed', e2?.message)
        return startY
      }
    }
  }

  const sectionsWithPhotos = [
    ['Exterior Suite Door', data.exteriorSuiteDoor?.photos],
    ['Partition Walls', data.partitionWalls?.photos],
    ['Washer', data.washer?.photos],
    ['Dryer', data.dryer?.photos],
    ['AC(s)', data.ac?.photos],
    ['Kitchen Taps', data.kitchenTaps?.photos],
    ['Washroom', data.washroom?.photos],
    ['Balcony', data.balcony?.photos],
    ['Windows', data.windows?.photos],
    ['Pets', data.pets?.photos],
    ['E-Bikes', data.ebikes?.photos],
    ['Other Devices', data.otherDevices?.photos],
  ]

  const hasPhotos = sectionsWithPhotos.some(([, arr]) => Array.isArray(arr) && arr.length > 0)
  if (hasPhotos) {
    if (y > 600) { doc.addPage(); y = 40 }
    y += 10
    doc.setFontSize(14)
    doc.text('Photos', margin, y); y += 18

    for (const [label, photos] of sectionsWithPhotos) {
      if (!Array.isArray(photos) || photos.length === 0) continue
      if (y > 600) { doc.addPage(); y = 40 }
      doc.setFontSize(11)
      doc.text(`${label} (${photos.length})`, margin, y); y += 14
      for (const p of photos) {
        const src = typeof p === 'string' ? p : p?.src
        if (src) {
          if (y > 660) { doc.addPage(); y = 40 }
          y = await addImage(src, margin, y)
        }
      }
      y += 6
    }
  }

  const sigData = data.signatureData || data.signatureDataUrl
  if (sigData) {
    if (y > 660) { doc.addPage(); y = 40 }
    y += 10
    doc.setFontSize(12)
    doc.text('Inspector Signature', margin, y); y += 14
    y = await addImage(sigData, margin, y)
  }

  return doc.output('blob')
}

export async function uploadPdf(blob, fileName) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/reports/${encodeURIComponent(fileName)}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/pdf',
    },
    body: blob,
  })
  if (!res.ok) {
    const details = await res.text()
    throw new Error(`PDF upload failed (${res.status}): ${details || res.statusText}`)
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/reports/${encodeURIComponent(fileName)}`
}

export async function updatePdfUrl(rowId, pdfUrl) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/unit_inspections?id=eq.${rowId}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pdf_url: pdfUrl }),
  })
  if (!res.ok) throw new Error(`PDF URL update failed (${res.status})`)
}