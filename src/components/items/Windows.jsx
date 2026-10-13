import { ItemCard, FullWidth, FieldLabel, SegmentedControl, TextInput, PhotoUpload } from '../ui'

export default function Windows({ data, onChange }) {
  const isCompleted = Boolean(data.damage)

  return (
    <ItemCard
      num={7}
      title="Windows"
      hint="Check for damaged, cracked, fogged, or non-operational windows"
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-2">
        <FieldLabel>Damage?</FieldLabel>
        <SegmentedControl
          name="windows_damage"
          value={data.damage}
          onChange={(v) => onChange('damage', v)}
          options={[
            {
              value: 'Yes',
              label: '⚠️ Yes (Damaged)',
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
              id="windows_comments"
              label="Comments"
              value={data.comments}
              onChange={(v) => onChange('comments', v)}
              placeholder="Describe damage: cracked glass, fogged panes, broken seals, frame rot, won't open/close..."
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