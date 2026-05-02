const MOCK_USER = {
  displayName: 'You',
  handle: 'member',
  memberSince: 'May 2026',
  avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
}

function Row({
  label,
  hint,
  disabled,
}: {
  label: string
  hint: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div>
        <p className="font-display text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
      <span className="text-slate-400" aria-hidden>
        →
      </span>
    </button>
  )
}

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-600">Your account — demo placeholders until sign-in exists.</p>
      </header>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-6 sm:px-6">
        <section className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <img
            src={MOCK_USER.avatarUrl}
            alt=""
            className="size-24 rounded-full object-cover ring-4 ring-slate-100"
          />
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">{MOCK_USER.displayName}</h2>
          <p className="text-sm text-slate-600">@{MOCK_USER.handle}</p>
          <p className="mt-2 text-xs text-slate-500">Member since {MOCK_USER.memberSince}</p>
        </section>

        <section className="space-y-2">
          <Row label="Notifications" hint="Push and email (coming soon)" disabled />
          <Row label="Privacy" hint="Who can message you" disabled />
          <Row label="Help & safety" hint="Guidelines and support" disabled />
        </section>

        <p className="text-center text-xs text-slate-500">
          Sign out and account deletion will appear when authentication is wired up.
        </p>
      </div>
    </div>
  )
}
