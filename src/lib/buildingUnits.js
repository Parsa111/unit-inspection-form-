const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://oeretbscjmphptlytbhw.supabase.co'

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmV0YnNjam1waHB0bHl0Ymh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNTU2MDksImV4cCI6MjEwNjczMTYwOX0.xozfH5GPqsSZtMSQQqKivtm0RFXkT9zmrOCXZzlXuuM'

const UNITS_ENDPOINT = `${SUPABASE_URL}/rest/v1/Building_unit?select=Unit&order=Unit.asc`
const PAGE_SIZE = 1000

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  Accept: 'application/json',
}

let cache = null

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

async function fetchAllUnits() {
  const collected = []
  let offset = 0

  // Supabase caps REST responses at 1000 rows, so page until the table is exhausted
  for (;;) {
    const url = `${UNITS_ENDPOINT}&limit=${PAGE_SIZE}&offset=${offset}`
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`Failed to load units (${res.status})`)

    const rows = await res.json()
    if (!Array.isArray(rows) || rows.length === 0) break

    collected.push(...rows)
    if (rows.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return collected
}

export async function fetchBuildingUnits() {
  if (cache) return cache

  cache = (async () => {
    const rows = await fetchAllUnits()

    return [...new Set(rows.map((r) => (r?.Unit ?? '').toString().trim()).filter(Boolean))].sort(
      naturalCompare
    )
  })()

  try {
    return await cache
  } catch (err) {
    cache = null
    throw err
  }
}

export function clearUnitCache() {
  cache = null
}

// Unit codes are <building>-<unit>, e.g. 701-1001 (building 701) and 702-0205 (building 702)
export function parseUnitCode(code) {
  const raw = (code ?? '').toString().trim()
  const dash = raw.indexOf('-')
  if (dash > 0 && dash < raw.length - 1) {
    const building = raw.slice(0, dash)
    const unit = raw.slice(dash + 1)
    return { building, unit, floor: /^\d{3,4}$/.test(unit) ? unit.slice(0, unit.length - 2) : '' }
  }
  return { building: '', unit: raw, floor: '' }
}

export function formatUnitCode(code) {
  const { building, unit } = parseUnitCode(code)
  return building ? `Bldg ${building} \u00b7 Unit ${unit}` : `Unit ${unit}`
}

export function groupUnitsByBuilding(units) {
  const buildings = new Map()
  const other = []

  for (const code of units) {
    const { building, floor } = parseUnitCode(code)
    if (!building) {
      other.push(code)
      continue
    }
    if (!buildings.has(building)) buildings.set(building, new Map())
    const floors = buildings.get(building)
    const floorLabel = floor ? `Floor ${floor}` : 'Other'
    if (!floors.has(floorLabel)) floors.set(floorLabel, [])
    floors.get(floorLabel).push(code)
  }

  const groups = [...buildings.entries()]
    .sort((a, b) => naturalCompare(a[0], b[0]))
    .map(([building, floors]) => ({
      label: `Building ${building}`,
      floors: [...floors.entries()]
        .sort((a, b) => naturalCompare(a[0], b[0]))
        .map(([label, units]) => ({ label, units })),
    }))

  if (other.length) groups.push({ label: 'Other', floors: [{ label: 'Other', units: other }] })
  return groups
}