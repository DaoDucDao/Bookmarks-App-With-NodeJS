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

   const renderSkeleton = () => (
      <ul role="status" aria-label="Loading bookmarks" className="grid list-none gap-2 p-0">
         {[1, 2, 3].map((key) => (
            <li
               key={key}
               className="h-12 animate-pulse rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60"
            />
         ))}
      </ul>
   )

   const renderEmpty = () => (
      <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
         <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No bookmarks yet.</p>
         <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Add your first one using the form above.</p>
      </div>
   )

   const renderList = () => {
      if (loading) return renderSkeleton()
      if (error) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      if (bookmarks.length === 0) return renderEmpty()

      return (
         <ul className="grid list-none gap-2 p-0">
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
