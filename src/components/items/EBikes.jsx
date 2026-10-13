import { ItemCard, FullWidth, FieldLabel, SegmentedControl, NumberInput, PhotoUpload, TextInput } from '../ui'

export default function EBikes({ data, onChange }) {
  const isCompleted = Boolean(data.present)

  return (
    <ItemCard
      num={9}
      title="E-Bikes"
      pink
      hint="Check for e-bikes, e-scooters, or similar lithium-ion battery devices stored in suite or on balcony"
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-2">
        <FieldLabel>E-Bikes Present?</FieldLabel>
        <SegmentedControl
          name="ebikes_present"
          value={data.present}
          onChange={(v) => onChange('present', v)}
          options={[
            {
              value: 'Yes',
              label: '⚠️ Yes (Found)',
              activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold',
            },
            {
              value: 'No',
              label: '✓ No',
              activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold',
            },
          ]}
        />
      </div>

      {data.present === 'Yes' && (
        <>
          <FullWidth>
            <NumberInput
              id="ebikes_count"
              label="Number of E-Bikes Found"
              value={data.count || ''}
              onChange={(v) => onChange('count', v)}
              min={1}
              max={20}
              step={1}
              placeholder="Enter count"
            />
          </FullWidth>

          <FullWidth>
            <TextInput
              id="ebikes_location"
              label="Location / Description"
              value={data.location || ''}
              onChange={(v) => onChange('location', v)}
              placeholder="e.g., Balcony, storage closet, near entrance — describe position and type"
            />
          </FullWidth>

          <FullWidth>
            <PhotoUpload
              photos={data.photos || []}
              onAdd={(src) => onChange('photos', [...(data.photos || []), src])}
              onRemove={(idx) => onChange('photos', (data.photos || []).filter((_, i) => i !== idx))}
            />
          </FullWidth>
        </>
      )}
    </ItemCard>
  )
}