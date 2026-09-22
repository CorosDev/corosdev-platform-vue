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
