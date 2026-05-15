import { apiFetch } from './client'

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
   tags?: string[];
};

const fetchTags = async (): Promise<Tag[]> => {
   const res = await apiFetch('/bookmarks/tags')
   return res.json()
}

const createBookmark = async (input: BookmarkInput): Promise<Bookmark> => {
   const res = await apiFetch('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(input),
   })
   return res.json()
}

const updateBookmark = async (id: number, input: BookmarkInput): Promise<Bookmark> => {
   const res = await apiFetch(`/bookmarks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
   })
   return res.json()
}

const deleteBookmark = async (id: number): Promise<void> => {
   await apiFetch(`/bookmarks/${id}`, { method: 'DELETE' })
}

const setFavourite = async (id: number, is_favorite: 0 | 1): Promise<Bookmark> => {
   const res = await apiFetch(`/bookmarks/toggle-favourite/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_favorite }),
   })
   return res.json()
}

const addTagToBookmark = async (id: number, name: string): Promise<Bookmark> => {
   const res = await apiFetch(`/bookmarks/${id}/tags`, {
      method: 'POST',
      body: JSON.stringify({ name }),
   })
   return res.json()
}

const removeTagFromBookmark = async (id: number, tagId: number): Promise<void> => {
   await apiFetch(`/bookmarks/${id}/tags/${tagId}`, { method: 'DELETE' })
}

const filterBookmark = async (
   params: FilterBookmarkParams = {},
): Promise<FilterBookmarksResponse> => {
   const search = new URLSearchParams()

   if (params.title) search.set('title', params.title)
   if (params.tags) for (const t of params.tags) search.append('tag', t)
   if (params.page) search.set('page', String(params.page))
   if (params.limit) search.set('limit', String(params.limit))

   const query = search.toString()
   const res = await apiFetch(`/bookmarks/filter${query ? `?${query}` : ''}`)
   return res.json()
}

export {
   fetchTags,
   createBookmark,
   updateBookmark,
   deleteBookmark,
   filterBookmark,
   setFavourite,
   addTagToBookmark,
   removeTagFromBookmark,
};
export type { Bookmark, BookmarkInput, Tag };
