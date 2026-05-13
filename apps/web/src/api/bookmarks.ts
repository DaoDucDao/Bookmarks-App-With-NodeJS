type Tag = {
   id: number;
   name: string;
};

type Bookmark = {
   id: number;
   url: string;
   title: string | null;
   is_favorite: number;
   tags: Tag[];
   created_at: string;
};

type BookmarkInput = {
   url: string;
   title?: string;
};

type FilterBookmarksResponse = {
   items: Bookmark[];
   total: number;
   page: number;
   limit: number;
};

type FilterBookmarkParams = {
   title?: string;
   page?: number;
   limit?: number;
};

const API_URL = import.meta.env.VITE_API_URL;

const fetchBookmarks = async (): Promise<Bookmark[]> => {
   const res = await fetch(`${API_URL}/bookmarks`);

   if (!res.ok) throw new Error(`request failed with status ${res.status}`);

   return res.json();
};

const createBookmark = async (input: BookmarkInput): Promise<Bookmark> => {
   const res = await fetch(`${API_URL}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
   });

   if (!res.ok) throw new Error(`request failed with status ${res.status}`);

   return res.json();
};

const updateBookmark = async (id: number, input: BookmarkInput): Promise<Bookmark> => {
   const res = await fetch(`${API_URL}/bookmarks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
   });

   if (!res.ok) throw new Error(`request failed with status ${res.status}`);

   return res.json();
};

const deleteBookmark = async (id: number): Promise<void> => {
   const res = await fetch(`${API_URL}/bookmarks/${id}`, { method: 'DELETE' });

   if (!res.ok) throw new Error(`request failed with status ${res.status}`);
};

const setFavourite = async (id: number, is_favorite: 0 | 1): Promise<Bookmark> => {
   const res = await fetch(`${API_URL}/bookmarks/toggle-favourite/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_favorite }),
   });

   if (!res.ok) throw new Error(`request failed with status ${res.status}`);

   return res.json();
};

const addTagToBookmark = async (id: number, name: string): Promise<Bookmark> => {
   const res = await fetch(`${API_URL}/bookmarks/${id}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
   });

   if (!res.ok) throw new Error(`request failed with status ${res.status}`);

   return res.json();
};

const removeTagFromBookmark = async (id: number, tagId: number): Promise<void> => {
   const res = await fetch(`${API_URL}/bookmarks/${id}/tags/${tagId}`, { method: 'DELETE' });

   if (!res.ok) throw new Error(`request failed with status ${res.status}`);
};

const filterBookmark = async (
   params: FilterBookmarkParams = {},
): Promise<FilterBookmarksResponse> => {
   const url = new URL(`${API_URL}/bookmarks/filter`);

   if (params.title) url.searchParams.set('title', params.title);
   if (params.page) url.searchParams.set('page', String(params.page));
   if (params.limit) url.searchParams.set('limit', String(params.limit));

   const res = await fetch(url, { method: 'GET' });

   if (!res.ok) throw new Error(`Request failed with status  ${res.status}`);

   return res.json();
};

export {
   fetchBookmarks,
   createBookmark,
   updateBookmark,
   deleteBookmark,
   filterBookmark,
   setFavourite,
   addTagToBookmark,
   removeTagFromBookmark,
};
export type { Bookmark, BookmarkInput, Tag };
