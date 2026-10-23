import { ItemCard, FullWidth, FieldLabel, SegmentedControl, CheckPill, NumberInput, TextInput, PhotoUpload, TextArea } from '../ui'

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
            <FieldLabel>Smoke Alarm — Quantity</FieldLabel>
            <NumberInput
              id="smoke_alarm_qty"
              label="Quantity"
              value={data.smokeAlarmQty || 1}
              min={1}
              max={4}
              step={1}
              onChange={(v) => onChange('smokeAlarmQty', v)}
              placeholder="1"
            />
          </div>

          <div className="sm:col-span-2">
            <FieldLabel>Smoke Alarm Status</FieldLabel>
            <div className="flex flex-wrap gap-2.5">
              {Array.from({ length: data.smokeAlarmQty || 1 }, (_, i) => (
                <CheckPill
                  key={i}
                  label={`Alarm ${i + 1}`}
                  checked={(data.smokeAlarmWorking || []).includes(i)}
                  onChange={(checked) => {
                    const next = checked
                      ? [...(data.smokeAlarmWorking || []), i]
                      : (data.smokeAlarmWorking || []).filter((n) => n !== i)
                    onChange('smokeAlarmWorking', next)
                  }}
                />
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <FieldLabel>Working Status</FieldLabel>
            <div className="flex flex-wrap gap-2.5">
              {Array.from({ length: data.smokeAlarmQty || 1 }, (_, i) => {
                const isWorking = (data.smokeAlarmWorking || []).includes(i)
                return (
                  <SegmentedControl
                    key={i}
                    name={`smoke_alarm_status_${i + 1}`}
                    value={isWorking ? 'Working' : 'Not Working'}
                    onChange={(v) => {
                      const next = v === 'Working'
                        ? [...(data.smokeAlarmWorking || []), i]
                        : (data.smokeAlarmWorking || []).filter((n) => n !== i)
                      onChange('smokeAlarmWorking', next)
                    }}
                    options={[
                      {
                        value: 'Working',
                        label: 'Working',
                        activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold',
                      },
                      {
                        value: 'Not Working',
                        label: 'Not Working',
                        activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold',
                      },
                    ]}
                  />
                )
              })}
            </div>
          </div>

          <div className="sm:col-span-2">
            <TextArea
              id="smoke_alarm_comments"
              label="Comments"
              value={data.smokeAlarmComments || ''}
              onChange={(v) => onChange('smokeAlarmComments', v)}
              placeholder="Notes about smoke alarm(s)..."
              rows={3}
            />
          </div>

          <FullWidth>
            <PhotoUpload
              photos={data.photos || []}
              onAdd={(src) => onChange('photos', [...(data.photos || []), src])}
              onRemove={(idx) => onChange('photos', (data.photos || []).filter((_, i) => i !== idx))}
            />
          </FullWidth>
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