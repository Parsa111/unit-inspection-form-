import { ItemCard, FullWidth, FieldLabel, SegmentedControl, TextInput } from '../ui'

export default function PartitionWalls({ data, onChange }) {
  const isCompleted = Boolean(data.status)

  return (
    <ItemCard
      num={1}
      title="Partition Walls"
      pink
      hint="Check for unauthorized temporary or permanent wall divisions"
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-2">
        <FieldLabel>Present?</FieldLabel>
        <SegmentedControl
          name="partitionWalls_status"
          value={data.status}
          onChange={(v) => onChange('status', v)}
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

      <FullWidth>
        <TextInput
          id="pw_details"
          label="Details & Locations"
          value={data.details}
          onChange={(v) => onChange('details', v)}
          placeholder="Specify partition location, drywall, folding screen, or framing..."
        />
      </FullWidth>

      <FullWidth>
        <TextInput
          id="pw_other"
          label="Other Observations"
          value={data.other}
          onChange={(v) => onChange('other', v)}
          placeholder="Additional comments or findings..."
        />
      </FullWidth>
    </ItemCard>
  )
}
