/**
 * End-to-end check: posts through the real Nitro endpoints and then asks the
 * Brevo API whether the contact actually landed, in which list, and with
 * which attributes. Run with the built server already listening on :3000.
 */
import fs from 'node:fs'

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

const key = env.NUXT_BREVO_API_KEY
if (!key) {
  console.error('\n  NUXT_BREVO_API_KEY is empty in .env — paste the key there first.\n')
  process.exit(1)
}

const stamp = Date.now()
const cases = [
  {
    label: 'Contact form  -> list ' + env.NUXT_BREVO_CONTACT_LIST_ID,
    path: '/api/contact',
    listId: Number(env.NUXT_BREVO_CONTACT_LIST_ID),
    email: `corosdev.test.contact.${stamp}@mailinator.com`,
    body: (email) => ({
      name: 'Prueba Contacto',
      email,
      company: 'CorosDev QA',
      interest: 'Soluciones de IA e Integración',
      message: 'Envío de prueba automatizado.',
    }),
    expect: { NOMBRE: 'Prueba Contacto', COMPANY: 'CorosDev QA', INTEREST: 'Soluciones de IA e Integración', MESSAGE: 'Envío de prueba automatizado.', SOURCE: 'contact_section' },
  },
  {
    label: 'CTA drawer    -> list ' + env.NUXT_BREVO_CTA_LIST_ID,
    path: '/api/subscribe',
    listId: Number(env.NUXT_BREVO_CTA_LIST_ID),
    email: `corosdev.test.cta.${stamp}@mailinator.com`,
    body: (email) => ({
      name: 'Prueba Ecosistema',
      email,
      role: 'Inversor Ángel / VC',
      message: 'Envío de prueba automatizado.',
      context: 'ecosystem',
    }),
    expect: { NOMBRE: 'Prueba Ecosistema', INTEREST: 'Inversor Ángel / VC', MESSAGE: 'Envío de prueba automatizado.', SOURCE: 'cta_drawer_ecosystem' },
  },
]

let allOk = true
for (const c of cases) {
  console.log('\n─── ' + c.label + ' ───')
  const post = await fetch('http://localhost:3000' + c.path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(c.body(c.email)),
  })
  console.log('  POST ' + c.path + ' -> ' + post.status + (post.status === 200 ? '  OK' : '  FALLO: ' + (await post.text()).slice(0, 200)))
  if (post.status !== 200) { allOk = false; continue }

  const res = await fetch('https://api.brevo.com/v3/contacts/' + encodeURIComponent(c.email), {
    headers: { 'api-key': key, accept: 'application/json' },
  })
  if (!res.ok) { console.log('  Brevo lookup -> ' + res.status + '  FALLO'); allOk = false; continue }
  const contact = await res.json()

  const inList = (contact.listIds || []).includes(c.listId)
  console.log('  listIds: ' + JSON.stringify(contact.listIds) + (inList ? '  OK (esperada ' + c.listId + ')' : '  FALLO: esperaba ' + c.listId))
  if (!inList) allOk = false

  for (const [k, v] of Object.entries(c.expect)) {
    const got = contact.attributes?.[k]
    const ok = got === v
    if (!ok) allOk = false
    console.log('  ' + k.padEnd(9) + (ok ? 'OK  ' : 'FALLO  ') + JSON.stringify(got))
  }
}

console.log('\n' + (allOk ? 'RESULTADO: todos los contactos entraron con sus atributos.' : 'RESULTADO: hay fallos, revisar arriba.') + '\n')
process.exit(allOk ? 0 : 1)
