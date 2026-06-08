import { useState } from 'react'
import { deleteBookmark, setFavourite, type Bookmark } from '../../api/bookmarks'
import Confetti from '../Confetti'

type Props = {
   bookmark: Bookmark
   loadBookmarks: () => Promise<void>
   setEditing: (editing: boolean) => void
}

const favouriteButtonClass =
   'cursor-pointer rounded-md border border-blue-500 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-700/60 dark:text-blue-400 dark:hover:bg-blue-950/40'

const editButtonClass =
   'cursor-pointer rounded-md border border-blue-300 px-3 py-1 text-sm text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-900/60 dark:text-blue-400 dark:hover:bg-blue-950/40'

const deleteButtonClass =
   'cursor-pointer rounded-md border border-red-300 px-3 py-1 text-sm text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40'

const tagChipClass =
   'rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300'

const rowBaseClass =
   'group relative flex animate-row-in items-center justify-between gap-3 overflow-hidden rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md'

const rowNormalClass = 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'

const rowFavouriteClass = 'border-blue-300 bg-blue-200 dark:border-blue-700/60 dark:bg-blue-950/30'

const rowClass = (isFavourite: boolean, leaving: boolean) =>
   `${rowBaseClass} ${isFavourite ? rowFavouriteClass : rowNormalClass} ${leaving ? 'pointer-events-none animate-row-out' : ''}`

const getFaviconUrl = (url: string) => {
   try {
      const { hostname } = new URL(url)
      return `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`
   } catch {
      return null
   }
}

const BookmarkRowDisplay = ({ bookmark, loadBookmarks, setEditing }: Props) => {
   const [deleting, setDeleting] = useState(false)
   const [togglingFavourite, setTogglingFavourite] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const [faviconFailed, setFaviconFailed] = useState(false)
   const [confettiTrigger, setConfettiTrigger] = useState(0)

   const faviconUrl = faviconFailed ? null : getFaviconUrl(bookmark.url)

   const startEdit = () => setEditing(true)

   const handleToggleFavourite = async () => {
      setTogglingFavourite(true)

      try {
         const nextValue = bookmark.is_favorite ? 0 : 1
         await setFavourite(bookmark.id, nextValue)
         await loadBookmarks()
         if (nextValue === 1) setConfettiTrigger((count) => count + 1)
      } catch (error) {
         console.log(error)
         setError('Failed to update favourite')
      } finally {
         setTogglingFavourite(false)
      }
   }

   const handleDelete = async () => {
      setDeleting(true)

      // Let the fade-out animation play before the row unmounts.
      await new Promise((resolve) => setTimeout(resolve, 180))

      try {
         await deleteBookmark(bookmark.id)
         await loadBookmarks()
         // Move keyboard focus to the form so it doesn't fall to <body>.
         document.getElementById('bookmark-form-url')?.focus()
      } catch (error) {
         console.log(error)
         setError('Failed to delete')
         setDeleting(false)
      }
   }

   return (
      <li className={rowClass(Boolean(bookmark.is_favorite), deleting)}>
         <Confetti trigger={confettiTrigger} />

         <div className="flex min-w-0 items-center gap-2">
            {faviconUrl && (
               <img
                  src={faviconUrl}
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 rounded-sm"
                  onError={() => setFaviconFailed(true)}
               />
            )}

            <a
               href={bookmark.url}
               target="_blank"
               rel="noreferrer"
               className="min-w-0 truncate text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
            >
               {bookmark.title || bookmark.url}
            </a>
         </div>

         {bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
               {bookmark.tags.map((tag) => (
                  <span key={tag.id} className={tagChipClass}>
                     {tag.name}
                  </span>
               ))}
            </div>
         )}

         <div className="flex shrink-0 gap-2">
            <button
               type="button"
               onClick={handleToggleFavourite}
               disabled={deleting || togglingFavourite}
               className={favouriteButtonClass}
            >
               {togglingFavourite ? 'Saving…' : bookmark.is_favorite ? 'Remove Favourite' : 'Add Favourite'}
            </button>

            <button type="button" onClick={startEdit} disabled={deleting} className={editButtonClass}>
               Edit
            </button>

            <button
               type="button"
               onClick={handleDelete}
               disabled={deleting}
               className={deleteButtonClass}
            >
               {deleting ? 'Deleting…' : 'Delete'}
            </button>
         </div>

         {error && <p className="m-0 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </li>
   )
}

export default BookmarkRowDisplay
