import React, { useState } from 'react'
import { createBookmark, type Bookmark } from '../api/bookmarks'
import { validateBookmark, type FieldErrors } from '../validation/bookmark'

type Props = {
   addBookmark: (bookmark: Bookmark) => void
}

const inputBaseClass =
   'rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 disabled:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800'

const inputNormalBorderClass = 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700'

const inputErrorBorderClass = 'border-red-500 focus:border-red-600 focus:ring-red-500 dark:border-red-500'

const inputClass = (hasError: boolean) =>
   `${inputBaseClass} ${hasError ? inputErrorBorderClass : inputNormalBorderClass}`

const BookmarkForm = ({ addBookmark }: Props) => {
   const [url, setUrl] = useState('')
   const [title, setTitle] = useState('')
   const [submitting, setSubmitting] = useState(false)
   const [submitError, setSubmitError] = useState<string | null>(null)
   const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const result = validateBookmark({ url, title })

      if (!result.success) {
         setFieldErrors(result.errors)

         return
      }

      setFieldErrors({})
      setSubmitting(true)
      setSubmitError(null)

      try {
         const created = await createBookmark(result.data)
         addBookmark(created)
         setUrl('')
         setTitle('')
      } catch (error) {
         console.log(error)
         setSubmitError('Failed to create bookmark')
      } finally {
         setSubmitting(false)
      }
   }

   const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(event.target.value)
      if (fieldErrors.url) setFieldErrors((prev) => ({ ...prev, url: undefined }))
   }

   const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value)
      if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }))
   }

   return (
      <form onSubmit={handleSubmit} noValidate className="mb-6 grid gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
         <div className="grid gap-1">
            <input
               type="url"
               placeholder="https://example.com"
               value={url}
               onChange={handleUrlChange}
               disabled={submitting}
               aria-invalid={Boolean(fieldErrors.url)}
               className={inputClass(Boolean(fieldErrors.url))}
            />

            {fieldErrors.url && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.url}</p>}
         </div>

         <div className="grid gap-1">
            <input
               type="text"
               placeholder="Title (optional)"
               value={title}
               onChange={handleTitleChange}
               disabled={submitting}
               aria-invalid={Boolean(fieldErrors.title)}
               className={inputClass(Boolean(fieldErrors.title))}
            />

            {fieldErrors.title && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.title}</p>}
         </div>

         <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
         >
            {submitting ? 'Adding…' : 'Add bookmark'}
         </button>

         {submitError && <p className="m-0 text-sm text-red-600 dark:text-red-400">{submitError}</p>}
      </form>
   )
}

export default BookmarkForm
