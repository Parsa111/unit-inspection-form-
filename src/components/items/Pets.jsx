import { ItemCard, FullWidth, FieldLabel, SegmentedControl, NumberInput, PhotoUpload } from '../ui'

export default function Pets({ data, onChange }) {
  const count = Number(data.petCount) || 0
  const prohibited = count > 2
  const isCompleted = Boolean(data.present || data.petCount)

  return (
    <ItemCard
      num={8}
      title="Pets"
      pink
      hint="Condo declaration pet restriction and registration compliance"
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-2">
        <FieldLabel>Pets Present in Suite?</FieldLabel>
        <SegmentedControl
          name="pets_present"
          value={data.present}
          onChange={(v) => onChange('present', v)}
          options={[
            {
              value: 'Yes',
              label: 'Yes',
              activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold',
            },
            {
              value: 'No',
              label: 'No',
              activeClass: 'bg-slate-700 dark:bg-slate-600 text-white shadow-md font-bold',
            },
          ]}
        />
      </div>

      {data.present === 'Yes' && (
        <>
          <div className="sm:col-span-2">
            <NumberInput
              id="pets_count"
              label="Number of Pets"
              value={data.petCount || ''}
              min={0}
              max={20}
              step={1}
              onChange={(v) => onChange('petCount', v)}
              placeholder="0"
            />
          </div>

          {prohibited && (
            <div className="sm:col-span-2">
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                Prohibited — more than 2 pets are not allowed
              </p>
            </div>
          )}

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
