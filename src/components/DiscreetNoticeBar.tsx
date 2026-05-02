/** Short discretion copy shown under the status bar / notch on supported devices. */
export function DiscreetNoticeBar() {
  return (
    <p
      className="border-b border-slate-200 bg-white px-4 pb-3 pt-[max(1rem,calc(env(safe-area-inset-top)+0.75rem))] text-center text-sm leading-snug text-slate-700 sm:px-6 sm:text-[15px]"
      role="note"
    >
      Please be discreet with everyone you meet here — respect their privacy and boundaries the way you
      expect others to respect yours.
    </p>
  )
}
