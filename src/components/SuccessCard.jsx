export default function SuccessCard({ data, onNewInspection }) {
  const row = (label, value) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">{label}</span>
      <span className="text-sm font-bold text-slate-900 dark:text-white text-right">{value || '—'}</span>
    </div>
  )

  const statusBadge = (val) => {
    if (!val) return <span className="text-slate-400 text-xs font-semibold">Not checked</span>
    const isOk = ['No', 'OK', 'Safe', 'Allowed', 'Functioning'].includes(val)
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
          isOk
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isOk ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        {val}
      </span>
    )
  }

  const formattedTime = data.submittedAt
    ? new Date(data.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
      
      {/* Top Banner with celebratory gradient */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-navy-700 p-8 text-white text-center relative overflow-hidden">
        {/* Subtle mesh background circles */}
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/20 text-3xl font-extrabold">
            ✓
          </div>
          <div>
            <span className="inline-block text-[0.68rem] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full mb-1">
              Official Record Recorded
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Inspection Submitted
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto font-medium">
              The unit inspection data and inspector affirmation have been saved to local memory.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        
        {/* Audit Meta Grid */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200/70 dark:border-slate-700/60">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 uppercase tracking-wider block font-bold text-[0.68rem]">Building</span>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{data.building}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider block font-bold text-[0.68rem]">Suite Number</span>
              <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">Suite #{data.suiteNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider block font-bold text-[0.68rem]">Inspection Date</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{data.inspectionDate}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider block font-bold text-[0.68rem]">Inspector</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{data.inspectorName}</span>
            </div>
          </div>
        </div>

        {/* Verification Summary List */}
        <div>
          <h4 className="text-[0.72rem] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
            <span>Verified In-Suite Scope</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">6 of 6 Checked</span>
          </h4>

          <div className="space-y-2.5 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex justify-between items-center pt-2 first:pt-0">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">01. Partition Walls</span>
              {statusBadge(data.partitionWalls?.status)}
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">02. Washer</span>
              {statusBadge(data.washer?.present)}
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">03. Dryer</span>
              {statusBadge(data.dryer?.present)}
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">04. Air Conditioner(s)</span>
              <div className="flex items-center gap-2">
                {statusBadge(data.ac?.safety)}
                {data.ac?.qty && (
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    Qty: {data.ac.qty}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">05. Kitchen Taps</span>
              {statusBadge(data.kitchenTaps?.status)}
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">06. Pets</span>
              {statusBadge(data.pets?.allowed || data.pets?.present)}
            </div>
          </div>
        </div>

        {/* Signature Preview */}
        {data.signatureData && (
          <div className="space-y-1.5">
            <span className="text-[0.72rem] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Inspector Sign-Off
            </span>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <img
                src={data.signatureData}
                alt="Inspector Signature"
                className="max-h-14 object-contain filter dark:invert"
              />
              <div className="text-right text-[0.68rem] text-slate-400">
                <p className="font-bold text-slate-700 dark:text-slate-300">{data.inspectorName}</p>
                <p>{data.inspectorDate} {formattedTime && `· ${formattedTime}`}</p>
              </div>
            </div>
          </div>
        )}

        {/* Start New Inspection */}
        <button
          type="button"
          onClick={onNewInspection}
          className="w-full py-4 bg-gradient-to-r from-navy-700 via-navy-600 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:from-navy-800 hover:to-blue-700 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-base cursor-pointer"
        >
          <span>＋</span>
          <span>Start New Inspection</span>
        </button>

      </div>
    </div>
  )
}
