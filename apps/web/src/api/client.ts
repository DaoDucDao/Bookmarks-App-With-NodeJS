const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:2607'

type ApiIssue = {
   path: (string | number)[]
   message: string
}

class ApiError extends Error {
   status: number
   issues?: ApiIssue[]

   constructor(status: number, message: string, issues?: ApiIssue[]) {
      super(message)
      this.status = status
      this.issues = issues
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
      let issues: ApiIssue[] | undefined
      try {
         const body = await res.json()
         if (body?.error) message = body.error
         if (Array.isArray(body?.issues)) issues = body.issues
      } catch {
         // body wasn't JSON, keep the default message
      }
      throw new ApiError(res.status, message, issues)
   }

   return res
}

export { apiFetch, ApiError, API_URL }
export type { ApiIssue }
