# GA4: desbloqueo de CSP, pageviews SPA y externalización del Measurement ID

Rama `fix/ga4-csp-and-routing` · commit base `35bf6a3`

GA4 llevaba **desde el 23 de agosto de 2026 sin recoger un solo dato en
producción**. Este documento explica por qué, qué se cambió y qué queda
pendiente de hacer a mano en la interfaz de Google Analytics.

---

## 1. El diagnóstico

### Qué estaba roto

El `<script>` de `gtag.js` **siempre cargó bien**. La directiva `script-src`
del sitio incluye `'strict-dynamic'`, que confía transitivamente en cualquier
script inyectado por un bundle ya nonce-ado — que es exactamente lo que hace
el plugin. Ese nunca fue el problema.

Lo que moría era **cada hit que gtag intentaba emitir**. GA4 envía a:

- `https://www.google-analytics.com/g/collect`
- `https://region1.google-analytics.com/g/collect` … hasta `region14`
- `https://analytics.google.com/g/collect`

…mediante `sendBeacon`, `fetch` o XHR. Los tres transportes los gobierna
`connect-src`, y esa lista no contenía ningún host de Google. El último
recurso de gtag —un píxel `<img>`— caía bajo `img-src`, que tampoco los
tenía. Resultado: el script se descargaba, se ejecutaba, y todo lo que
producía se descartaba en la capa de CSP.

### Por qué pasó: cronología

| Fecha | Commit | Qué ocurrió |
| --- | --- | --- |
| 2026-08-22 | `1a6dd79` | Se crea `app/plugins/analytics.client.ts`. En ese momento **no existía ninguna directiva `connect-src`**, así que los hits salían sin restricción. El comentario del plugin lo afirmaba correctamente. |
| 2026-08-23 | `0d9fa22` | Cloudflare Turnstile introduce `connect-src` para su propio host. Nadie volvió al plugin de analytics. |
| 2026-09-10 → 09-11 | `a33dabc`, `307620e` | Sanity añade sus hosts a la misma lista. GA4 sigue sin aparecer. |
| 2026-09-21 | `35bf6a3` | Se detecta y se corrige. |

No fue un descuido del plugin: su documentación era exacta **el día que se
escribió** y quedó obsoleta a las 24 horas, por un cambio en otro archivo.

### Segundo problema: cero pageviews de navegación SPA

`gtag('config', ID)` dispara **un** `page_view`, en la carga inicial, y nunca
más. En una SPA de Nuxt casi toda la navegación ocurre en cliente, así que
todo el recorrido interno del visitante era invisible. No existía ningún
`router.afterEach` ni hook equivalente en el proyecto.

### Tercer problema: Measurement ID incrustado

`G-0BBYWL11BW` estaba escrito a pelo en el código fuente. Consecuencia
práctica: **cada deploy de Preview de cada rama mandaba su tráfico de pruebas
a la propiedad de producción.**

Además, ese ID **no era el de la propiedad de producción real**. Al verificarlo
contra la interfaz de GA4 el 2026-09-22 resultó ser `G-V5BRG0MELC`, que es el
que quedó como fallback. O sea que el bloqueo de CSP tapaba un segundo
problema: aunque los hits hubieran salido, habrían ido a la propiedad
equivocada.

---

## 2. Tabla de cambios

| Archivo | Líneas / Bloque | Propósito del cambio / Decisión técnica |
| --- | --- | --- |
| `nuxt.config.ts` | 487–497 · `connect-src` | Añade `https://*.google-analytics.com`, `https://analytics.google.com`, `https://*.analytics.google.com` y `https://www.googletagmanager.com`. Es el arreglo que hace que GA4 recoja datos: sin esto, todo lo demás es irrelevante. |
| `nuxt.config.ts` | 501–508 · `img-src` | Añade `https://*.google-analytics.com` y `https://www.googletagmanager.com` para cubrir el transporte de último recurso de gtag (píxel `<img>`), que `connect-src` no gobierna. |
| `nuxt.config.ts` | 355–358 · `runtimeConfig.public` | Nueva clave `gaMeasurementId`, alimentada por `NUXT_PUBLIC_GA_MEASUREMENT_ID` con fallback condicionado a `VERCEL_ENV === 'production'`. Saca el ID del código y corta la contaminación desde Preview. |
| `app/plugins/analytics.client.ts` | 12–14 | Lee el ID de `runtimeConfig` y **sale temprano si está vacío**: sin ID no se monta `dataLayer`, ni listener de router, ni petición de red. |
| `app/plugins/analytics.client.ts` | 16–22 | La cola `dataLayer` pasa a crearse de forma **síncrona**, fuera del `requestIdleCallback`. |
| `app/plugins/analytics.client.ts` | 23 · `send_page_view: false` | Desactiva el pageview automático de `config` para que **todas** las vistas pasen por un único camino. |
| `app/plugins/analytics.client.ts` | 25–43 | `trackPageView()` + `router.afterEach`: registro de navegación SPA, con guarda por `fullPath` (línea 29). |
| `app/plugins/analytics.client.ts` | 45–57 | Sólo la **descarga del script** queda diferida tras `requestIdleCallback`. |
| `.env.example` | bloque final | Documenta `NUXT_PUBLIC_GA_MEASUREMENT_ID` y sus tres estados. |

---

## 3. Decisiones técnicas y su porqué

### 3.1 Por qué se listan tres patrones de Google, y no uno

Los tres **no se solapan**. En CSP, un comodín `*.` exige al menos una
etiqueta de subdominio:

| Patrón | Cubre | **No** cubre |
| --- | --- | --- |
| `https://*.google-analytics.com` | `www.`, `region1.` … `region14.` | `google-analytics.com` a secas |
| `https://*.analytics.google.com` | subdominios de `analytics.google.com` | **`analytics.google.com` a secas** |
| `https://analytics.google.com` | el dominio desnudo | — |

Por eso `analytics.google.com` se lista aparte del comodín: es un endpoint
real de recolección y el patrón `*.` lo dejaría fuera.

### 3.2 Por qué `googletagmanager.com` también en `connect-src`

No basta con que el script se descargue. Una vez arranca, `gtag.js` hace
`fetch` de su configuración remota (`/gtag/destination`) contra ese mismo
host. Sin la entrada en `connect-src`, ese fetch se bloquea.

### 3.3 Por qué el discriminante es `VERCEL_ENV` y no `NODE_ENV`

Es la decisión más importante del commit.

**Vercel construye los deploys de Preview con `NODE_ENV=production`.** Colgar
el fallback de `NODE_ENV` habría significado que cada rama de preview
recibiera el ID de la propiedad viva y mandara allí su tráfico de pruebas —
exactamente la contaminación que este cambio existe para evitar.

`VERCEL_ENV` sí distingue los tres entornos (`production`, `preview`,
`development`) y en local no existe, de modo que `npm run dev` y `npm run
build` tampoco ensucian las métricas.

### 3.4 Por qué `??` y no `||`

```ts
gaMeasurementId:
  nodeEnv.NUXT_PUBLIC_GA_MEASUREMENT_ID
  ?? (nodeEnv.VERCEL_ENV === 'production' ? 'G-V5BRG0MELC' : ''),
```

Con `||`, una variable puesta deliberadamente a cadena vacía caería al
fallback y **volvería a encender el rastreo** — lo contrario de lo que pide
quien la deja vacía. Con `??` sólo el valor `undefined` (variable no definida
en absoluto) activa el fallback.

Orden de resolución resultante:

1. `NUXT_PUBLIC_GA_MEASUREMENT_ID`, sea cual sea su valor, **incluida la
   cadena vacía**.
2. Si no está definida: el ID de producción, pero **sólo** en un deploy de
   Producción real.
3. Vacío en todo lo demás.

### 3.5 Por qué la cola `dataLayer` se crea de forma síncrona

`window.dataLayer = []` y la función `gtag` cuestan esencialmente cero: un
array y un closure. A cambio, cualquier evento emitido **antes** de que
`gtag.js` termine de bajar queda encolado y se procesa cuando el script
arranca, en lugar de perderse.

Si la cola viviera dentro del `requestIdleCallback` —como estaba antes— una
navegación rápida en los primeros segundos no se registraría. El perfil de
rendimiento no cambia: lo caro (red + ejecución de gtag.js) sigue diferido.

### 3.6 Por qué la guarda por `fullPath`

`router.afterEach` **también se dispara en la navegación inicial de la
hidratación**, que es la misma ruta que ya se registró a mano al montar el
plugin. Comparar `fullPath` contra el último registrado es más robusto que un
booleano "primera vez", porque no asume en qué orden ocurren la hidratación y
la ejecución del plugin.

### 3.7 Por qué `nextTick` antes de leer `document.title`

unhead aplica el `<title>` de la nueva página en el ciclo de actualización del
DOM. Leerlo dentro del propio `afterEach` devolvería todavía el título de la
página **anterior**. `page_path` y `page_location` no dependen de esto; el
título es el único dato que necesita esperar.

---

## 4. Verificación realizada

| Comprobación | Resultado |
| --- | --- |
| Build con `VERCEL_ENV=production` | hornea `G-V5BRG0MELC` |
| Build con `VERCEL_ENV=preview` | hornea `""`; el ID de producción **no aparece** en el output |
| Build local sin variable | `""` → el plugin no arranca |
| Servir con `NUXT_PUBLIC_GA_MEASUREMENT_ID=G-STAGING999` | la variable gana en runtime, sin rebuild |
| `npx nuxi typecheck` | exit 0, 0 errores |
| `nuxt build` | sin warnings nuevos |
| 12 rutas + canonical / meta robots | sin regresión |

> **Aviso sobre la caché de Nuxt.** La primera verificación del fallback dio
> `""` con `VERCEL_ENV=production` y parecía un bug del código. Era caché
> rancia: al borrar `.nuxt`, `.output` y `node_modules/.cache/nuxt`, Nitro
> incluso cambió de preset y emitió `.vercel/output`. **Cualquier validación
> de un cambio en `nuxt.config.ts` debe hacerse con la caché limpia**, o el
> resultado no significa nada.

---

## 5. Operativa pendiente

### 5.1 Desactivar "page changes based on browser history events" — OBLIGATORIO

**GA4 → Administrar → Flujos de datos → (el flujo web) → Medición mejorada →
engranaje → desactivar "Cambios de página basados en eventos del historial del
navegador".**

Si queda activo, GA4 emitirá su propio `page_view` en cada `pushState`
**además** del que envía el plugin, y todas las vistas de navegación interna
contarán **el doble**. Es un ajuste de interfaz: no se puede resolver desde el
código.

### 5.2 Confirmar el fix en producción tras el deploy

1. Abrir corosdev.com con DevTools.
2. Pestaña **Network**, filtrar por `collect`.
3. Navegar entre páginas: deben aparecer peticiones con estado `200`.
4. La **Console** ya no debe mostrar `Refused to connect to
   'https://www.google-analytics.com/...'`.
5. **GA4 → Informes → Tiempo real** debe registrar la sesión.

### 5.3 Variables de entorno en Vercel

`Project → Settings → Environment Variables`.

| Entorno | Valor recomendado | Efecto |
| --- | --- | --- |
| Production | *(sin definir)* | Cae al ID vivo `G-V5BRG0MELC` |
| Preview | *(sin definir)* | Rastreo apagado — recomendado |
| Preview (alternativa) | ID de una propiedad de staging | Mide sin tocar producción |
| Development | *(sin definir)* | Rastreo apagado |

Para apagar el rastreo en Producción sin desplegar código: definir la variable
**vacía**.

---

## 6. Deuda conocida, fuera del alcance de este commit

**No hay gestión de consentimiento.** No existe banner de cookies, ni Consent
Mode v2, ni equivalente. GA4 arranca incondicionalmente en cuanto hay un ID
configurado. Con presencia y partners en la UE esto es exposición legal real,
y desde marzo de 2024 Google exige Consent Mode v2 para conversiones en el
EEE. Es una decisión de negocio y jurídica, no técnica, y por eso no se abordó
aquí.

> **Parcialmente resuelto el 2026-09-22 — ver §7.** El plugin ya declara
> Consent Mode v2 y expone la API que el banner necesita. Lo que sigue sin
> existir es la UI de consentimiento: ningún componente pregunta todavía al
> visitante, así que el estado efectivo es `denied` permanente (7.4).

---

## 7. Apéndice — refactor del 2026-09-22: Consent Mode v2 y carga a prueba de idle

Segunda pasada sobre `app/plugins/analytics.client.ts`, ya con el bloqueo de
CSP resuelto y el ID correcto verificado. Tres motivos, en orden de
importancia: cerrar la deuda de consentimiento del §6, blindar la inyección
del script contra navegadores que nunca emiten un evento de reposo, y dar a
los componentes una vía limpia de emitir eventos sin tocar `window`.

**El `connect-src` / `img-src` del §2 no cambia.** Consent Mode viaja dentro
de los mismos hits a los mismos hosts que ya están permitidos — este apéndice
no toca `nuxt.config.ts`. El detalle está en 7.5.

### 7.1 Tabla de cambios

| Bloque | Cambio | Porqué |
| --- | --- | --- |
| `ConsentState` / `Gtag` | Tipos exportados | El banner y los componentes consumen un contrato tipado, no `any`. |
| `createNoopGtag()` | `$gtag` inerte cuando no hay ID | Sin esto, `$gtag.event()` reventaría en Preview/local, donde el ID está vacío a propósito (§3.3). |
| `gtag('consent', 'default', …)` | Las 4 señales de la v2 en `denied` + `wait_for_update: 500` | Cierra la deuda del §6. |
| `readStoredConsent()` | Rehidrata la decisión desde `localStorage` | Sin esto el visitante volvería a estado denegado en cada recarga. |
| `gtag.consent()` / `grantAll()` / `denyAll()` | API para el banner | Requisito 2: `consent → update`. |
| `gtag.event()` | Azúcar sobre `gtag('event', …)` | Requisito 3. |
| `injectTag()` + `requestIdleCallback` **+ `setTimeout(1800)`** | Carrera con guarda idempotente | Núcleo de 7.3. |
| `return { provide: { gtag } }` | Helper `$gtag` en el contexto de Nuxt | Requisito 1. |

Lo que **no** cambió: la guarda por `fullPath` (§3.6), el `nextTick` antes de
leer `document.title` (§3.7), `send_page_view: false` (§2), la creación
síncrona de `dataLayer` (§3.5) y la lectura del ID desde `runtimeConfig`
(§3.3, §3.4). Siguen siendo correctos y su razonamiento está arriba.

### 7.2 Por qué el ID definitivo sigue sin estar escrito a pelo

`G-V5BRG0MELC` es el ID vivo y verificado, pero permanece como **fallback en
`runtimeConfig`**, no como literal dentro del plugin. Incrustarlo revertiría
exactamente el problema que documenta el §3.3: Vercel construye los deploys de
Preview con `NODE_ENV=production`, así que cada rama mandaría su tráfico de
pruebas a la propiedad viva, y el interruptor de emergencia (definir la
variable vacía para apagar el rastreo sin desplegar código) desaparecería.

El plugin ve el mismo valor que pide el requisito —en Producción resuelve a
`https://www.googletagmanager.com/gtag/js?id=G-V5BRG0MELC`— sólo que por una
vía que también funciona en Preview y en local.

### 7.3 Por qué `requestIdleCallback` necesita SIEMPRE un `setTimeout` gemelo

Es el arreglo menos visible y el más importante del refactor. La versión
anterior tenía **dos** formas de quedarse colgada indefinidamente:

1. **`requestIdleCallback` no existe en todos los navegadores.** Safari sólo
   lo expone desde la 16.4 (marzo de 2023). El código anterior ya lo cubría
   con un `??`, pero seguía dependiendo del punto 2.
2. **El `timeout` de `requestIdleCallback` no es un temporizador de pared.**
   Es un plazo que el agente de usuario respeta *cuando decide planificar
   trabajo*. Una pestaña abierta en segundo plano (clic con el botón central,
   restauración de sesión, precarga) tiene el bucle de tareas congelado: no
   hay periodos de reposo que repartir, así que la retrollamada puede no
   ejecutarse **nunca** mientras la pestaña siga oculta. Encima, la versión
   anterior esperaba primero al evento `load` de `window`, que en esa misma
   pestaña en segundo plano también se retrasa arbitrariamente. Resultado:
   dos esperas encadenadas, cada una capaz de no resolverse, y gtag.js sin
   descargar en una pestaña que el visitante abrirá diez segundos después.

La versión nueva lanza **las dos rutas a la vez** y deja que gane la primera:

```ts
window.requestIdleCallback?.(injectTag, { timeout: SCRIPT_IDLE_TIMEOUT })
setTimeout(injectTag, SCRIPT_IDLE_TIMEOUT)
```

`injectTag()` es idempotente por su bandera `injected`, de modo que la carrera
no puede producir dos `<script>`. El `?.` cubre a Safari < 16.4 sin necesidad
de un adaptador: si la API no existe, simplemente gana el `setTimeout`.

**1800 ms** es el valor elegido dentro del rango pedido (1500–2000): queda muy
por detrás del LCP en cualquier perfil realista de este sitio (la analítica no
compite con el render) pero suficientemente pronto como para que un visitante
medio no navegue antes de que la cola empiece a drenarse. Y aunque navegara,
no se pierde nada: `dataLayer` existe desde el primer instante (§3.5) y los
eventos encolados se procesan cuando gtag.js arranca.

Se eliminó además la espera al evento `load`: `requestIdleCallback` ya cede el
paso al trabajo crítico por definición, así que encadenar ambas sólo sumaba un
punto de fallo.

### 7.4 Consent Mode v2: qué implica de verdad

> **Actualizado por el §9.** Lo que sigue describe el estado de partida
> original (las cuatro señales denegadas). Desde el §9, `analytics_storage`
> arranca en `granted`; el resto del apartado sigue siendo válido.

El plugin declara las cuatro señales de la v2 en `denied` **antes** de
`config`:

```ts
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500,
})
```

El orden importa: `consent → default` tiene que estar en `dataLayer` antes que
`config`, o gtag.js procesará el primer hit con el comportamiento por defecto
(consentimiento implícito) y el `default` llegará tarde. Al ser todo la misma
cola síncrona, el orden del archivo es el orden real de proceso.

`wait_for_update: 500` le da medio segundo a un `update` que llegue en el
mismo arranque (justo el caso de 7.4.1) antes de emitir el primer hit, para
que ese hit salga ya con el estado correcto en vez de como ping sin cookies
seguido de una corrección.

**Consecuencia operativa que hay que entender antes de desplegar:** con
`analytics_storage: 'denied'`, GA4 **no escribe la cookie `_ga`**. Sigue
enviando pings sin cookies (esa es la gracia de Consent Mode: Google los usa
para modelar), pero sin `client_id` estable no hay usuarios únicos reales ni
sesiones atribuidas con fidelidad. **Mientras no exista un banner que llame a
`grantAll()`, el sitio mide en modo degradado permanente.** El 7.7 detalla lo
que falta.

#### 7.4.1 Por qué se persiste la decisión en `localStorage`

Un `gtag('consent', 'update', …)` vive sólo en la página actual. Sin
persistencia, un visitante que acepta cookies volvería a arrancar en `denied`
en la siguiente recarga y en cada navegación con recarga completa — y el
banner tendría que volver a preguntar, o peor, no preguntaría y el rastreo
quedaría apagado creyendo estar encendido.

El plugin guarda el estado bajo la clave `corosdev-consent` y lo reaplica en
el arranque, entre el `default` y el `config`. Lectura y escritura van
envueltas en `try/catch`: Safari en modo privado y los perfiles con
almacenamiento bloqueado lanzan al tocar `localStorage`, y una excepción ahí
tumbaría el plugin entero. Degradar a "el consentimiento vale para esta
sesión" es preferible a quedarse sin analítica y sin `$gtag`.

`gtag.consent()` fusiona siempre contra `DENIED_ALL` antes de persistir, así
que el objeto guardado contiene las cuatro claves aunque el llamante sólo pase
una: nunca se almacena un estado parcial que la siguiente carga interpretaría
a medias.

### 7.5 Compatibilidad con la CSP activa

Verificada directiva por directiva contra el bloque `security` de
`nuxt.config.ts`. **No hace falta ningún cambio.**

| Directiva | Qué exige el refactor | Estado |
| --- | --- | --- |
| `script-src` | Inyectar `gtag/js` desde JS de primera parte ya nonce-ado | Cubierto por `'strict-dynamic'`, igual que antes (§1). El `<script>` creado con `document.createElement` hereda la confianza del script que lo crea. |
| `connect-src` | Los hits de consentimiento salen a los mismos hosts de siempre | Ya listados en §2. Consent Mode no introduce endpoints nuevos: viaja como parámetros (`gcs`, `gcd`) dentro del propio `/g/collect`. |
| `img-src` | Píxel de último recurso | Sin cambios. |
| `style-src`, `frame-src` | Nada | GA4 sin Google Ads no inyecta ni estilos ni iframes. |

**Límite conocido, por si algún día se concede `ad_storage`.** Las señales
`ad_*` existen porque la v2 las exige como declaración, no porque hoy haya
publicidad. Si en el futuro se enlaza Google Ads o se activan las Señales de
Google *y* el visitante concede `ad_storage`, gtag intentará además
`https://googleads.g.doubleclick.net/...` y
`https://www.google.com/ads/ga-audiences`, que **no** están en `connect-src`
ni en `img-src` y serían bloqueados con el mismo error de consola del §1.
Mientras no se enlace Google Ads, concederlas no produce tráfico adicional y
por tanto no rompe nada. Si se enlaza, hay que volver a este documento y
ampliar ambas directivas.

### 7.6 Uso desde componentes

El helper se resuelve con `useNuxtApp()`. En Preview y en local el ID está
vacío y `$gtag` es una implementación inerte (7.1), así que estas llamadas son
seguras en cualquier entorno y no necesitan guarda.

**Lead generation** — en el `onSubmit` de `ContactModal.vue`, tras la
respuesta correcta de `/api/lead`:

```ts
const { $gtag } = useNuxtApp()

$gtag.event('generate_lead', {
  service_requested: form.projectType,
  method: 'contact_modal',
})
```

**Interacción de UI** — en `FloatingCtaDrawer.vue`, sobre el `context` que
expone `useCtaDrawer()`:

```ts
const { $gtag } = useNuxtApp()

$gtag.event('drawer_interaction', {
  drawer_name: context.value,
  action: 'open',
})
```

`service_requested` y `drawer_name` deben llevar el **valor de enum
canónico**, no la etiqueta traducida (`form.projectType`, `context.value`), o
el mismo embudo aparecerá partido en dos en los informes según el idioma del
visitante. Es la misma convención que ya siguen los `<select>` de
`ContactSection.vue` y del drawer.

**Banner de cookies**, cuando exista:

```ts
const { $gtag } = useNuxtApp()

$gtag.grantAll()                                // "Aceptar todo"
$gtag.denyAll()                                 // "Rechazar"
$gtag.consent({ analytics_storage: 'granted' }) // granularidad por señal
```

Ninguno de estos ejemplos toca `page_view`: las vistas las sigue enviando el
propio plugin por `router.afterEach`, nunca los componentes.

### 7.7 Lo que sigue pendiente

1. **El banner no existe.** Este refactor entrega el lado técnico
   —declaración de consentimiento, API de actualización y persistencia— pero
   no hay ningún componente que pregunte al visitante. Hasta que lo haya, se
   mide en el modo degradado que describe 7.4. El §6 deja de ser cierto sólo a
   medias: ya hay Consent Mode v2; sigue sin haber UI de consentimiento.
2. **Sigue vigente el §5.1**: desactivar en la interfaz de GA4 "Cambios de
   página basados en eventos del historial del navegador", o cada navegación
   interna se contará el doble.
3. **Instrumentar los eventos de 7.6** en `ContactModal.vue` y
   `FloatingCtaDrawer.vue`: el plugin expone la vía, pero ningún componente la
   llama todavía.
4. **Marcar `generate_lead` como conversión** en GA4 → Administrar → Eventos,
   una vez lleguen los primeros.

### 7.8 Verificación realizada

| Comprobación | Resultado |
| --- | --- |
| `npx nuxi typecheck` | exit 0, 0 errores |
| `npm run build` | exit 0, sin warnings nuevos |
| Orden en `dataLayer` (`consent default` → `update` → `js` → `config`) | correcto por construcción síncrona |
| Doble inyección del `<script>` bajo la carrera idle/timeout | imposible: guarda `injected` |
| Sin Measurement ID | no se crea `dataLayer`, no hay red, `$gtag` inerte y llamable |
| CSP | sin cambios necesarios — ver 7.5 |

Pendiente de validar en el navegador tras el deploy, con el procedimiento del
§5.2, más: `_ga` **no** debe aparecer en cookies antes de aceptar, y los hits
a `/g/collect` deben llevar el parámetro `gcs` (`G100` denegado / `G111`
concedido).

---

## 8. Apéndice — estabilización: banner de consentimiento y arquitectura final

Rama `fix/analytics-stabilization`, sobre el commit `00b2590` del §7.

El §7 dejó el lado técnico del consentimiento resuelto pero sin UI: el estado
efectivo era `denied` permanente y GA4 medía en modo degradado (7.4). Este
apéndice cierra el ciclo con el banner, y de paso **cambia el formato de
almacenamiento** que introdujo el 7.4.1 — ver 8.3, es el detalle con más
consecuencias de esta pasada.

### 8.1 Archivos

| Archivo | Estado | Rol |
| --- | --- | --- |
| `app/utils/consent.ts` | **nuevo** | Contrato de almacenamiento: clave, tipos, `DENIED_ALL`/`GRANTED_ALL`, lectura/escritura y `summariseConsent()`. Única fuente de verdad. |
| `app/components/common/CookieBanner.vue` | **nuevo** | El banner. Lee la decisión al montar, la delega en `$gtag`. |
| `app/plugins/analytics.client.ts` | modificado | Deja de tener su propia lógica de `localStorage`; la importa de `consent.ts`. |
| `app/layouts/default.vue` | modificado | Monta `<CommonCookieBanner />`. |
| `i18n/locales/es.json`, `en.json` | modificados | Bloque `cookieBanner` (5 claves). |

### 8.2 Por qué el componente se invoca `<CommonCookieBanner />`

El archivo vive en `app/components/common/CookieBanner.vue`, pero **la
etiqueta no es `<CookieBanner />`**. Nuxt auto-importa con `pathPrefix`
activado (el valor por defecto, que este proyecto no cambia), así que el
nombre del componente es la ruta de carpetas en PascalCase: exactamente la
misma regla por la que `home/HeroSection.vue` se usa como
`<HomeHeroSection />` en `pages/index.vue`, y `ui/ColorModeToggle.vue` como
`<UiColorModeToggle />` en `AppNavbar.vue`.

Verificado contra `.nuxt/components.d.ts`, que declara
`CommonCookieBanner`. Usar `<CookieBanner />` habría renderizado un elemento
desconocido, en silencio: Vue no rompe el render por una etiqueta que no
resuelve, simplemente la ignora y el banner no aparecería nunca.

### 8.3 Cambio de formato de `corosdev-consent`: objeto JSON → cadena

El §7.4.1 guardaba el estado completo serializado
(`{"ad_storage":"denied",…}`). Ahora se guarda **literalmente `'granted'` o
`'denied'`**.

El motivo es que el banner es una decisión de todo-o-nada: dos botones, sin UI
granular por señal. Guardar cuatro claves cuando sólo existen dos respuestas
posibles invitaba a que el formato y la interfaz divergieran. La cadena dice
exactamente lo que el visitante contestó.

**Consecuencia en visitantes existentes:** una entrada con el formato JSON
anterior ya no se reconoce, `readConsentDecision()` devuelve `null` y el
banner se muestra de nuevo. Es el comportamiento correcto (ante la duda, se
vuelve a preguntar y el estado de partida es `denied`), y el alcance real es
nulo o casi: el formato antiguo sólo existió entre el §7 y este apéndice.

**Limitación aceptada:** `$gtag.consent({ analytics_storage: 'granted' })`
sigue funcionando y emite el `update` granular correcto a GA4, pero lo que se
persiste es el resumen que calcula `summariseConsent()` — `'granted'` sólo si
las cuatro señales lo están. Un estado mixto sobrevive a la navegación SPA
pero **no a una recarga**: al volver, se rehidrata como `denied`. Si algún día
se añade un panel de preferencias por categoría, el formato tiene que volver a
ser un objeto.

### 8.4 Quién escribe en `localStorage`: un solo camino

El requisito pedía que el banner persistiera la preferencia. Lo hace, con esa
clave y ese valor, pero **no escribiendo él mismo**: llama a
`$gtag.grantAll()` / `$gtag.denyAll()`, y son esos helpers los que actualizan
el consentimiento *y* lo persisten.

La razón es que el plugin ya escribía en la misma clave desde el §7. Dos
escritores sobre una sola clave es como se producen las divergencias de
formato — justo la clase de bug que 8.3 tuvo que limpiar. Con un único camino,
actualizar el consentimiento y recordarlo son la misma operación y no pueden
desincronizarse.

#### 8.4.1 El `$gtag` inerte también persiste

Detalle que parece menor y no lo es. Cuando no hay Measurement ID (Preview y
local, §3.3), `$gtag` es la implementación inerte del §7.1. Si esa versión no
hiciera nada en absoluto, pulsar un botón del banner no dejaría rastro y **el
banner reaparecería en cada recarga en todos los entornos de desarrollo**, que
es precisamente donde más veces se recarga.

Por eso el `$gtag` inerte no emite nada a GA4 pero **sí persiste la decisión**:
la elección del visitante es un hecho sobre el visitante, no sobre si hay
analítica configurada.

### 8.5 Rehidratación: el orden exacto al arrancar

> **Actualizado por el §9.** El estado de partida ya no es `denied` en las
> cuatro señales: `analytics_storage` arranca concedido. El orden de la cola
> que describe este apartado no cambia.

Dentro de `defineNuxtPlugin`, en este orden y todo síncrono:

1. `gtag('consent', 'default', { …DENIED_ALL, wait_for_update: 500 })` — el
   estado legal de partida.
2. `if (readConsentDecision() === 'granted') gtag('consent', 'update', GRANTED_ALL)`
   — la rehidratación.
3. `gtag('js', …)` y `gtag('config', …, { send_page_view: false })`.
4. `trackPageView(...)` — el **primer `page_view`**.

El paso 2 va antes del 4 a propósito: así el primer hit de un visitante que ya
aceptó sale con el consentimiento correcto desde el principio, en vez de salir
como ping sin cookies y corregirse después. `wait_for_update: 500` cubre el
caso simétrico —el visitante que acepta en esta misma carga— dándole medio
segundo al `update` antes de emitir.

Que todo esto funcione depende de que `dataLayer` sea una cola síncrona creada
antes que nada (§3.5): el orden del archivo es el orden real de proceso,
aunque `gtag.js` todavía no se haya descargado.

### 8.6 El banner: SSR, accesibilidad y contraste

**Sin desajuste de hidratación.** `isVisible` arranca en `false` y sólo pasa a
`true` en `onMounted`. `localStorage` no existe en el servidor, así que
cualquier intento de decidir la visibilidad durante el SSR produciría un HTML
que no coincide con el que la hidratación espera. El coste es que el banner
aparece un instante después del primer paint, lo cual es correcto: no debe
bloquear el LCP.

**Contraste, verificado sobre los tokens reales** (`app/assets/css/main.css`),
con el panel **opaco** (`bg-surface`, no translúcido) precisamente para que el
ratio sea determinista y no dependa del contenido que quede detrás:

| Elemento | Modo oscuro | Modo claro | AA (4.5:1) |
| --- | --- | --- | --- |
| Título `text-ink` sobre `bg-surface` | 19.11:1 | 16.71:1 | ✅ |
| Texto `text-ink-muted` sobre `bg-surface` | 8.32:1 | 5.40:1 | ✅ |
| "Aceptar todas": `text-brand-900` sobre `bg-neon-500` | 5.17:1 | 5.17:1 | ✅ |
| "Solo necesarias": `text-ink` sobre `bg-surface` | 19.11:1 | 16.71:1 | ✅ |

El botón primario **no** lleva texto blanco. Blanco sobre `neon-500`
(`#1f7fff`) da 3.79:1: pasa para texto grande y para componentes de interfaz,
pero **no** llega al 4.5:1 que exige AA en texto normal, y el texto de un
botón es texto normal. `text-brand-900` sobre `neon-500` llega a 5.17:1 y es
además una pareja que el proyecto ya usa (`selection:bg-neon-500
selection:text-brand-900` en el layout). Ambos son hex fijos, así que el ratio
es el mismo en los dos temas.

**Resto de accesibilidad:** `role="region"` con `aria-label` traducido — un
banner de cookies no invasivo no debe ser `role="dialog"` con foco atrapado,
porque no bloquea el resto de la página; los dos botones son `<button>`
nativos, alcanzables por teclado en orden natural; anillo de foco visible
(`focus-visible:ring-neon-300`), el mismo patrón del drawer; y la transición se
anula bajo `prefers-reduced-motion: reduce`.

**Equidad de las dos opciones.** "Solo necesarias" y "Aceptar todas" tienen el
mismo tamaño, la misma tipografía y están una al lado de la otra. Rechazar
cuesta exactamente un clic, igual que aceptar. No hay patrón oscuro, que
además de ser lo correcto es lo que exigen las autoridades de protección de
datos europeas.

**No hay botón de cerrar.** Descartar el banner sin contestar dejaría al
visitante en un limbo: bajo el RGPD, la ausencia de respuesta equivale a
rechazo, así que una "X" sería un "Solo necesarias" disfrazado. Se pide una
respuesta explícita, y hasta que llegue el estado es `denied`, que es seguro.

### 8.7 Capas y solapamiento

`z-index: 95`, elegido contra las capas que ya existen: por encima del botón
flotante de captación (90, `FloatingCtaDrawer.vue`) y por debajo del drawer y
del `ContactModal` (100/101), que tienen que poder abrirse **sobre** el
banner.

En móvil el banner ocupa el ancho y tapa el botón flotante mientras está
visible. Es deliberado: el botón sólo aparece tras cierto scroll, el banner se
va con un clic, y mientras haya una decisión pendiente es razonable que sea lo
primero. El banner se monta con `<Teleport to="body">`, igual que el drawer,
para no depender del contexto de apilamiento del layout.

### 8.8 Verificación realizada

| Comprobación | Resultado |
| --- | --- |
| `npx nuxi typecheck` | exit 0, 0 errores |
| `npm run build` | exit 0, sin warnings nuevos |
| `.nuxt/components.d.ts` declara `CommonCookieBanner` | ✅ (8.2) |
| `es.json` / `en.json` siguen siendo JSON válido, 12 claves de primer nivel | ✅ |
| El banner **no** aparece en el HTML servido por SSR | ✅ — es lo que evita el desajuste de hidratación (8.6) |
| Contraste sobre los tokens de `main.css`, ambos temas | ✅ (8.6) |

**Pendiente de validar a mano en el navegador**, que es lo que ninguna de las
comprobaciones anteriores puede sustituir:

1. Primera visita: el banner aparece; **no** existe la cookie `_ga`; los hits
   a `/g/collect` llevan `gcs=G100`.
2. "Aceptar todas": el banner se va, `localStorage.corosdev-consent` vale
   `granted`, aparece `_ga` y los hits pasan a `gcs=G111`.
3. Recarga: el banner **no** vuelve y los hits salen ya con `gcs=G111` desde
   el primero (8.5).
4. "Solo necesarias" en un perfil limpio: `corosdev-consent` vale `denied`,
   sin `_ga`, y el banner tampoco vuelve.
5. Navegación SPA entre páginas: un `page_view` por ruta, con el `page_title`
   de la página de destino (§3.7).
6. Los dos temas y el foco por teclado (Tab llega a ambos botones con anillo
   visible).

### 8.9 Lo que sigue pendiente

1. **No hay página de política de privacidad.** El proyecto no tiene ninguna
   ruta `/privacy` ni equivalente (`app/pages/` sólo contiene about,
   ecosystem, index, partners, services, blog y portfolio), así que el texto
   del banner no enlaza a ningún sitio. Un banner de consentimiento sin
   política enlazada es incompleto de cara al RGPD: **falta la página, no el
   enlace**. En cuanto exista, hay que añadir el `<NuxtLink>` en
   `CookieBanner.vue` y su clave de traducción.
2. **No se puede cambiar de opinión.** Una vez decidido, el banner no vuelve.
   El RGPD exige que retirar el consentimiento sea tan fácil como darlo, así
   que hace falta un punto de reentrada — lo natural es un enlace "Cookies" en
   `AppFooter.vue` que borre la clave y vuelva a mostrar el banner.
3. **Sigue vigente el §5.1**: desactivar en GA4 "Cambios de página basados en
   eventos del historial del navegador", o cada navegación interna se cuenta
   el doble.
4. **Instrumentar `generate_lead` y `drawer_interaction`** (§7.6): el plugin
   expone la vía, ningún componente la llama todavía.

### 8.10 Diagnóstico: "Tiempo real no registra usuarios" (2026-09-22)

Tras desplegar `fcbc66b`, el panel de GA4 seguía sin mostrar usuarios en
Tiempo real. Se plantearon dos hipótesis; **sólo una resultó cierta**, y
conviene dejar registrado cómo se descartó la otra, porque la corrección que
sugería habría hecho daño.

#### Hipótesis descartada: "el Measurement ID llega vacío en Producción"

Comprobado **contra el sitio en vivo**, no contra el código. `curl` a
`https://corosdev.com/` (302 → `/es`, por el middleware de geolocalización)
devuelve en el payload del documento:

```
window.__NUXT__.config={public:{turnstile:{…},gaMeasurementId:"G-V5BRG0MELC",…
```

El ID está horneado y es el correcto. La cadena de resolución del §3.4
funciona: `VERCEL_ENV` sí está expuesto durante el build en Vercel y el
fallback se aplica. De paso se verificaron las cabeceras reales:

| Directiva en vivo | Contiene |
| --- | --- |
| `connect-src` | los cuatro hosts de Google del §2 ✅ |
| `img-src` | `*.google-analytics.com`, `www.googletagmanager.com` ✅ |
| `script-src` | `'strict-dynamic'` + nonce ✅ |

Y el CSS del banner (`.cookie-banner`) viaja en el HTML servido, así que el
§8 está efectivamente desplegado.

**Por eso NO se cambió el fallback a incondicional.** Convertir
`?? (VERCEL_ENV === 'production' ? 'G-V5BRG0MELC' : '')` en `?? 'G-V5BRG0MELC'`
no habría arreglado nada —el valor ya llega— y habría reintroducido el
problema que el §3.3 existe para evitar, ampliado: cada deploy de Preview
*y además* cada `npm run dev` en local mandarían su tráfico de pruebas a la
propiedad viva, ensuciando justo las métricas que se intentaba leer.

#### Causa real: consentimiento denegado y ningún `page_view` tras aceptar

El sitio se comporta como está diseñado; lo que faltaba era el último eslabón.

1. El estado de partida es `denied` (8.5), correcto y obligatorio.
2. Con `analytics_storage: 'denied'`, gtag sí emite a `/g/collect`, pero como
   **ping sin cookies**. Google los usa para modelar; **no alimentan el
   informe de Tiempo real**, que necesita un `client_id`. Un visitante que no
   ha contestado al banner es, para Tiempo real, invisible — por diseño.
3. Al pulsar "Aceptar todas", el consentimiento pasaba a `granted`… pero el
   único `page_view` de esa carga **ya se había enviado**, sin cookies, antes
   de aceptar. GA4 no reenvía nada por su cuenta. Así que la sesión no
   aparecía hasta que el visitante navegara a otra ruta, y si aceptaba y se
   quedaba en la página —o se iba—, no aparecía nunca.

En otras palabras: Tiempo real vacío no era un fallo de configuración, era
que **nadie llegaba a contar como usuario consentido**.

#### El ajuste

`gtag.consent()` detecta ahora la transición de denegado a concedido y
reemite el `page_view` de la ruta actual, ya con el consentimiento aplicado:

```ts
if (next.analytics_storage === 'granted' && previous !== 'granted') {
  trackPageView(router.currentRoute.value.fullPath, true)
}
```

Tres detalles deliberados:

- **`previous` se lee antes de persistir.** Si se leyera después, la
  comparación siempre daría "ya estaba concedido" y no se reemitiría nunca.
- **La guarda es la transición, no el valor.** Llamar a `grantAll()` dos
  veces (o recargar con el consentimiento ya dado) no duplica la vista: sólo
  dispara el cruce `denied → granted`.
- **`trackPageView` acepta `force`.** La guarda por `fullPath` del §3.6 sigue
  protegiendo la navegación SPA; este es el único caso que puede saltársela,
  porque aquí reemitir la misma ruta es exactamente la intención.

Vive en `gtag.consent()` y no en `CookieBanner.vue` para que valga igual desde
cualquier futuro punto de reentrada (8.9.2) sin repetir la lógica.

#### Cómo confirmarlo

Perfil limpio, con Tiempo real abierto en otra pestaña:

1. Entrar al sitio, **no** tocar el banner → Tiempo real sigue en 0, y los
   hits a `/g/collect` llevan `gcs=G100`. Es lo correcto.
2. Pulsar "Aceptar todas" → sale **un** `/g/collect` nuevo con `gcs=G111` y
   `en=page_view`, sin navegar a ninguna parte. Tiempo real pasa a 1 usuario
   en unos segundos.
3. Recargar → el banner no vuelve y el primer hit ya sale con `gcs=G111`
   (8.5). Tiempo real **no** debe sumar un segundo usuario: es la misma
   cookie `_ga`.

Si el paso 2 no produce el hit, mirar un bloqueador de anuncios antes que el
código: casi todos filtran `googletagmanager.com` por nombre de host, y eso es
indistinguible de un fallo de CSP salvo por el mensaje de la consola.

---

## 9. Cambio de estrategia: `analytics_storage` concedido por defecto

**Este apartado sustituye al estado de partida descrito en 7.4 y 8.5.** Lo
demás de esos apartados (orden de la cola, `wait_for_update`, rehidratación)
sigue vigente; lo que cambia es el valor inicial de una de las cuatro señales.

### 9.1 Qué cambia

| Señal | Antes (7.4) | Ahora |
| --- | --- | --- |
| `analytics_storage` | `denied` | **`granted`** |
| `ad_storage` | `denied` | `denied` |
| `ad_user_data` | `denied` | `denied` |
| `ad_personalization` | `denied` | `denied` |

Motivo: con analítica denegada de partida, un visitante que no contesta al
banner es invisible para el informe de Tiempo real (8.10), y en la práctica
eso dejaba el panel vacío. Concediendo `analytics_storage` desde el primer
hit, cada visita cuenta desde que entra.

Los tres flags de publicidad siguen denegados hasta que alguien pulse
"Aceptar todas", que es lo que Consent Mode v2 exige declarar y lo que el
§7.5 describe respecto a la CSP: mientras `ad_storage` siga denegado no hay
tráfico a hosts de Google Ads y las directivas actuales bastan.

### 9.2 El coste, dicho con claridad

`analytics_storage: 'granted'` **escribe la cookie `_ga` antes de que el
visitante haya contestado nada**. En la UE/EEE, el artículo 5(3) de la
ePrivacy exige consentimiento *previo* para almacenar cookies que no sean
estrictamente necesarias, y las de analítica no lo son según el criterio de
las autoridades europeas. El §6 ya dejaba registrado que hay presencia y
partners en la UE.

Es una decisión de negocio, tomada a sabiendas, no un descuido de
implementación: el banner sigue ahí, sigue preguntando, y "Solo necesarias"
sigue significando cero publicidad. Lo que deja de existir es el bloqueo
previo de la analítica. Si en algún momento se quiere revertir, es un solo
valor en `app/utils/consent.ts` (`ESSENTIAL_ONLY.analytics_storage`).

### 9.3 Dos estados, no tres

Con este cambio, el estado por defecto y el resultado de "Solo necesarias"
son **idénticos**: analítica sí, publicidad no. Por eso ambos comparten la
misma constante, `ESSENTIAL_ONLY`, que reemplaza a `DENIED_ALL` (que ya no
existe: no quedaba ningún camino que denegara las cuatro señales).

Lo que se persiste bajo `corosdev-consent` sigue siendo la cadena del 8.3,
pero **`'denied'` ya no significa "nada concedido"**, sino "sólo lo
necesario". La rehidratación al arrancar queda así:

| Valor guardado | Estado aplicado |
| --- | --- |
| `'granted'` | `GRANTED_ALL` — las cuatro señales |
| `'denied'` | `ESSENTIAL_ONLY` — analítica sí, publicidad no |
| ausente (aún no ha contestado) | `ESSENTIAL_ONLY` — y se muestra el banner |

Esto es lo que hace que "Solo necesarias" **sobreviva a la recarga** con la
analítica todavía concedida. Con el modelo anterior, `'denied'` rehidrataba
a `DENIED_ALL` y habría apagado la analítica en la segunda visita, en
contradicción directa con la estrategia que este apartado implanta.

### 9.4 `denyAll()` pasa a llamarse `essentialOnly()`

Renombrado a propósito, y no es cosmética. El método concede ahora
`analytics_storage`; seguir llamándolo `denyAll()` habría dejado en la API un
nombre que miente sobre lo que hace, y el primero que lo llamara esperando un
opt-out completo habría enviado datos sin saberlo. `CookieBanner.vue` y el
`$gtag` inerte se actualizaron en el mismo cambio; no quedan referencias al
nombre anterior.

`$gtag.grantAll()` no cambia.

### 9.5 El doble conteo que este cambio habría introducido

Es la parte no evidente. El reemisor de `page_view` del 8.10 se guardaba
contra **el valor persistido**:

```ts
if (next.analytics_storage === 'granted' && previous !== 'granted') { … }
```

Con la analítica denegada de partida eso era correcto. Con la analítica
**concedida** de partida, deja de serlo: en una primera visita no hay nada
guardado, así que `previous` es `null`, la condición se cumple… pero el
`page_view` inicial **ya se envió con el consentimiento puesto**. Pulsar
"Aceptar todas" habría emitido una segunda vista idéntica de la misma página,
inflando las métricas justo en la acción que más interesa medir.

La guarda pasa por tanto a seguir el estado **efectivo en memoria**, no el
resumen guardado:

```ts
let analyticsGranted = baseConsent().analytics_storage === 'granted'
…
if (next.analytics_storage === 'granted' && !analyticsGranted) {
  trackPageView(router.currentRoute.value.fullPath, true)
}
analyticsGranted = next.analytics_storage === 'granted'
```

Con la estrategia actual `analyticsGranted` arranca en `true`, así que el
reemisor **no dispara nunca** por el camino del banner: ya no hace falta,
porque el primer hit sale consentido. Se conserva porque sigue siendo la
red de seguridad correcta si alguien llama a
`$gtag.consent({ analytics_storage: 'denied' })` y más tarde vuelve a
conceder — y, sobre todo, porque es la línea que impide el doble conteo.

### 9.6 Verificación

| Comprobación | Resultado |
| --- | --- |
| `npx nuxi typecheck` | exit 0, 0 errores |
| `npm run build` | exit 0, sin warnings nuevos |
| Referencias huérfanas a `DENIED_ALL` / `denyAll` | ninguna en `app/` |

En el navegador, con perfil limpio y sin bloqueador:

1. Entrar y **no** tocar el banner → la cookie `_ga` **sí** aparece, los hits
   llevan `gcs=G111`, y Tiempo real suma el usuario de inmediato. Éste es
   todo el objetivo del cambio.
2. "Solo necesarias" → `corosdev-consent` vale `denied`, `_ga` sigue ahí, y
   el parámetro `gcd` refleja publicidad denegada. **No** debe aparecer un
   segundo `page_view` de la misma ruta (9.5).
3. Recargar → el banner no vuelve y la analítica sigue concedida (9.3).
4. "Aceptar todas" en otro perfil limpio → `corosdev-consent` vale `granted`
   y, de nuevo, **una sola** vista por ruta.

El paso 2 es el que hay que mirar con más cuidado: un `page_view` duplicado
ahí sería la regresión del 9.5.
