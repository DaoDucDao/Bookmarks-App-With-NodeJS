import React, { useEffect, useState } from 'react'

type Props = {
   value: string
   setValue: (value: string) => void
   placeholder?: string
   disabled?: boolean
   debounceMs?: number
}

const SearchBar = ({
   value,
   setValue,
   placeholder = 'Search bookmarks…',
   disabled = false,
   debounceMs = 300,
}: Props) => {
   const [inputValue, setInputValue] = useState(value)

   useEffect(() => {
      if (inputValue === value) return

      const timer = setTimeout(() => setValue(inputValue), debounceMs)

      return () => clearTimeout(timer)
   }, [inputValue, value, debounceMs, setValue])

   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value)

   const handleClear = () => {
      setInputValue('')
      setValue('')
   }

   return (
      <div className="relative mb-4">
         <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800"
         />

         {inputValue && (
            <button
               type="button"
               onClick={handleClear}
               aria-label="Clear search"
               className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
               ×
            </button>
         )}
      </div>
   )
}

export default SearchBar
