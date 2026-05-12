import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookmarksList from '../src/Components/BookmarksList'
import * as api from '../src/api/bookmarks'
import type { Bookmark } from '../src/api/bookmarks'

vi.mock('../src/api/bookmarks')

const makeBookmark = (overrides: Partial<Bookmark> = {}): Bookmark => ({
   id: 1,
   url: 'https://example.com',
   title: 'Example',
   is_favorite: 0,
   created_at: '2026-01-01T00:00:00Z',
   ...overrides,
})

const makeResponse = (items: Bookmark[], total?: number) => ({
   items,
   total: total ?? items.length,
   page: 1,
   limit: 10,
})

beforeEach(() => {
   vi.resetAllMocks()
})

describe('BookmarksList', () => {
   it('shows loading initially, then renders bookmarks from the API', async () => {
      vi.mocked(api.filterBookmark).mockResolvedValue(
         makeResponse([
            makeBookmark({ id: 1, title: 'Node.js' }),
            makeBookmark({ id: 2, title: 'Express' }),
         ]),
      )

      render(<BookmarksList />)

      expect(screen.getByRole('status', { name: 'Loading bookmarks' })).toBeInTheDocument()

      expect(await screen.findByText('Node.js')).toBeInTheDocument()
      expect(screen.getByText('Express')).toBeInTheDocument()
   })

   it('shows the empty state when no bookmarks exist', async () => {
      vi.mocked(api.filterBookmark).mockResolvedValue(makeResponse([]))

      render(<BookmarksList />)

      expect(await screen.findByText('No bookmarks yet.')).toBeInTheDocument()
   })

   it('shows an error message when fetching fails', async () => {
      vi.mocked(api.filterBookmark).mockRejectedValue(new Error('boom'))

      render(<BookmarksList />)

      expect(await screen.findByText('Failed to load bookmarks')).toBeInTheDocument()
   })

   it('adds a new bookmark to the list after submitting the form', async () => {
      const user = userEvent.setup()

      vi.mocked(api.filterBookmark)
         .mockResolvedValueOnce(makeResponse([]))
         .mockResolvedValueOnce(
            makeResponse([makeBookmark({ id: 42, url: 'https://new.com', title: 'New One' })]),
         )
      vi.mocked(api.createBookmark).mockResolvedValue(
         makeBookmark({ id: 42, url: 'https://new.com', title: 'New One' }),
      )

      render(<BookmarksList />)

      await screen.findByText('No bookmarks yet.')

      await user.type(screen.getByPlaceholderText('https://example.com'), 'https://new.com')
      await user.type(screen.getByPlaceholderText('Title (optional)'), 'New One')
      await user.click(screen.getByRole('button', { name: 'Add bookmark' }))

      expect(await screen.findByText('New One')).toBeInTheDocument()
      expect(api.createBookmark).toHaveBeenCalledWith({
         url: 'https://new.com',
         title: 'New One',
      })
   })

   it('shows a validation error when the URL is empty', async () => {
      const user = userEvent.setup()

      vi.mocked(api.filterBookmark).mockResolvedValue(makeResponse([]))

      render(<BookmarksList />)

      await screen.findByText('No bookmarks yet.')

      await user.click(screen.getByRole('button', { name: 'Add bookmark' }))

      expect(await screen.findByText('URL is required')).toBeInTheDocument()
      expect(api.createBookmark).not.toHaveBeenCalled()
   })

   it('shows a validation error when the URL is not a valid URL', async () => {
      const user = userEvent.setup()

      vi.mocked(api.filterBookmark).mockResolvedValue(makeResponse([]))

      render(<BookmarksList />)

      await screen.findByText('No bookmarks yet.')

      await user.type(screen.getByPlaceholderText('https://example.com'), 'not a url')
      await user.click(screen.getByRole('button', { name: 'Add bookmark' }))

      expect(await screen.findByText('Please enter a valid URL')).toBeInTheDocument()
      expect(api.createBookmark).not.toHaveBeenCalled()
   })

   it('removes a bookmark when its delete button is clicked', async () => {
      const user = userEvent.setup()

      vi.mocked(api.filterBookmark)
         .mockResolvedValueOnce(makeResponse([makeBookmark({ id: 7, title: 'Doomed' })]))
         .mockResolvedValueOnce(makeResponse([]))
      vi.mocked(api.deleteBookmark).mockResolvedValue(undefined)

      render(<BookmarksList />)

      const link = await screen.findByText('Doomed')
      expect(link).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Delete' }))

      await waitFor(() => expect(screen.queryByText('Doomed')).not.toBeInTheDocument())
      expect(api.deleteBookmark).toHaveBeenCalledWith(7)
   })
})
