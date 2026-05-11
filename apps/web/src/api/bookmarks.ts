type Bookmark = {
   id: number
   url: string
   title: string | null
   created_at: string
}

type BookmarkInput = {
   url: string
   title?: string
}

const API_URL = import.meta.env.VITE_API_URL

const fetchBookmarks = async (): Promise<Bookmark[]> => {
   const res = await fetch(`${API_URL}/bookmarks`)

   if (!res.ok) throw new Error(`request failed with status ${res.status}`)

   return res.json()
}

const createBookmark = async (input: BookmarkInput): Promise<Bookmark> => {
   const res = await fetch(`${API_URL}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
   })

   if (!res.ok) throw new Error(`request failed with status ${res.status}`)

   return res.json()
}

const updateBookmark = async (id: number, input: BookmarkInput): Promise<Bookmark> => {
   const res = await fetch(`${API_URL}/bookmarks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
   })

   if (!res.ok) throw new Error(`request failed with status ${res.status}`)

   return res.json()
}

const deleteBookmark = async (id: number): Promise<void> => {
   const res = await fetch(`${API_URL}/bookmarks/${id}`, { method: 'DELETE' })

   if (!res.ok) throw new Error(`request failed with status ${res.status}`)
}

export { fetchBookmarks, createBookmark, updateBookmark, deleteBookmark }
export type { Bookmark, BookmarkInput }
