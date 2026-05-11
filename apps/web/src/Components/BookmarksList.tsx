import React, { useEffect, useState } from 'react'
import { fetchBookmarks, type Bookmark } from '../api/bookmarks'
import BookmarkForm from './BookmarkForm'
import BookmarkRow from './BookmarkRow'

const BookmarksList = () => {
   const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)

   useEffect(() => {
      const load = async () => {
         try {
            const data = await fetchBookmarks()
            setBookmarks(data)
         } catch (error) {
            console.log(error)
            setError('Failed to load bookmarks')
         } finally {
            setLoading(false)
         }
      }

      load()
   }, [])

   const addBookmark = (bookmark: Bookmark) =>
      setBookmarks((prev) => [bookmark, ...prev])

   const replaceBookmark = (bookmark: Bookmark) =>
      setBookmarks((prev) => prev.map((item) => (item.id === bookmark.id ? bookmark : item)))

   const removeBookmark = (id: number) =>
      setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id))

   const renderList = () => {
      if (loading) return <p>Loading…</p>
      if (error) return <p style={{ color: 'crimson' }}>{error}</p>
      if (bookmarks.length === 0) return <p>No bookmarks yet.</p>

      return (
         <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            {bookmarks.map((bookmark) => (
               <BookmarkRow
                  key={bookmark.id}
                  bookmark={bookmark}
                  replaceBookmark={replaceBookmark}
                  removeBookmark={removeBookmark}
               />
            ))}
         </ul>
      )
   }

   return (
      <React.Fragment>
         <BookmarkForm addBookmark={addBookmark} />

         {renderList()}
      </React.Fragment>
   )
}

export default BookmarksList
