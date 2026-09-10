/**
 * Case study — the core document behind /portfolio and /portfolio/[slug]
 * ("Portfolio & Case Studies Engine").
 *
 * Field set requested for this phase: title, slug, client, industry,
 * heroImage, summary, keyMetrics, technologies, body and seo (the shared
 * `seo` object). `publishedAt` and `featured` are added — same reasoning as
 * `post.ts` — because the portfolio index needs an ordering date and a way
 * to surface one highlighted study, and neither can be derived after the
 * fact.
 */
export default {
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required().min(3).max(120),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The URL segment: /portfolio/<slug>.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'client',
      title: 'Client',
      type: 'string',
      description: 'Name of the client / company the work was delivered for.',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'industry',
      title: 'Industry',
      type: 'string',
      description: 'Sector the client operates in — drives the portfolio filter facets.',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule: any) => Rule.required(),
        },
      ],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Plain-text overview for the portfolio card and the SEO description fallback.',
      validation: (Rule: any) => Rule.required().max(280),
    },
    {
      name: 'keyMetrics',
      title: 'Key metrics',
      type: 'array',
      description: 'Headline outcomes shown as a stat row on the case study.',
      of: [
        {
          type: 'object',
          name: 'metric',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'What is being measured, e.g. "Conversion rate" or "Time to deploy".',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'value',
              title: 'Value',
              type: 'string',
              description: 'The headline figure, e.g. "3.2x", "$1.4M", "-1.5s".',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'impact',
              title: 'Change / impact',
              type: 'string',
              description: 'Optional context for the delta, e.g. "+180% YoY" or "vs. prior quarter".',
            },
          ],
          preview: {
            select: { title: 'value', subtitle: 'label', impact: 'impact' },
            prepare({ title, subtitle, impact }: Record<string, any>) {
              return { title: [title, impact].filter(Boolean).join('  ·  '), subtitle }
            },
          },
        },
      ],
    },
    {
      name: 'technologies',
      title: 'Technologies',
      // Free-text tags for the stack. Sanity forbids an array `of` that mixes
      // a primitive (`string`) with an object type (`reference`), so this is
      // strings only — cross-linking to `category` docs, if ever needed,
      // would be a separate reference array.
      type: 'array',
      description: 'Stack used — type each technology name and press enter.',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Surfaces this study in the highlighted slot of the portfolio index.',
      initialValue: false,
    },
    {
      name: 'body',
      title: 'Content',
      type: 'blockContent',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'seo',
      title: 'SEO & Meta Tags',
      type: 'seo',
    },
  ],
  orderings: [
    {
      title: 'Published date, newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Client (A–Z)',
      name: 'clientAsc',
      by: [{ field: 'client', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      client: 'client',
      industry: 'industry',
      media: 'heroImage',
    },
    prepare({ title, client, industry, media }: Record<string, any>) {
      return { title, subtitle: [client, industry].filter(Boolean).join(' · '), media }
    },
  },
}
