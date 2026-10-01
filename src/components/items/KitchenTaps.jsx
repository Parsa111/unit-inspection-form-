import { ItemCard, FullWidth, FieldLabel, SegmentedControl, TextInput } from '../ui'

export default function KitchenTaps({ data, onChange }) {
  const isCompleted = Boolean(data.status)

  return (
    <ItemCard
      num={5}
      title="Kitchen Taps"
      handwritten={'Handwritten note: "pipes" / "plastic pipes kitchen. suspected leaking."'}
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-2">
        <FieldLabel>Condition Assessment</FieldLabel>
        <SegmentedControl
          name="kitchenTaps_status"
          value={data.status}
          onChange={(v) => onChange('status', v)}
          options={[
            {
              value: 'OK',
              label: '✓ OK (Good)',
              activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold',
            },
            {
              value: 'Leaking',
              label: '⚠️ Leaking / Defective',
              activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold',
            },
          ]}
        />
      </div>

      {data.status === 'Leaking' && (
        <>
          <FullWidth>
            <TextInput
              id="kt_pipes"
              label="Under-Sink Pipes & P-Trap Note"
              value={data.pipesNote}
              onChange={(v) => onChange('pipesNote', v)}
              placeholder="plastic pipes kitchen. suspected leaking..."
            />
          </FullWidth>

          <FullWidth>
            <TextInput
              id="kt_other"
              label="Other Observations"
              value={data.other}
              onChange={(v) => onChange('other', v)}
              placeholder="Water pressure, shut-off valve condition, fixture play, aerator..."
            />
          </FullWidth>
        </>
      )}
    </ItemCard>
  )
}
