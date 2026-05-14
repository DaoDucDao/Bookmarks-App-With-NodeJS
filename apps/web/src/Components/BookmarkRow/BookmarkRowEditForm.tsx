import React, { useState } from 'react'
import {
   updateBookmark,
   addTagToBookmark,
   removeTagFromBookmark,
   type Bookmark,
} from '../../api/bookmarks'
import { validateBookmark, type FieldErrors } from '../../validation/bookmark'

type Props = {
   bookmark: Bookmark
   loadBookmarks: () => Promise<void>
   loadTags: () => Promise<void>
   setEditing: (editing: boolean) => void
}

const inputBaseClass =
   'rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 disabled:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800'

const inputNormalBorderClass = 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700'

const inputErrorBorderClass = 'border-red-500 focus:border-red-600 focus:ring-red-500 dark:border-red-500'

const inputClass = (hasError: boolean) =>
   `${inputBaseClass} ${hasError ? inputErrorBorderClass : inputNormalBorderClass}`

const cancelButtonClass =
   'cursor-pointer rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'

const tagChipClass =
   'inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300'

const tagRemoveButtonClass =
   'cursor-pointer rounded-full px-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'

const addTagButtonClass =
   'cursor-pointer rounded-md border border-blue-300 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-900/60 dark:text-blue-400 dark:hover:bg-blue-950/40'

const BookmarkRowEditForm = ({ bookmark, loadBookmarks, loadTags, setEditing }: Props) => {
   const [url, setUrl] = useState(bookmark.url)
   const [title, setTitle] = useState(bookmark.title ?? '')
   const [submitting, setSubmitting] = useState(false)
   const [submitError, setSubmitError] = useState<string | null>(null)
   const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

   const [tagInput, setTagInput] = useState('')
   const [tagBusy, setTagBusy] = useState(false)
   const [tagError, setTagError] = useState<string | null>(null)

   const cancelEdit = () => setEditing(false)

   const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
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
         await updateBookmark(bookmark.id, result.data)
         setEditing(false)
         await loadBookmarks()
      } catch (error) {
         console.log(error)
         setSubmitError('Failed to save')
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

   const handleAddTag = async () => {
      const trimmed = tagInput.trim()
      if (!trimmed) return

      setTagBusy(true)
      setTagError(null)

      try {
         await addTagToBookmark(bookmark.id, trimmed)
         setTagInput('')
         await Promise.allSettled([loadBookmarks(), loadTags()])
      } catch (error) {
         console.log(error)
         setTagError('Failed to add tag')
      } finally {
         setTagBusy(false)
      }
   }

   const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
         event.preventDefault()
         handleAddTag()
      }
   }

   const handleRemoveTag = (tagId: number) => async () => {
      setTagBusy(true)
      setTagError(null)

      try {
         await removeTagFromBookmark(bookmark.id, tagId)
         await loadBookmarks()
      } catch (error) {
         console.log(error)
         setTagError('Failed to remove tag')
      } finally {
         setTagBusy(false)
      }
   }

   return (
      <li className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
         <form onSubmit={handleSave} noValidate className="grid gap-2">
            <div className="grid gap-1">
               <input
                  type="url"
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

            <div className="grid gap-1">
               <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Tags</span>

               <div className="flex flex-wrap items-center gap-2">
                  {bookmark.tags.map((tag) => (
                     <span key={tag.id} className={tagChipClass}>
                        {tag.name}
                        <button
                           type="button"
                           onClick={handleRemoveTag(tag.id)}
                           disabled={tagBusy}
                           aria-label={`Remove tag ${tag.name}`}
                           className={tagRemoveButtonClass}
                        >
                           ×
                        </button>
                     </span>
                  ))}

                  <input
                     type="text"
                     placeholder="Add a tag…"
                     value={tagInput}
                     onChange={(event) => setTagInput(event.target.value)}
                     onKeyDown={handleTagInputKeyDown}
                     disabled={tagBusy}
                     className={`${inputClass(false)} px-2 py-1 text-xs`}
                  />

                  <button
                     type="button"
                     onClick={handleAddTag}
                     disabled={tagBusy || !tagInput.trim()}
                     className={addTagButtonClass}
                  >
                     {tagBusy ? '…' : '+ Add'}
                  </button>
               </div>

               {tagError && <p className="text-xs text-red-600 dark:text-red-400">{tagError}</p>}
            </div>

            <div className="flex gap-2">
               <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
               >
                  {submitting ? 'Saving…' : 'Save'}
               </button>

               <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={submitting}
                  className={cancelButtonClass}
               >
                  Cancel
               </button>
            </div>

            {submitError && <p className="m-0 text-sm text-red-600 dark:text-red-400">{submitError}</p>}
         </form>
      </li>
   )
}

export default BookmarkRowEditForm
