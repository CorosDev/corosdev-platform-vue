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

/**
 * Permanent, always-visible field label (no placeholder-as-label
 * anti-pattern). `text-ink` (not `-muted`) on purpose — a form label is the
 * one piece of copy on the field a visitor MUST read to fill it correctly,
 * so it gets the full-strength token instead of the ~0.65-alpha muted one.
 */
export const FORM_LABEL_CLASS = 'block mb-2 text-xs font-semibold uppercase tracking-widest text-ink'

/** Muted "(optional)" suffix rendered next to a non-required field's label. */
export const FORM_LABEL_HINT_CLASS = 'font-normal text-ink-muted'

/**
 * Everything except the border colour, which is applied separately so an
 * invalid field can swap it without two competing `border-*` utilities
 * fighting over CSS source order (which class attribute order does NOT win).
 */
export const FORM_FIELD_CLASS =
  'w-full rounded-lg border bg-surface-strong/50 px-4 py-3 text-sm text-ink placeholder:text-ink-muted transition-all duration-200 focus:bg-surface-strong focus:outline-none focus:ring-1'

/** Resting + focus border for a valid field. */
export const FORM_FIELD_IDLE_CLASS = 'border-hairline focus:border-accent focus:ring-accent'

/** Resting + focus border for a field currently failing validation. */
export const FORM_FIELD_ERROR_CLASS = 'border-red-500/60 focus:border-red-400 focus:ring-red-400'

/**
 * Selects additionally drop the native arrow (replaced by an inline SVG
 * chevron in the template) and reserve room for it on the right.
 */
export const FORM_SELECT_EXTRA_CLASS = 'appearance-none pr-10'

/** The inline chevron sitting on top of a select; never a click target itself. */
export const FORM_SELECT_CHEVRON_CLASS =
  'pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted'

/**
 * `<option>` needs its own explicit dark colours: the native dropdown popup
 * is painted by the OS/browser and does NOT inherit the select's own
 * translucent background, so without this it renders as dark-on-white (or
 * white-on-white) on several platforms. Deliberately NOT themed (`bg-surface`
 * etc.) — this is a fixed compatibility patch for an element the page can't
 * actually restyle, not a themed panel, so it stays the same dark treatment
 * in both Light and Dark mode.
 */
export const FORM_OPTION_CLASS = 'bg-slate-900 text-white'

/** Inline validation message under a field. */
export const FORM_ERROR_TEXT_CLASS = 'mt-2 text-xs text-red-600 dark:text-red-400'

/**
 * Primary submit button, including its disabled/loading treatment.
 *
 * Radio al núcleo de 8px del sistema y sin `drop-shadow-glow`: el resplandor
 * sobre un botón sólido es ornamento de plantilla, no jerarquía. El contraste
 * ya lo da el relleno del token de acento sobre `--accent-ink`.
 *
 * `bg-accent`/`text-accent-ink`/`hover:bg-accent-strong` en vez de los
 * `neon-500`/`brand-900`/`neon-300` fijos de antes — ese trío ya era seguro
 * en ambos temas por sí solo (botón autocontenido, fondo+texto propios), así
 * que esto es consistencia con el sistema de theming, no un fix de
 * contraste. `ring-offset-surface` reemplaza el `ring-offset-brand-900`
 * fijo: ese offset rellena el hueco entre el botón y el anillo de foco con
 * el color de lo que hay detrás, que ahora es `--surface`, no siempre negro.
 */
export const FORM_SUBMIT_CLASS =
  'flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-4 text-sm font-bold uppercase tracking-wider text-accent-ink transition-all duration-200 hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60'
