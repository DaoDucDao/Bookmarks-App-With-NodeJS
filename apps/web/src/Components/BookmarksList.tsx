import React, { useEffect, useState } from 'react';
import { filterBookmark, type Bookmark } from '../api/bookmarks';
import BookmarkForm from './BookmarkForm';
import BookmarkRow from './BookmarkRow';
import SearchBar from './SearchBar';
import Pagination from './Pagination';

const PAGE_SIZE = 10;

const BookmarksList = () => {
   const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
   const [total, setTotal] = useState(0);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const [search, setSearch] = useState('');
   const [page, setPage] = useState(1);
   const [activeTag, setActiveTag] = useState('');

   const loadBookmarks = async () => {
      try {
         const data = await filterBookmark({
            title: search,
            page,
            limit: PAGE_SIZE,
            tag: activeTag || undefined,
         });
         setBookmarks(data.items);
         setTotal(data.total);
         setError(null);
      } catch (error) {
         console.log(error);
         setError('Failed to load bookmarks');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadBookmarks();
   }, [search, page, activeTag]);

   const handleSearchChange = (value: string) => {
      setSearch(value);
      setPage(1);
   };

   const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

   const renderSkeleton = () => (
      <ul role="status" aria-label="Loading bookmarks" className="grid list-none gap-2 p-0">
         {[1, 2, 3].map((key) => (
            <li
               key={key}
               className="h-12 animate-pulse rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60"
            />
         ))}
      </ul>
   );

   const renderEmpty = () => {
      if (search) {
         return (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
               <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  No matching bookmarks.
               </p>
               <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Try a different search term.
               </p>
            </div>
         );
      }

      return (
         <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
               No bookmarks yet.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
               Add your first one using the form above.
            </p>
         </div>
      );
   };

   const renderList = () => {
      if (loading) return renderSkeleton();
      if (error) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
      if (bookmarks.length === 0) return renderEmpty();

      return (
         <ul className="grid list-none gap-2 p-0">
            {bookmarks.map((bookmark) => (
               <BookmarkRow
                  key={bookmark.id}
                  bookmark={bookmark}
                  loadBookmarks={loadBookmarks}
               />
            ))}
         </ul>
      );
   };

   return (
      <React.Fragment>
         <BookmarkForm loadBookmarks={loadBookmarks} />

         <SearchBar value={search} setValue={handleSearchChange} disabled={loading} />

         {activeTag && (
            <div className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
               <span className="text-slate-600 dark:text-slate-400">Filtering by tag:</span>
               <span className="font-medium text-slate-900 dark:text-slate-100">{activeTag}</span>
               <button
                  type="button"
                  onClick={() => setActiveTag('')}
                  className="ml-auto cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
               >
                  ×
               </button>
            </div>
         )}

         {renderList()}

         <Pagination page={page} totalPages={totalPages} setPage={setPage} disabled={loading} />
      </React.Fragment>
   );
};

export default BookmarksList;
