import React, { useState } from 'react'
import { updateBookmark, deleteBookmark, type Bookmark } from '../api/bookmarks'

type Props = {
   bookmark: Bookmark
   replaceBookmark: (bookmark: Bookmark) => void
   removeBookmark: (id: number) => void
}

const BookmarkRow = ({ bookmark, replaceBookmark, removeBookmark }: Props) => {
   const [editing, setEditing] = useState(false)
   const [url, setUrl] = useState(bookmark.url)
   const [title, setTitle] = useState(bookmark.title ?? '')
   const [submitting, setSubmitting] = useState(false)
   const [deleting, setDeleting] = useState(false)
   const [error, setError] = useState<string | null>(null)

   const startEdit = () => {
      setUrl(bookmark.url)
      setTitle(bookmark.title ?? '')
      setError(null)
      setEditing(true)
   }

   const cancelEdit = () => {
      setEditing(false)
      setError(null)
   }

   const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!url.trim()) return

      setSubmitting(true)
      setError(null)

      try {
         const updated = await updateBookmark(bookmark.id, {
            url: url.trim(),
            title: title.trim() || undefined,
         })
         replaceBookmark(updated)
         setEditing(false)
      } catch (error) {
         console.log(error)
         setError('Failed to save')
      } finally {
         setSubmitting(false)
      }
   }

   const handleDelete = async () => {
      setDeleting(true)

      try {
         await deleteBookmark(bookmark.id)
         removeBookmark(bookmark.id)
      } catch (error) {
         console.log(error)
         setError('Failed to delete')
         setDeleting(false)
      }
   }

   if (editing) {
      return (
         <li>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: 6 }}>
               <input
                  type="url"
                  required
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  disabled={submitting}
               />

               <input
                  type="text"
                  placeholder="Title (optional)"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={submitting}
               />

               <div style={{ display: 'flex', gap: 6 }}>
                  <button type="submit" disabled={submitting}>
                     {submitting ? 'Saving…' : 'Save'}
                  </button>

                  <button type="button" onClick={cancelEdit} disabled={submitting}>
                     Cancel
                  </button>
               </div>

               {error && <p style={{ color: 'crimson', margin: 0 }}>{error}</p>}
            </form>
         </li>
      )
   }

   return (
      <li style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
         <a href={bookmark.url} target="_blank" rel="noreferrer">
            {bookmark.title || bookmark.url}
         </a>

         <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={startEdit} disabled={deleting}>
               Edit
            </button>

            <button type="button" onClick={handleDelete} disabled={deleting}>
               {deleting ? 'Deleting…' : 'Delete'}
            </button>
         </div>

         {error && <p style={{ color: 'crimson', margin: 0 }}>{error}</p>}
      </li>
   )
}

export default BookmarkRow
