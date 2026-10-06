import { ItemCard, FullWidth, FieldLabel, SegmentedControl, CheckPill, TextInput, PhotoUpload } from '../ui'

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

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="ac_qty"
              className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Quantity (Units)
            </label>
            <input
              id="ac_qty"
              type="number"
              min="0"
              max="20"
              value={data.qty}
              onChange={(e) => onChange('qty', e.target.value)}
              placeholder="e.g. 4"
              className="min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all w-32"
            />
          </div>

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
