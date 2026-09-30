import { ItemCard, FullWidth, FieldLabel, SegmentedControl, CheckPill, TextInput } from '../ui'

export default function Dryer({ data, onChange }) {
  const isCompleted = Boolean(data.present)

  return (
    <ItemCard
      num={3}
      title="Dryer"
      hint="Verify venting, lint discharge ducting, electrical hookup & location"
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-2">
        <FieldLabel>Dryer Present in Suite?</FieldLabel>
        <SegmentedControl
          name="dryer_present"
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

      <div>
        <FieldLabel>Location</FieldLabel>
        <div className="flex flex-wrap gap-2.5">
          <CheckPill
            label="Kitchen"
            checked={data.kitchen}
            onChange={(v) => onChange('kitchen', v)}
          />
        </div>
      </div>

      <FullWidth>
        <TextInput
          id="dryer_other"
          label="Other Observations"
          value={data.other}
          onChange={(v) => onChange('other', v)}
          placeholder="Dryer vent condition, lint ducting, exterior exhaust..."
        />
      </FullWidth>
    </ItemCard>
  )
}
