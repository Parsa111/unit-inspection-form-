import { ItemCard, FullWidth, FieldLabel, SegmentedControl, CheckPill, NumberInput, TextInput, PhotoUpload } from '../ui'

export default function AirConditioners({ data, onChange }) {
  const isCompleted = Boolean(data.present || data.safety)

  return (
    <ItemCard
      num={4}
      title="Air Conditioner(s)"
      pink
      handwritten="Handwritten note: No... 4"
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-2">
        <FieldLabel>A/C Units Present?</FieldLabel>
        <SegmentedControl
          name="ac_present"
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
          <div>
            <FieldLabel>Mounting Configuration</FieldLabel>
            <div className="flex flex-wrap gap-2.5">
              <CheckPill
                label="Fixed"
                checked={data.fixed}
                onChange={(v) => onChange('fixed', v)}
              />
              <CheckPill
                label="Portable"
                checked={data.portable}
                onChange={(v) => onChange('portable', v)}
              />
            </div>
          </div>

          {data.fixed && (
            <div className="sm:col-span-2">
              <NumberInput
                id="ac_fixed_qty"
                label="Fixed — Quantity (Units)"
                value={data.fixedQty || ''}
                min={0}
                max={20}
                step={1}
                onChange={(v) => onChange('fixedQty', v)}
                placeholder="0"
              />
            </div>
          )}

          {data.portable && (
            <div className="sm:col-span-2">
              <NumberInput
                id="ac_portable_qty"
                label="Portable — Quantity (Units)"
                value={data.portableQty || ''}
                min={0}
                max={20}
                step={1}
                onChange={(v) => onChange('portableQty', v)}
                placeholder="0"
              />
            </div>
          )}

          <div className="sm:col-span-2">
            <FieldLabel>Safety & Installation Assessment</FieldLabel>
            <SegmentedControl
              name="ac_safety"
              value={data.safety}
              onChange={(v) => onChange('safety', v)}
              options={[
                {
                  value: 'Safe',
                  label: '✓ Safe Installation',
                  activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold',
                },
                {
                  value: 'UNSAFE',
                  label: '⚠️ UNSAFE (Correction Needed)',
                  activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold',
                },
              ]}
            />
          </div>

          {data.safety === 'UNSAFE' && (
            <FullWidth>
              <TextInput
                id="ac_other"
                label="Other Observations"
                value={data.other}
                onChange={(v) => onChange('other', v)}
                placeholder="Support brackets, window seals, condensation drainage, securement..."
              />
            </FullWidth>
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
