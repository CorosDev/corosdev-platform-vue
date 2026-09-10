/**
 * Reusable SEO / meta-tags object.
 *
 * Embedded on `post` (and available to any future document type). Every field
 * is optional: when a value is missing the /blog pages are expected to fall
 * back to the post's own title / excerpt / cover image, so a half-filled SEO
 * block never produces empty <meta> tags.
 */
export default {
  name: 'seo',
  title: 'SEO & Meta Tags',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    {
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      description: 'Overrides the <title> tag. ~60 characters or Google truncates it.',
      validation: (Rule: any) => Rule.max(60).warning('Longer titles get truncated in search results.'),
    },
    {
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: 'The <meta name="description"> snippet. Aim for 150–160 characters.',
      validation: (Rule: any) => Rule.max(160).warning('Longer descriptions get truncated in search results.'),
    },
    {
      name: 'keywords',
      title: 'Focus keywords',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    },
    {
      name: 'ogImage',
      title: 'Social share image (Open Graph)',
      type: 'image',
      description: 'Falls back to the article cover image when empty. Ideal size 1200×630.',
      options: { hotspot: true },
    },
    {
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description: 'Emits <meta name="robots" content="noindex">. Off by default.',
      initialValue: false,
    },
  ],
}
