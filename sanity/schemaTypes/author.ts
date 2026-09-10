/**
 * Article author. Referenced from `post.author`.
 */
export default {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'role',
      title: 'Role / job title',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt text', type: 'string' }],
    },
    {
      name: 'bio',
      title: 'Short bio',
      type: 'text',
      rows: 3,
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'image' },
  },
}
