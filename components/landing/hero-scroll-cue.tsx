'use client'

/**
 * Replaces the old animation-heavy "Scroll" indicator. It's now a real
 * <button> that smoothly scrolls to the next section, with no continuous
 * animations (the previous version ran `animate-ping` and `animate-bounce`
 * forever, hurting battery on mobile and triggering motion-sensitive users).
 */
export function HeroScrollCue() {
  function handleClick() {
    const hero = document.getElementById('hero')
    const next = hero?.nextElementSibling as HTMLElement | null
    if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className="pb-10 flex flex-col items-center gap-2 group cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
      aria-label="Scroll to next section"
    >
      <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/50 group-hover:text-primary transition-colors duration-300">
        Scroll
      </span>
      <span className="w-10 h-10 rounded-full border-2 border-primary/25 flex items-center justify-center group-hover:border-primary/60 group-hover:bg-primary/5 transition-all">
        <svg className="w-5 h-5 text-primary motion-safe:group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </button>
  )
}
