const ITEMS = [
  {
    title: 'Always available',
    body: 'Replies land in seconds — late nights, lunch breaks, whenever the mood hits.',
    icon: (
      <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: 'Remembers your vibe',
    body: 'Ongoing threads feel personal — playful, romantic, or bold, tuned to how you like to chat.',
    icon: (
      <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    title: 'Private fantasy chats',
    body: 'A discreet space for imagination — flirty energy that stays between you and the chat.',
    icon: (
      <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
] as const

export function Benefits() {
  return (
    <section className="border-t border-stone-200 bg-white px-4 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-center text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          Why guys keep coming back
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-stone-500 sm:text-base">
          Built for adults who want chemistry without the noise of traditional apps.
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {ITEMS.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-stone-100 bg-stone-50/80 p-6 shadow-sm ring-1 ring-stone-100"
            >
              <div className="mb-4 inline-flex rounded-xl bg-violet-100 p-2.5 text-violet-700">
                {item.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-stone-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
