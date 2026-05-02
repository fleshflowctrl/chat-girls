export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-10 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <li>
              <a href="#" className="text-slate-300 underline-offset-4 hover:text-white hover:underline">
                Terms
              </a>
            </li>
            <li>
              <a href="#" className="text-slate-300 underline-offset-4 hover:text-white hover:underline">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" className="text-slate-300 underline-offset-4 hover:text-white hover:underline">
                18+ Notice
              </a>
            </li>
          </ul>
        </nav>
        <p className="max-w-md text-xs leading-relaxed text-slate-500 sm:text-right">
          Chat and entertainment only. No real meetings or escort services are offered.
        </p>
      </div>
      <p className="mx-auto mt-8 max-w-7xl text-center text-[11px] text-slate-600">
        © {new Date().getFullYear()} Velvet — demo landing page.
      </p>
    </footer>
  )
}
