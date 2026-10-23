import { ItemCard, FullWidth, FieldLabel, SegmentedControl, TextInput, PhotoUpload } from '../ui'

export default function Washroom({ data, onChange }) {
  const isCompleted = Boolean(data.toiletCondition || data.tapsLeaking || data.vanityLeaking || data.fanPresent)

  return (
    <ItemCard
      num={6}
      title="Washroom"
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-1">
        <FieldLabel>Toilet Condition</FieldLabel>
        <SegmentedControl
          name="washroom_toilet"
          value={data.toiletCondition}
          onChange={(v) => onChange('toiletCondition', v)}
          options={[
            {
              value: 'Good',
              label: '✓ Good',
              activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold',
            },
            {
              value: 'Bad',
              label: '⚠️ Bad',
              activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold',
            },
          ]}
        />
      </div>

      <div className="sm:col-span-1">
        <FieldLabel>Taps</FieldLabel>
        <SegmentedControl
          name="washroom_taps"
          value={data.tapsLeaking}
          onChange={(v) => onChange('tapsLeaking', v)}
          options={[
            {
              value: 'Leaking',
              label: '⚠️ Leaking',
              activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold',
            },
            {
              value: 'Not leaking',
              label: '✓ Not leaking',
              activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold',
            },
          ]}
        />
      </div>

      <div className="sm:col-span-1">
        <FieldLabel>Vanity</FieldLabel>
        <SegmentedControl
          name="washroom_vanity"
          value={data.vanityLeaking}
          onChange={(v) => onChange('vanityLeaking', v)}
          options={[
            {
              value: 'Leaking',
              label: '⚠️ Leaking',
              activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold',
            },
            {
              value: 'Not leaking',
              label: '✓ Not leaking',
              activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold',
            },
          ]}
        />
      </div>

      <div className="sm:col-span-1">
        <FieldLabel>Bathroom Fan</FieldLabel>
        <SegmentedControl
          name="washroom_fan"
          value={data.fanPresent}
          onChange={(v) => onChange('fanPresent', v)}
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

      {data.toiletCondition === 'Bad' && (
        <FullWidth>
          <TextInput
            id="washroom_toilet_comment"
            label="Toilet Condition Comment"
            value={data.toiletComment}
            onChange={(v) => onChange('toiletComment', v)}
            placeholder="Describe the toilet condition issue..."
          />
        </FullWidth>
      )}

      {data.tapsLeaking === 'Leaking' && (
        <FullWidth>
          <TextInput
            id="washroom_taps_comment"
            label="Taps Leaking Comment"
            value={data.tapsComment}
            onChange={(v) => onChange('tapsComment', v)}
            placeholder="Describe the tap leaking issue..."
          />
        </FullWidth>
      )}

      {data.vanityLeaking === 'Leaking' && (
        <FullWidth>
          <TextInput
            id="washroom_vanity_comment"
            label="Vanity Leaking Comment"
            value={data.vanityComment}
            onChange={(v) => onChange('vanityComment', v)}
            placeholder="Describe the vanity leaking issue..."
          />
        </FullWidth>
      )}

      {(data.toiletCondition === 'Bad' || data.tapsLeaking === 'Leaking' || data.vanityLeaking === 'Leaking' || data.fanPresent === 'Yes') && (
        <FullWidth>
          <PhotoUpload
            photos={data.photos || []}
            onAdd={(src) => onChange('photos', [...(data.photos || []), src])}
            onRemove={(idx) => onChange('photos', (data.photos || []).filter((_, i) => i !== idx))}
          />
        </FullWidth>
      )}
    </ItemCard>
  )
}
