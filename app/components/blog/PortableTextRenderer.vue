<script setup lang="ts">
/**
 * Renderiza el cuerpo (`body`) de un artículo con `@portabletext/vue`.
 *
 * El mapa de componentes es deliberadamente corto: cada estilo declarado en
 * `sanity/schemaTypes/blockContent.ts` tiene aquí su pareja. `onMissingComponent`
 * se pasa como `false` para que un bloque de un tipo que aún no soportamos
 * degrade a texto plano en silencio, sin volcar warnings en consola ni
 * romper el render.
 *
 * La tipografía la hereda de `--font-sans` (Plus Jakarta Sans, aplicada en
 * `html` desde `main.css`); aquí sólo se define ritmo vertical, escala y
 * color sobre los tokens de marca.
 */
import { h } from 'vue'
import { PortableText } from '@portabletext/vue'
import type { PortableTextComponents } from '@portabletext/vue'
import { SanityImage } from '#components'

const props = defineProps<{ value: any[] }>()

const children = (ctx: any) => ctx.slots.default?.()

const components: PortableTextComponents = {
  block: {
    normal: (_p: any, ctx: any) => h('p', children(ctx)),
    h2: (_p: any, ctx: any) => h('h2', children(ctx)),
    h3: (_p: any, ctx: any) => h('h3', children(ctx)),
    h4: (_p: any, ctx: any) => h('h4', children(ctx)),
    blockquote: (_p: any, ctx: any) => h('blockquote', children(ctx)),
  },
  marks: {
    strong: (_p: any, ctx: any) => h('strong', children(ctx)),
    em: (_p: any, ctx: any) => h('em', children(ctx)),
    code: (_p: any, ctx: any) => h('code', children(ctx)),
    link: (p: any, ctx: any) => {
      const external = Boolean(p.value?.blank)
      return h(
        'a',
        {
          href: p.value?.href ?? '#',
          ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        },
        children(ctx),
      )
    },
  },
  types: {
    image: (p: any) => {
      const asset = p.value?.asset?._ref
      if (!asset) return null
      return h('figure', { class: 'pt-figure' }, [
        h(SanityImage, { assetId: asset, auto: 'format', alt: p.value?.alt ?? '' }),
        p.value?.caption ? h('figcaption', p.value.caption) : null,
      ])
    },
  },
}
</script>

<template>
  <div class="pt">
    <PortableText :value="props.value" :components="components" :on-missing-component="false" />
  </div>
</template>

<style scoped>
.pt {
  color: rgb(255 255 255 / 0.72);
  font-size: 1.0625rem;
  line-height: 1.8;
}

.pt :deep(p) {
  margin: 1.5em 0;
}

.pt :deep(h2),
.pt :deep(h3),
.pt :deep(h4) {
  color: #fff;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  scroll-margin-top: 6rem;
}

.pt :deep(h2) {
  margin: 2.4em 0 0.8em;
  font-size: 1.75rem;
}

.pt :deep(h3) {
  margin: 2em 0 0.6em;
  font-size: 1.375rem;
}

.pt :deep(h4) {
  margin: 1.8em 0 0.5em;
  font-size: 1.125rem;
}

.pt :deep(:is(h2, h3, h4) + p) {
  margin-top: 0;
}

.pt :deep(a) {
  color: var(--color-neon-300);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
  transition: color 0.2s var(--ease-out-expo);
}

.pt :deep(a:hover) {
  color: var(--color-neon-100);
}

.pt :deep(strong) {
  color: #fff;
  font-weight: 700;
}

.pt :deep(ul),
.pt :deep(ol) {
  margin: 1.5em 0;
  padding-left: 1.5em;
}

.pt :deep(li) {
  margin: 0.5em 0;
}

.pt :deep(ul) {
  list-style: disc;
}

.pt :deep(ol) {
  list-style: decimal;
}

.pt :deep(li::marker) {
  color: var(--color-neon-500);
}

.pt :deep(blockquote) {
  margin: 2em 0;
  padding: 0.25em 0 0.25em 1.25em;
  border-left: 2px solid var(--color-neon-500);
  color: rgb(255 255 255 / 0.85);
  font-size: 1.1875rem;
  font-style: italic;
}

.pt :deep(code) {
  padding: 0.15em 0.4em;
  border-radius: 0.35rem;
  background: rgb(255 255 255 / 0.08);
  font-size: 0.9em;
  font-family: ui-monospace, "SFMono-Regular", "Menlo", monospace;
}

.pt :deep(.pt-figure) {
  margin: 2.5em 0;
}

.pt :deep(.pt-figure img) {
  width: 100%;
  height: auto;
  border-radius: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.1);
}

.pt :deep(.pt-figure figcaption) {
  margin-top: 0.75em;
  font-size: 0.8125rem;
  color: rgb(255 255 255 / 0.45);
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .pt :deep(a) {
    transition: none;
  }
}
</style>
