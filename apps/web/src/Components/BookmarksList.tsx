import React, { useEffect, useState } from 'react'
import { fetchBookmarks, type Bookmark } from '../api/bookmarks'

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

   if (loading) return <p>Loading…</p>
   if (error) return <p style={{ color: 'crimson' }}>{error}</p>
   if (bookmarks.length === 0) return <p>No bookmarks yet.</p>

   return (
      <React.Fragment>
         <h2>Bookmarks</h2>

         <ul>
            {bookmarks.map((bookmark) => (
               <li key={bookmark.id}>
                  <a href={bookmark.url} target="_blank" rel="noreferrer">
                     {bookmark.title || bookmark.url}
                  </a>
               </li>
            ))}
         </ul>
      </React.Fragment>
   )
}

export default BookmarksList
