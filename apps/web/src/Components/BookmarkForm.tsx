import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { createBookmark } from '../api/bookmarks'
import { ApiError } from '../api/client'
import { bookmarkSchema, applyApiIssuesToForm } from '../validation/bookmark'

type Props = {
   loadBookmarks: () => Promise<void>
}

type FormValues = z.infer<typeof bookmarkSchema>

const inputBaseClass =
   'rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 disabled:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800'

const inputNormalBorderClass = 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700'

const inputErrorBorderClass = 'border-red-500 focus:border-red-600 focus:ring-red-500 dark:border-red-500'

const inputClass = (hasError: boolean) =>
   `${inputBaseClass} ${hasError ? inputErrorBorderClass : inputNormalBorderClass}`

const BookmarkForm = ({ loadBookmarks }: Props) => {
   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      setError,
      reset,
   } = useForm<FormValues>({
      resolver: zodResolver(bookmarkSchema),
      defaultValues: { url: '', title: '' },
   })

   const [submitError, setSubmitError] = useState<string | null>(null)

   const onSubmit = handleSubmit(async (values) => {
      setSubmitError(null)

      const payload = { url: values.url, title: values.title || undefined }

      try {
         await createBookmark(payload)
         reset()
         await loadBookmarks()
      } catch (error) {
         if (error instanceof ApiError && applyApiIssuesToForm(error.issues, setError)) {
            return
         }
         setSubmitError(error instanceof ApiError ? error.message : 'Failed to create bookmark')
      }
   })

   return (
      <form
         onSubmit={onSubmit}
         noValidate
         className="mb-6 grid gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
         <div className="grid gap-1">
            <label htmlFor="bookmark-form-url" className="sr-only">
               Bookmark URL
            </label>
            <input
               id="bookmark-form-url"
               type="url"
               placeholder="https://example.com"
               disabled={isSubmitting}
               aria-invalid={Boolean(errors.url)}
               aria-describedby={errors.url ? 'bookmark-form-url-error' : undefined}
               className={inputClass(Boolean(errors.url))}
               {...register('url')}
            />

            {errors.url && (
               <p id="bookmark-form-url-error" role="alert" className="text-xs text-red-600 dark:text-red-400">
                  {errors.url.message}
               </p>
            )}
         </div>

         <div className="grid gap-1">
            <label htmlFor="bookmark-form-title" className="sr-only">
               Bookmark title (optional)
            </label>
            <input
               id="bookmark-form-title"
               type="text"
               placeholder="Title (optional)"
               disabled={isSubmitting}
               aria-invalid={Boolean(errors.title)}
               aria-describedby={errors.title ? 'bookmark-form-title-error' : undefined}
               className={inputClass(Boolean(errors.title))}
               {...register('title')}
            />

            {errors.title && (
               <p id="bookmark-form-title-error" role="alert" className="text-xs text-red-600 dark:text-red-400">
                  {errors.title.message}
               </p>
            )}
         </div>

         <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
         >
            {isSubmitting ? 'Adding…' : 'Add bookmark'}
         </button>

         {submitError && (
            <p role="alert" className="m-0 text-sm text-red-600 dark:text-red-400">
               {submitError}
            </p>
         )}
      </form>
   )
}

export default BookmarkForm
