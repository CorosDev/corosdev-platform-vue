/**
 * Single source of truth for the lead-form field styling shared by
 * ContactSection.vue and FloatingCtaDrawer.vue — the two forms are the same
 * design system and used to drift apart every time one of them was touched
 * by hand.
 *
 * These are plain string constants rather than a CSS `@utility` (main.css)
 * on purpose: Tailwind's automatic content detection scans this file's raw
 * text, so each literal below is picked up as a normal class candidate and
 * the utilities land in the built stylesheet exactly as if they'd been typed
 * into the template. Keep them as complete, unbroken literals — Tailwind
 * cannot see class names assembled at runtime from fragments.
 */

/** Permanent, always-visible field label (no placeholder-as-label anti-pattern). */
export const FORM_LABEL_CLASS = 'block mb-2 text-xs font-semibold uppercase tracking-widest text-white/70'

/** Muted "(optional)" suffix rendered next to a non-required field's label. */
export const FORM_LABEL_HINT_CLASS = 'font-normal text-white/50'

/**
 * Everything except the border colour, which is applied separately so an
 * invalid field can swap it without two competing `border-*` utilities
 * fighting over CSS source order (which class attribute order does NOT win).
 */
export const FORM_FIELD_CLASS =
  'w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/50 transition-all duration-200 focus:bg-white/10 focus:outline-none focus:ring-1'

/** Resting + focus border for a valid field. */
export const FORM_FIELD_IDLE_CLASS = 'border-white/15 focus:border-neon-500 focus:ring-neon-500'

/** Resting + focus border for a field currently failing validation. */
export const FORM_FIELD_ERROR_CLASS = 'border-red-500/60 focus:border-red-400 focus:ring-red-400'

/**
 * Selects additionally drop the native arrow (replaced by an inline SVG
 * chevron in the template) and reserve room for it on the right.
 */
export const FORM_SELECT_EXTRA_CLASS = 'appearance-none pr-10'

/** The inline chevron sitting on top of a select; never a click target itself. */
export const FORM_SELECT_CHEVRON_CLASS =
  'pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50'

/**
 * `<option>` needs its own explicit dark colours: the native dropdown popup
 * is painted by the OS/browser and does NOT inherit the select's own
 * translucent background, so without this it renders as dark-on-white (or
 * white-on-white) on several platforms.
 */
export const FORM_OPTION_CLASS = 'bg-slate-900 text-white'

/** Inline validation message under a field. */
export const FORM_ERROR_TEXT_CLASS = 'mt-2 text-xs text-red-400'

/** Primary submit button, including its disabled/loading treatment. */
/**
 * Radio al núcleo de 8px del sistema y sin `drop-shadow-glow`: el resplandor
 * sobre un botón sólido es ornamento de plantilla, no jerarquía. El contraste
 * ya lo da el relleno cobalto sobre el fondo oscuro.
 */
export const FORM_SUBMIT_CLASS =
  'flex w-full items-center justify-center gap-2 rounded-lg bg-neon-500 px-5 py-4 text-sm font-bold uppercase tracking-wider text-brand-900 transition-all duration-200 hover:bg-neon-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900 disabled:cursor-not-allowed disabled:opacity-60'
