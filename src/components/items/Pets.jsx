import { ItemCard, FullWidth, FieldLabel, SegmentedControl, TextInput } from '../ui'

export default function Pets({ data, onChange }) {
  const isCompleted = Boolean(data.present || data.allowed)

  return (
    <ItemCard
      num={6}
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

      <div className="sm:col-span-2">
        <FieldLabel>Declaration Compliance</FieldLabel>
        <SegmentedControl
          name="pets_allowed"
          value={data.allowed}
          onChange={(v) => onChange('allowed', v)}
          options={[
            {
              value: 'Allowed',
              label: '✓ Allowed (Compliant)',
              activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold',
            },
            {
              value: 'Prohibited',
              label: '⚠️ Prohibited / Unauthorized',
              activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold',
            },
          ]}
        />
      </div>

      <FullWidth>
        <TextInput
          id="pets_details"
          label="Details & Pet Description"
          value={data.details}
          onChange={(v) => onChange('details', v)}
          placeholder="Breed, size, number of animals, weight, registration badge..."
        />
      </FullWidth>

      <FullWidth>
        <TextInput
          id="pets_other"
          label="Other Observations"
          value={data.other}
          onChange={(v) => onChange('other', v)}
          placeholder="Noise, odors, suite damage, common element impact..."
        />
      </FullWidth>
    </ItemCard>
  )
}
