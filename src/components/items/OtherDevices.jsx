import { ItemCard, FullWidth, FieldLabel, SegmentedControl, TextInput, PhotoUpload } from '../ui'

export default function OtherDevices({ data, onChange }) {
  const isCompleted = Boolean(data.speaker || data.smokeAlarm || data.dts)

  return (
    <ItemCard
      num={10}
      title="Other Devices"
      pink
      hint="Speaker, smoke alarm, and DTS checks"
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-2">
        <FieldLabel>Speaker</FieldLabel>
        <SegmentedControl
          name="speaker"
          value={data.speaker}
          onChange={(v) => onChange('speaker', v)}
          options={[
            {
              value: 'OK',
              label: 'OK',
              activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold',
            },
            {
              value: 'Aborted',
              label: 'Aborted',
              activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold',
            },
          ]}
        />
      </div>

      {data.speaker === 'Aborted' && (
        <FullWidth>
          <TextInput
            id="speaker_note"
            label="Speaker Note"
            value={data.speakerNote || ''}
            onChange={(v) => onChange('speakerNote', v)}
            placeholder="Describe the speaker issue..."
          />
        </FullWidth>
      )}

      <div className="sm:col-span-2">
        <FieldLabel>Smoke Alarm</FieldLabel>
        <SegmentedControl
          name="smoke_alarm"
          value={data.smokeAlarm}
          onChange={(v) => onChange('smokeAlarm', v)}
          options={[
            {
              value: 'In unit',
              label: 'In unit',
              activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold',
            },
            {
              value: 'Not in unit',
              label: 'Not in unit',
              activeClass: 'bg-slate-700 dark:bg-slate-600 text-white shadow-md font-bold',
            },
          ]}
        />
      </div>

      {data.smokeAlarm === 'In unit' && (
        <>
          <div className="sm:col-span-2">
            <FieldLabel>Smoke Alarm Status</FieldLabel>
            <SegmentedControl
              name="smoke_status"
              value={data.smokeStatus}
              onChange={(v) => onChange('smokeStatus', v)}
              options={[
                {
                  value: 'Working',
                  label: 'Working',
                  activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold',
                },
                {
                  value: 'Activated (unclear)',
                  label: 'Activated (unclear)',
                  activeClass: 'bg-amber-600 text-white shadow-md shadow-amber-600/20 font-bold',
                },
              ]}
            />
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <FieldLabel>DTS</FieldLabel>
        <SegmentedControl
          name="dts"
          value={data.dts}
          onChange={(v) => onChange('dts', v)}
          options={[
            {
              value: 'In unit',
              label: 'In unit',
              activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold',
            },
            {
              value: 'Not in unit',
              label: 'Not in unit',
              activeClass: 'bg-slate-700 dark:bg-slate-600 text-white shadow-md font-bold',
            },
          ]}
        />
      </div>

      <FullWidth>
        <PhotoUpload
          photos={data.photos || []}
          onAdd={(src) => onChange('photos', [...(data.photos || []), src])}
          onRemove={(idx) => onChange('photos', (data.photos || []).filter((_, i) => i !== idx))}
        />
      </FullWidth>
    </ItemCard>
  )
}
