type Bookmark = {
   id: number
   url: string
   title: string | null
   created_at: string
}

const API_URL = import.meta.env.VITE_API_URL

const fetchBookmarks = async (): Promise<Bookmark[]> => {
   const res = await fetch(`${API_URL}/bookmarks`)

   if (!res.ok) throw new Error(`request failed with status ${res.status}`)

   return res.json()
}

export { fetchBookmarks }
export type { Bookmark }
