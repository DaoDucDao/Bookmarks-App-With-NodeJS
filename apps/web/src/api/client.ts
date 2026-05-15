const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:2607'

class ApiError extends Error {
   status: number

   constructor(status: number, message: string) {
      super(message)
      this.status = status
      this.name = 'ApiError'
   }
}

const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
   const res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
         'Content-Type': 'application/json',
         ...options.headers,
      },
   })

   if (!res.ok) {
      let message = `Request failed with status ${res.status}`
      try {
         const body = await res.json()
         if (body?.error) message = body.error
      } catch {
         // body wasn't JSON, keep the default message
      }
      throw new ApiError(res.status, message)
   }

   return res
}

export { apiFetch, ApiError, API_URL }
