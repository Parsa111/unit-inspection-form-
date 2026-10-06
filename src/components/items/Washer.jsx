import { ItemCard, FullWidth, FieldLabel, SegmentedControl, CheckPill, TextInput, PhotoUpload } from '../ui'

export default function Washer({ data, onChange }) {
  const isCompleted = Boolean(data.present)

  return (
    <ItemCard
      num={2}
      title="Washer"
      pink
      handwritten="Handwritten note: (Pipe / supplies line) Disposer Portable?"
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-2">
        <FieldLabel>Washer Present in Suite?</FieldLabel>
        <SegmentedControl
          name="washer_present"
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
            <FieldLabel>Connection Type</FieldLabel>
            <div className="flex flex-wrap gap-2.5">
              <CheckPill
                label="Portable (circled)"
                checked={data.portable}
                onChange={(v) => onChange('portable', v)}
              />
              <CheckPill
                label="Direct (circled)"
                checked={data.direct}
                onChange={(v) => onChange('direct', v)}
              />
              <CheckPill
                label="Kitchen"
                checked={data.kitchen}
                onChange={(v) => onChange('kitchen', v)}
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <FieldLabel>Safety Inspection</FieldLabel>
            <div className="flex flex-wrap gap-2.5">
              <CheckPill
                label="Check valves"
                checked={data.checkValves}
                onChange={(v) => onChange('checkValves', v)}
              />
            </div>
          </div>

          <FullWidth>
            <TextInput
              id="washer_notes"
              label="Pipe / Supplies Line & Disposer Note"
              value={data.notes}
              onChange={(v) => onChange('notes', v)}
              placeholder="Check braided steel hoses, shut-off valves, disposer status..."
            />
          </FullWidth>

          <FullWidth>
            <TextInput
              id="washer_other"
              label="Other Observations"
              value={data.other}
              onChange={(v) => onChange('other', v)}
              placeholder="Drain hose routing, spill tray, floor condition..."
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
