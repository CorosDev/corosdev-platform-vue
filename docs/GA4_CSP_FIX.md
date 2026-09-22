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
