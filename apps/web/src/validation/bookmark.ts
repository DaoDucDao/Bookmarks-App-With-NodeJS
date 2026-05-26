import { z } from 'zod'
import type { ApiIssue } from '../api/client'

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

type BookmarkFormField = 'url' | 'title'

const applyApiIssuesToForm = (
   issues: ApiIssue[] | undefined,
   setError: (field: BookmarkFormField, error: { message: string }) => void,
): boolean => {
   if (!issues) return false
   const seen = new Set<BookmarkFormField>()

   for (const issue of issues) {
      const field = issue.path[0]
      if ((field === 'url' || field === 'title') && !seen.has(field)) {
         setError(field, { message: issue.message })
         seen.add(field)
      }
   }

   return seen.size > 0
}

export { bookmarkSchema, applyApiIssuesToForm }
export type { BookmarkFormField }
