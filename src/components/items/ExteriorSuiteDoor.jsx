import { ItemCard, FullWidth, FieldLabel, SegmentedControl, TextInput, PhotoUpload, CheckPill } from '../ui'

export default function ExteriorSuiteDoor({ data, onChange }) {
  const isCompleted = Boolean(data.altered)
  const showDetails = data.altered === 'Yes'

  return (
    <ItemCard
      num={0}
      title="Exterior Suite Door"
      pink
      hint="This inspection can be done any time — no suite entry permission required"
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-2">
        <FieldLabel>Altered?</FieldLabel>
        <SegmentedControl
          name="exteriorSuiteDoor_altered"
          value={data.altered}
          onChange={(v) => onChange('altered', v)}
          options={[
            {
              value: 'Yes',
              label: '⚠️ Yes (Altered)',
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

      {showDetails && (
        <>
          <FullWidth>
            <FieldLabel>Alteration Types (check all that apply)</FieldLabel>
            <div className="flex flex-wrap gap-2">
              <CheckPill
                label="Stickers"
                checked={data.alterations?.stickers || false}
                onChange={(v) => onChange('alterations', { ...data.alterations, stickers: v })}
              />
              <CheckPill
                label="Cameras"
                checked={data.alterations?.cameras || false}
                onChange={(v) => onChange('alterations', { ...data.alterations, cameras: v })}
              />
              <CheckPill
                label="Locks"
                checked={data.alterations?.locks || false}
                onChange={(v) => onChange('alterations', { ...data.alterations, locks: v })}
              />
            </div>
          </FullWidth>

          <FullWidth>
            <TextInput
              id="esd_comments"
              label="Comments"
              value={data.comments}
              onChange={(v) => onChange('comments', v)}
              placeholder="Describe alterations, damage, or observations..."
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