import { z } from 'zod'

const bookmarkSchema = z.object({
   url: z
      .string()
      .trim()
      .min(1, 'URL is required')
      .url('Please enter a valid URL')
      .max(2048, 'URL is too long'),
   title: z
      .string()
      .trim()
      .max(200, 'Title is too long')
      .optional(),
})

type FieldErrors = {
   url?: string
   title?: string
}

const validateBookmark = (input: { url: string; title: string }): { success: true; data: { url: string; title?: string } } | { success: false; errors: FieldErrors } => {
   const titleTrimmed = input.title.trim()
   const candidate = { url: input.url, title: titleTrimmed === '' ? undefined : titleTrimmed }
   const result = bookmarkSchema.safeParse(candidate)

   if (result.success) return { success: true, data: result.data }

   const errors: FieldErrors = {}

   for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (field === 'url' && !errors.url) errors.url = issue.message
      if (field === 'title' && !errors.title) errors.title = issue.message
   }

   return { success: false, errors }
}

export { bookmarkSchema, validateBookmark }
export type { FieldErrors }
