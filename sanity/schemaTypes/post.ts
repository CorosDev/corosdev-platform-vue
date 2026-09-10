/**
 * Blog article — the core document behind /blog and /blog/[slug].
 *
 * Field set requested for Phase 1: Título, Slug, Imagen de portada,
 * Contenido Rich Text, Autor, Categoría y Meta Tags SEO. `excerpt` and
 * `publishedAt` are added because the /blog index and the article header
 * can't function without a summary and a date.
 */
export default {
  name: 'post',
  title: 'Article',
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
      description: 'The URL segment: /blog/<slug>.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Plain-text summary for the blog index and as the SEO description fallback.',
      validation: (Rule: any) => Rule.max(200),
    },
    {
      name: 'mainImage',
      title: 'Cover image',
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
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule: any) => Rule.required(),
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category.title',
      media: 'mainImage',
      date: 'publishedAt',
    },
    prepare({ title, subtitle, media, date }: Record<string, any>) {
      const when = date ? new Date(date).toLocaleDateString() : 'unpublished'
      return { title, subtitle: [subtitle, when].filter(Boolean).join(' · '), media }
    },
  },
}
