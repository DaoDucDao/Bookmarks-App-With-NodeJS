import React, { useState } from 'react'
import { createBookmark, type Bookmark } from '../api/bookmarks'

type Props = {
   addBookmark: (bookmark: Bookmark) => void
}

const BookmarkForm = ({ addBookmark }: Props) => {
   const [url, setUrl] = useState('')
   const [title, setTitle] = useState('')
   const [submitting, setSubmitting] = useState(false)
   const [error, setError] = useState<string | null>(null)

   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!url.trim()) return

      setSubmitting(true)
      setError(null)

      try {
         const created = await createBookmark({ url: url.trim(), title: title.trim() || undefined })
         addBookmark(created)
         setUrl('')
         setTitle('')
      } catch (error) {
         console.log(error)
         setError('Failed to create bookmark')
      } finally {
         setSubmitting(false)
      }
   }

   return (
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
         <input
            type="url"
            required
            placeholder="https://example.com"
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

         <button type="submit" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add bookmark'}
         </button>

         {error && <p style={{ color: 'crimson', margin: 0 }}>{error}</p>}
      </form>
   )
}

export default BookmarkForm
