import React, { useEffect, useState } from 'react';
import { fetchTags, filterBookmark, type Bookmark, type Tag } from '../api/bookmarks';
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
   const [activeTags, setActiveTags] = useState<string[]>([]);
   const [tags, setTags] = useState<Tag[]>([]);

   const loadBookmarks = async () => {
      try {
         const data = await filterBookmark({
            title: search,
            page,
            limit: PAGE_SIZE,
            tags: activeTags.length > 0 ? activeTags : undefined,
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
   }, [search, page, activeTags]);

   const loadTags = async () => {
      try {
         const data = await fetchTags();
         setTags(data);
      } catch (error) {
         console.log('Failed to load tags', error);
      }
   };

   useEffect(() => {
      loadTags();
   }, []);

   const handleSearchChange = (value: string) => {
      setSearch(value);
      setPage(1);
   };

   const handleTagSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
      setActiveTags(selected);
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
                  loadTags={loadTags}
               />
            ))}
         </ul>
      );
   };

   return (
      <React.Fragment>
         <BookmarkForm loadBookmarks={loadBookmarks} />

         <SearchBar value={search} setValue={handleSearchChange} disabled={loading} />

         {tags.length > 0 && (
            <label className="flex flex-col gap-1 text-sm">
               <span className="text-slate-600 dark:text-slate-400">
                  Filter by tags (Ctrl/Cmd-click for multiple)
               </span>
               <select
                  multiple
                  value={activeTags}
                  onChange={handleTagSelectionChange}
                  size={Math.min(tags.length, 6)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
               >
                  {tags.map((tag) => (
                     <option key={tag.id} value={tag.name}>
                        {tag.name}
                     </option>
                  ))}
               </select>
            </label>
         )}

         {activeTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
               <span className="text-slate-600 dark:text-slate-400">Filtering by:</span>
               {activeTags.map((tag) => (
                  <span
                     key={tag}
                     className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                  >
                     {tag}
                  </span>
               ))}
               <button
                  type="button"
                  onClick={() => {
                     setActiveTags([]);
                     setPage(1);
                  }}
                  className="ml-auto cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
               >
                  Clear
               </button>
            </div>
         )}

         {renderList()}

         <Pagination page={page} totalPages={totalPages} setPage={setPage} disabled={loading} />
      </React.Fragment>
   );
};

export default BookmarksList;
