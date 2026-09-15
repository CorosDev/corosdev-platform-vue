<script setup lang="ts">
/**
 * Social proof / logo cloud, justo debajo del Hero.
 *
 * Layout split en 2 columnas (referencia: patrón comercial tipo BairesDev)
 * — copy de autoridad B2B a la izquierda, logos a la derecha. El copy usa
 * los tokens semánticos del toggle Light/Dark (`text-ink` para el titular,
 * `text-accent-text` para la frase de impacto, `text-ink-muted` para el
 * subtítulo) — ver dark-light-mode-toggle-scope en memoria para el porqué
 * de esos tokens en vez de `text-white`.
 *
 * Columnas asimétricas (`lg:grid-cols-[3fr_4fr]`, no un 50/50): la tarjeta de
 * logos necesita más ancho que el copy para que Forbes Technology Council +
 * CzechInvest quepan lado a lado a un tamaño legible (ver más abajo) — pedido
 * explícito del usuario tras ver que a 50/50 sólo cabían a un tamaño
 * `small` casi diminuto. El copy pierde ancho (~500px en vez de ~584px en
 * desktop) pero el titular de 3 líneas sigue leyéndose bien a ese ancho. Esa
 * división en columnas sólo aplica desde `lg:` (1024px) — por debajo, ambas
 * columnas se apilan a ancho completo (ver la sección de responsive más
 * abajo, que depende de esto).
 *
 * La tarjeta de logos quedó retrofit a esos tokens (`bg-surface-strong/30
 * border-hairline`) en vez del tinte azul fijo de versiones anteriores.
 *
 * Assets bajo /public/logos/partners-by/ — esa carpeta se llamó primero
 * "patners by" (typo + espacio), lo que rompía las rutas vía IPX. Ver
 * logo-cloud-partners-by-migration en memoria para ese y el resto de
 * gotchas (tamaño de RENDER vs. intrínseco, `brightness-0 invert` sobre
 * fondos opacos) — todos siguen aplicando aquí.
 *
 * `lightInvert`: 3 de los 16 archivos (MiamiBusinessShow, USExpand,
 * space2business) son arte nativo blanco/casi blanco —
 * confirmado con `sharp` (brillo promedio de píxeles opacos ≥ 229/255) —
 * así que sin filtro en modo claro son casi invisibles sobre la tarjeta
 * clara. Llevan `brightness-0 grayscale` SIN `dark:` (activo en ambos
 * temas, fuerza negro sólido) más `dark:invert` (voltea a blanco sólo en
 * oscuro). El resto sí tiene color real y no lleva filtro en claro.
 *
 * `sizeTier` — "optical weight balancing": un ancho de celda IGUAL para
 * todos (probado y descartado) fuerza a un wordmark panorámico (CzechInvest,
 * 8.3:1) a verse diminuto para caber en la misma columna que un sello 1:1,
 * que de paso se ve sobredimensionado. Cada logo escala en cambio desde su
 * propia ALTURA objetivo (ancho derivado de su aspect ratio real) — cinco
 * niveles en uso hoy, ver `TIER_CONFIG` más abajo para los valores exactos:
 *   - `default`: la altura base — la mayoría de logos, wordmarks y sellos
 *     por igual, ya se ven proporcionales entre sí sin ajuste caso por caso.
 *   - `large`: ESA — trazo delgado que "pesa" menos a igual altura que sus
 *     vecinos, hallazgo de una sesión anterior.
 *   - `medium` (entre `small` y `default`): Forbes Technology Council +
 *     CzechInvest — ver más abajo el porqué de un tier dedicado.
 *   - `xlarge`: Miami Business Show + Startup Kitchen + US Expand + Google
 *     Developers, la última fila del bloque — pedido explícito de "más
 *     grandes pero proporcionales" entre sí, y un tier COMPARTIDO es lo que
 *     los deja parejos y no sólo más grandes.
 *   - `small` queda definido pero sin uso hoy — disponible si algún logo
 *     nuevo "pesa" de menos a `default`.
 *
 * Forbes Centroamérica y Truesdays se quitaron de este bloque (pedido
 * explícito): el primero quedaba redundante con Forbes Technology Council
 * ya presente, y ninguno aportaba una fuente pública propia distinta de la
 * que ya cubre `RecognitionSection.vue`. Sin ellos, todo el bloque
 * "Featured In & Ecosystem" fluye sin fila destacada ni divisoria interna.
 *
 * Forbes Technology Council + CzechInvest comparten fila (pedido explícito:
 * "que se vean parejos uno a la par del otro") en un tier propio, `medium`.
 * A `small` (el primer intento) cabían de sobra en la tarjeta original de
 * 50/50 pero se leían diminutos frente al resto del bloque — segundo pedido
 * explícito: "se ven un poquito pequeños, hazlos más grandes". Subirlos a
 * `default` sin más cambios no era viable: sus anchos combinados a esa
 * altura (aspect 5.9:1 y 8.3:1) casi duplican el ancho de la tarjeta
 * original — de ahí el reparto asimétrico de columnas de arriba.
 *
 * CADA fila del bloque vive en su propio contenedor `flex flex-wrap` (no un
 * único `flex-wrap` con las 12 tarjetas seguidas) — pedido explícito: "los
 * logos en celular que se vean similar a como se ven en desktop [...]
 * mantener [...] las posiciones de los logos". Con un solo `flex-wrap`
 * corrido, el AGRUPAMIENTO deja de ser determinista en pantallas angostas:
 * el ancho libre que deja una fila varía con el viewport, así que
 * `flex-wrap` puede jalar el primer logo de la fila siguiente hacia la de
 * arriba (o soltar uno de en medio hacia abajo) — exactamente lo que pasaba
 * antes en mobile, donde "Czech Association of AI" quedaba sola en su
 * propia línea en vez de agrupada con "Engaged Investments Conference" +
 * ESA como en desktop. Un contenedor por fila (`rowOneMeta`/`rowTwoMeta`
 * además de `rowThreeMeta`/`rowFourMeta`, que ya vivían aparte) garantiza el
 * corte de fila pase lo que pase con el ancho — dentro de una fila, sus
 * logos SÍ pueden seguir envolviendo a una segunda línea si no caben todos
 * (inevitable en un teléfono angosto: Forbes + CzechInvest combinados nunca
 * caben en ~238px de ancho útil, ver más abajo), pero nunca se mezclan con
 * los de otra fila.
 *
 * SIN huérfano de última fila: `flex-wrap` + `justify-center` centra
 * cualquier resto en vez de dejarlo pegado a la izquierda como hacía la
 * rejilla — un logo solo en su línea ya no se lee como un error de layout.
 *
 * ── Tamaño responsive (mobile vs. desktop) ──────────────────────────────
 *
 * Cada logo necesita un tamaño de RENDER distinto en mobile vs. desktop
 * (pedido explícito: "cambiar sus tamaños si tiene una pantalla más
 * chica") — pero NO se puede resolver con una clase Tailwind del tipo
 * `w-[${ancho}px] sm:w-[${anchoDesktop}px]` construida en JS a partir del
 * aspect ratio de cada logo: Tailwind genera CSS escaneando el CÓDIGO FUENTE
 * en busca de nombres de clase LITERALES, y un string armado en runtime vía
 * interpolación de plantilla nunca aparece como texto literal en ningún
 * archivo — esa clase simplemente no se genera y el logo se queda sin
 * estilo. Por esto la versión anterior de este archivo usaba una tabla fija
 * de clases Tailwind literales (`h-10 md:h-12`, etc.) y calculaba el ANCHO
 * aparte con un `:style` inline — funcionaba en desktop porque ahí sólo hay
 * un tamaño, pero en mobile el `:style` seguía forzando el ancho de
 * escritorio mientras sólo la altura se achicaba vía la clase Tailwind,
 * dejando el logo "flotando" más angosto que la caja que en realidad
 * reservaba el `flex-wrap` — la causa real de que el agrupamiento en mobile
 * no coincidiera con el de desktop.
 *
 * La solución: cada logo recibe CUATRO variables CSS inline (`--w-m`/`--h-m`
 * para mobile, `--w-d`/`--h-d` para desktop, calculadas en `withRenderSize()`
 * a partir de su aspect ratio real y `TIER_CONFIG`), y dos reglas ESTÁTICAS
 * (no generadas dinámicamente, así que Tailwind nunca entra en juego) en el
 * `<style scoped>` de abajo — una para mobile por defecto, otra bajo
 * `@media (min-width: 640px)` para desktop. El ancho SÍ cambia de breakpoint
 * a breakpoint, no sólo el alto.
 *
 * Un solo breakpoint (640px, no dos): la tarjeta sólo se divide en columnas
 * desde `lg:` (1024px) — entre 640px y 1024px ya está a ancho completo
 * (mucho más ancho que el desktop 3fr/4fr de arriba), así que los valores
 * "desktop" (pensados para el caso más angosto, la columna partida a
 * 1024px+) caben de sobra ahí también. Separar `small`/`medium` de
 * `default`/`large`/`xlarge` en dos breakpoints distintos, como hacía la
 * versión anterior, no aportaba nada real.
 *
 * Los valores `mobile` de `TIER_CONFIG` están calibrados contra el ancho
 * REAL de la tarjeta en mobile — medido en vivo con Playwright, no
 * calculado a ojo: a 320px de viewport (el más angosto probado) el
 * contenido útil de la tarjeta es de ~238px (320 → tarjeta de 270px de
 * ancho, menos `p-4` de padding); a 430px, ~348px. Cada tier usa la altura
 * mobile más grande con la que su miembro de aspect ratio más ancho
 * (CzechInvest 8.3:1 en `medium`, Czech Academy ~4:1 en `default`, ESA 2:1
 * en `large`, Google Developers 2.6:1 en `xlarge`) sigue cabiendo SOLO
 * dentro de esos ~238px, con margen de sobra — no se apunta a que una fila
 * entera quepa en una sola línea en mobile (Forbes + CzechInvest combinados
 * nunca caben ahí, ver arriba), sólo a que ningún logo individual se salga
 * de la tarjeta.
 *
 * `p-8`/`gap-8` (32px) fijos también se volvieron responsive
 * (`p-4 sm:p-6 md:p-8` / `gap-3 sm:gap-5 md:gap-8`) — a 320px de ancho de
 * página, 32px de padding a cada lado de la tarjeta es un cuarto del
 * viewport sólo en aire; achicarlo en mobile le devuelve ese espacio a los
 * logos.
 *
 * Un solo bloque, "Featured In & Ecosystem" — copy honesto (decisión
 * explícita del usuario tras señalar la tensión de marca registrada / falso
 * respaldo que ya resuelve `RecognitionSection.vue` más abajo en esta misma
 * página): menciones/vínculos de prensa, expositores y redes institucionales
 * — nunca una afirmación de patrocinio. Los que también tienen tarjeta con
 * fuente pública en `RecognitionSection.vue` (CzechInvest, Miami Business
 * Show, Startup Kitchen) comparten archivo con esa sección, sólo que aquí
 * sin enlace.
 *
 * El bloque "Built With & Tech Stack" (Anthropic, AWS, OpenAI, SAP) se quitó
 * entero — pedido explícito. Google Developers es la única excepción: en vez
 * de desaparecer con el resto, se reubicó al final de la última fila
 * ("a la par de US Expand" — pedido explícito), junto a Miami Business Show
 * + Startup Kitchen + US Expand.
 */
type SizeTier = 'small' | 'medium' | 'default' | 'large' | 'xlarge'

interface LogoMeta {
  id: string
  /** Nombre real de la marca — es el `alt` del logo, no pasa por i18n (nombre propio). */
  name: string
  /** Ruta bajo /public/logos/partners-by/. */
  src: string
  /** Dimensiones intrínsecas reales del archivo — de aquí se deriva el ancho de render. */
  width: number
  height: number
  /** Único caso confirmado 100% opaco — ver docstring. `brightness-0 invert` lo dejaría en blanco liso. */
  forceOpacityOnly?: boolean
  /** Arte nativo blanco/casi blanco (pensado para fondo oscuro) — ver docstring del filtro en modo claro. */
  lightInvert?: boolean
  /** Nivel de altura óptica — ver docstring. Por defecto 'default'. */
  sizeTier?: SizeTier
}

const { t } = useI18n()

const LOGO_DIR = '/logos/partners-by'

// Fila 1: Forbes Technology Council + CzechInvest — ver el docstring de
// arriba para el porqué del tier `medium` compartido.
const rowOneMeta: LogoMeta[] = [
  {
    id: 'forbesTechCouncil',
    name: 'Forbes Technology Council',
    src: `${LOGO_DIR}/ForbesTechCouncil_Logo.webp`,
    width: 305,
    height: 52,
    sizeTier: 'medium',
  },
  { id: 'czechinvest', name: 'CzechInvest', src: `${LOGO_DIR}/CzechInvest_logo.svg`, width: 480, height: 58, sizeTier: 'medium' },
]

// Fila 2: Czech Association of AI + Engaged Investments Conference + ESA.
const rowTwoMeta: LogoMeta[] = [
  {
    id: 'czechAi',
    name: 'Czech Association of AI',
    src: `${LOGO_DIR}/CzechAssociationAI_logo.png`,
    width: 744,
    height: 164,
    forceOpacityOnly: true,
  },
  { id: 'engagedIc', name: 'Engaged Investments Conference', src: `${LOGO_DIR}/Engaged_IC_logo.webp`, width: 738, height: 297 },
  { id: 'esa', name: 'ESA — European Space Agency', src: `${LOGO_DIR}/esa_logo.webp`, width: 485, height: 243, sizeTier: 'large' },
]

// Fila 3: Space 2 Business + Czech Academy + Defence Hub (pedido explícito
// de reagruparlos juntos).
//
// `width`/`height` de estos dos DEBEN ser 707×353 / 706×353 — confirmado con
// `sharp().metadata()` contra el archivo real (aspect ~2:1 los dos). Alguien
// los cambió a 1307×353 / 1406×353 en algún momento (aspect ~3.7-4:1, ~2x más
// panorámico que el archivo real) y eso SÍ se notaba, aunque distinto según
// el entorno: en local, IPX redimensiona al tamaño de caja exacto que pide
// `withRenderSize()` sin preservar aspecto, así que el logo salía
// "estirado" para llenar una caja ya de por sí mal calculada; en producción,
// el optimizador de imágenes de Vercel SÍ preserva el aspecto real del
// archivo, así que `object-fit: contain` termina encogiendo el contenido
// dentro de esa misma caja mal calculada, dejándolo más chico y con aire a
// los lados. Mismo bug, dos síntomas opuestos — la causa siempre fue la
// metadata, no un problema de CSS ni de un entorno en particular.
const rowThreeMeta: LogoMeta[] = [
  // Pedido explícito: agrandar estos dos más que el resto de la fila —
  // Czech Academy más que Space Business. Con el aspecto real ya corregido
  // (~2:1 ambos, ver arriba), subir el tier es lo que los agranda
  // proporcionalmente sin distorsionar nada: `large` lleva Space Business de
  // 96px a 128px de ancho (+32), `xlarge` lleva Czech Academy de 96px a
  // 160px (+64) — el salto más grande que pidió. Los tres siguen cabiendo
  // juntos en la fila (128 + 160 + 136 de Defence Hub ≈ 424px + huecos,
  // contra los ~601px de contenido de la tarjeta).
  { id: 'space2business', name: 'Space 2 Business', src: `${LOGO_DIR}/space_business_logo.webp`, width: 707, height: 353, lightInvert: true, sizeTier: 'large' },
  { id: 'czechAcademy', name: 'The Czech Academy of Sciences', src: `${LOGO_DIR}/TheCzechAcademy_logo.webp`, width: 706, height: 353, sizeTier: 'xlarge' },
  { id: 'defenceHub', name: 'Defence Hub', src: `${LOGO_DIR}/defence_hub_logo.webp`, width: 692, height: 245 },
]

// Fila 4: Miami Business Show + Startup Kitchen + US Expand + Google
// Developers, todos en `xlarge` — pedido explícito de "más grandes pero
// proporcionales" entre sí; Google Developers es lo único que sobrevive del
// bloque "Built With & Tech Stack" que se quitó del todo (Anthropic, AWS,
// OpenAI y SAP se eliminaron con él).
const rowFourMeta: LogoMeta[] = [
  {
    id: 'businessshow',
    name: 'Miami Business Show',
    src: `${LOGO_DIR}/MiamiBusinessShow_logo.svg`,
    width: 1095,
    height: 1095,
    lightInvert: true,
    sizeTier: 'xlarge',
  },
  { id: 'startupkitchen', name: 'Startup Kitchen', src: `${LOGO_DIR}/startupkitchen_logo.webp`, width: 1080, height: 1080, sizeTier: 'xlarge' },
  {
    id: 'usExpand',
    name: 'US Expand',
    src: `${LOGO_DIR}/USExpand_Logo.webp`,
    width: 292,
    height: 240,
    lightInvert: true,
    sizeTier: 'xlarge',
  },
  { id: 'googleDevs', name: 'Google Developers', src: `${LOGO_DIR}/GoogleDevs_Logo.webp`, width: 812, height: 307, sizeTier: 'xlarge' },
]

// Altura de RENDER por nivel, mobile y desktop — ver el docstring "Tamaño
// responsive" de arriba para la calibración de cada valor `mobile` contra
// el ancho real medido de la tarjeta. El ancho se deriva del aspect ratio
// real de cada archivo en `withRenderSize()`, así que ni un wordmark
// panorámico ni un sello cuadrado se deforman en ningún breakpoint.
const TIER_CONFIG: Record<SizeTier, { mobile: number; desktop: number }> = {
  small: { mobile: 24, desktop: 32 },
  medium: { mobile: 24, desktop: 40 },
  default: { mobile: 32, desktop: 48 },
  large: { mobile: 40, desktop: 64 },
  xlarge: { mobile: 48, desktop: 80 },
}

function withRenderSize(items: LogoMeta[]) {
  return items.map((item) => {
    const tier = item.sizeTier ?? 'default'
    const { mobile, desktop } = TIER_CONFIG[tier]
    const aspect = item.width / item.height
    const mobileWidth = Math.round(mobile * aspect)
    const desktopWidth = Math.round(desktop * aspect)
    return {
      ...item,
      // Atributos `width`/`height` del `<img>`: valores DESKTOP — sólo
      // reservan el aspect-ratio/evitan CLS antes de que cargue el CSS. El
      // tamaño real en pantalla lo deciden las variables de abajo + las
      // reglas `.gp-logo` del `<style>`, no estos atributos.
      renderWidth: desktopWidth,
      renderHeight: desktop,
      // Variables CSS inline consumidas por `.gp-logo` — ver el docstring
      // "Tamaño responsive" de arriba para el porqué de esta indirección
      // (Tailwind no puede generar una clase `w-[Npx]` calculada en runtime).
      sizeVars: {
        '--w-m': `${mobileWidth}px`,
        '--h-m': `${mobile}px`,
        '--w-d': `${desktopWidth}px`,
        '--h-d': `${desktop}px`,
      },
      imgClass: item.forceOpacityOnly
        ? 'gp-logo block opacity-80 transition-all duration-200 hover:opacity-100'
        : item.lightInvert
          // Arte nativo blanco/casi blanco — sin `dark:`, `brightness-0 grayscale`
          // ya se aplica en AMBOS temas (fuerza negro sólido, visible sobre la
          // tarjeta clara); `dark:invert` se suma sólo en oscuro y voltea ese
          // negro a blanco, el mismo resultado de siempre ahí.
          ? 'gp-logo block opacity-80 transition-all duration-200 hover:opacity-100 brightness-0 grayscale dark:invert'
          : 'gp-logo block opacity-80 transition-all duration-200 hover:opacity-100 dark:brightness-0 dark:invert dark:grayscale',
    }
  })
}

const rowOneSized = withRenderSize(rowOneMeta)
const rowTwoSized = withRenderSize(rowTwoMeta)
const rowThreeSized = withRenderSize(rowThreeMeta)
const rowFourSized = withRenderSize(rowFourMeta)
</script>

<template>
  <section v-vanish class="relative overflow-hidden py-10 md:py-14">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid gap-10 lg:grid-cols-[3fr_4fr] lg:items-center lg:gap-16">
        <!-- Copy de autoridad B2B -->
        <div v-reveal>
          <h2 class="text-3xl font-black leading-[1.15] tracking-tight text-ink md:text-4xl">
            {{ t('home.logoCloud.title_1') }}
            <span class="text-accent-text">{{ t('home.logoCloud.title_span') }}</span>
            {{ t('home.logoCloud.title_2') }}
          </h2>
          <p class="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
            {{ t('home.logoCloud.subtitle') }}
          </p>
        </div>

        <!-- Logos -->
        <div class="rounded-2xl border border-hairline bg-surface-strong/30 p-4 backdrop-blur-md sm:p-6 md:p-8">
          <p class="mb-5 text-[11px] font-bold uppercase tracking-[0.3em] text-ink-muted">
            {{ t('home.logoCloud.row1Label') }}
          </p>

          <!-- Fila 1: Forbes Technology Council + CzechInvest. -->
          <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-5 md:gap-8">
            <NuxtImg
              v-for="logo in rowOneSized"
              :key="logo.id"
              :src="logo.src"
              :alt="logo.name"
              :width="logo.renderWidth"
              :height="logo.renderHeight"
              loading="lazy"
              :style="logo.sizeVars"
              :class="logo.imgClass"
            />
          </div>

          <!-- Fila 2: Czech Association of AI + Engaged Investments Conference + ESA. -->
          <div class="mt-4 flex flex-wrap items-center justify-center gap-3 sm:mt-6 sm:gap-5 md:mt-8 md:gap-8">
            <NuxtImg
              v-for="logo in rowTwoSized"
              :key="logo.id"
              :src="logo.src"
              :alt="logo.name"
              :width="logo.renderWidth"
              :height="logo.renderHeight"
              loading="lazy"
              :style="logo.sizeVars"
              :class="logo.imgClass"
            />
          </div>

          <!-- Fila 3: Space 2 Business + Czech Academy + Defence Hub. -->
          <div class="mt-4 flex flex-wrap items-center justify-center gap-3 sm:mt-6 sm:gap-5 md:mt-8 md:gap-8">
            <NuxtImg
              v-for="logo in rowThreeSized"
              :key="logo.id"
              :src="logo.src"
              :alt="logo.name"
              :width="logo.renderWidth"
              :height="logo.renderHeight"
              loading="lazy"
              :style="logo.sizeVars"
              :class="logo.imgClass"
            />
          </div>

          <!-- Fila 4: Miami Business Show + Startup Kitchen + US Expand + Google Developers. -->
          <div class="mt-4 flex flex-wrap items-center justify-center gap-3 sm:mt-6 sm:gap-5 md:mt-8 md:gap-8">
            <NuxtImg
              v-for="logo in rowFourSized"
              :key="logo.id"
              :src="logo.src"
              :alt="logo.name"
              :width="logo.renderWidth"
              :height="logo.renderHeight"
              loading="lazy"
              :style="logo.sizeVars"
              :class="logo.imgClass"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tamaño real de cada logo — consume las 4 variables CSS que
   `withRenderSize()` calcula por item (ver el docstring "Tamaño responsive"
   arriba del script). Reglas ESTÁTICAS a propósito: Tailwind no puede
   generar una clase `w-[Npx]` armada en runtime a partir del aspect ratio de
   cada logo, así que el número vive en la variable inline y estas dos
   reglas (siempre las mismas, nunca generadas dinámicamente) sólo deciden
   CUÁL par de variables aplicar según el ancho de viewport. */
.gp-logo {
  width: var(--w-m);
  height: var(--h-m);
  object-fit: contain;
}

@media (min-width: 640px) {
  .gp-logo {
    width: var(--w-d);
    height: var(--h-d);
  }
}
</style>
