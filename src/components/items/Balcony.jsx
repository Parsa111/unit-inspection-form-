import { ItemCard, FullWidth, FieldLabel, SegmentedControl, TextInput, PhotoUpload } from '../ui'

export default function Balcony({ data, onChange }) {
  const isCompleted = Boolean(data.damage)

  return (
    <ItemCard
      num={7}
      title="Balcony"
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-2">
        <FieldLabel>Damage</FieldLabel>
        <SegmentedControl
          name="balcony_damage"
          value={data.damage}
          onChange={(v) => onChange('damage', v)}
          options={[
            {
              value: 'Yes',
              label: '⚠️ Yes (Damage)',
              activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold',
            },
            {
              value: 'No',
              label: '✓ No Damage',
              activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold',
            },
          ]}
        />
      </div>

      {data.damage === 'Yes' && (
        <>
          <FullWidth>
            <TextInput
              id="balcony_comment"
              label="Comments"
              value={data.comment}
              onChange={(v) => onChange('comment', v)}
              placeholder="Describe the balcony damage..."
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
