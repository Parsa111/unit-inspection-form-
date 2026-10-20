import { ItemCard, FullWidth, FieldLabel, SegmentedControl, TextInput, PhotoUpload, CheckPill, SelectInput } from '../ui'

export default function ExteriorSuiteDoor({ data, onChange }) {
  const isCompleted = Boolean(data.altered)
  const showDetails = data.altered === 'Yes'

  return (
    <ItemCard
      num={0}
      title="Exterior Suite Door"
      pink
      hint="This inspection can be done any time — no suite entry permission required"
      isCompleted={isCompleted}
    >
      <div className="sm:col-span-2">
        <FieldLabel>Altered?</FieldLabel>
        <SegmentedControl
          name="exteriorSuiteDoor_altered"
          value={data.altered}
          onChange={(v) => onChange('altered', v)}
          options={[
            {
              value: 'Yes',
              label: '⚠️ Yes (Altered)',
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

      {showDetails && (
        <>
          <FullWidth>
            <FieldLabel>Alteration Types (check all that apply)</FieldLabel>
            <div className="flex flex-wrap gap-2">
              <CheckPill
                label="Camera"
                checked={data.alterations?.camera || false}
                onChange={(v) => onChange('alterations', { ...data.alterations, camera: v })}
              />
              <CheckPill
                label="Locks"
                checked={data.alterations?.locks || false}
                onChange={(v) => onChange('alterations', { ...data.alterations, locks: v })}
              />
              <CheckPill
                label="Decorations"
                checked={data.alterations?.decorations || false}
                onChange={(v) => onChange('alterations', { ...data.alterations, decorations: v })}
              />
              <CheckPill
                label="Door bell"
                checked={data.alterations?.doorBell || false}
                onChange={(v) => onChange('alterations', { ...data.alterations, doorBell: v })}
              />
              <CheckPill
                label="Painted"
                checked={data.alterations?.painted || false}
                onChange={(v) => onChange('alterations', { ...data.alterations, painted: v })}
              />
              <CheckPill
                label="Damaged"
                checked={data.alterations?.damaged || false}
                onChange={(v) => onChange('alterations', { ...data.alterations, damaged: v })}
              />
            </div>
          </FullWidth>

          {(data.alterations?.locks || data.alterations?.decorations || data.alterations?.doorBell || data.alterations?.painted || data.alterations?.damaged || data.alterations?.camera) && (
            <FullWidth>
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {data.alterations?.locks && (
                  <div className="space-y-4">
                    <SelectInput
                      id="esd_lock_type"
                      label="Lock Type"
                      value={data.lockType || ''}
                      onChange={(v) => onChange('lockType', v)}
                      options={[
                        { value: 'doorCloser', label: 'Door Closer' },
                        { value: 'mainSuiteDoorLock', label: 'Main Suite Door Lock' },
                        { value: 'leverSet', label: 'Lever Set' },
                      ]}
                      placeholder="Select lock type"
                    />
                    <SelectInput
                      id="esd_additional_lock"
                      label="Additional Lock"
                      value={data.additionalLock || ''}
                      onChange={(v) => onChange('additionalLock', v)}
                      options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' },
                      ]}
                      placeholder="Select"
                    />
                  </div>
                )}
              </div>
            </FullWidth>
          )}

          <FullWidth>
            <TextInput
              id="esd_comments"
              label="Comments"
              value={data.comments}
              onChange={(v) => onChange('comments', v)}
              placeholder="Describe alterations, damage, or observations..."
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